import { NextRequest, NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getCurrentAIUserId } from "@/lib/ai/user";
import { LEGAL_MODES, type LegalMode, streamLegalResponse } from "@/lib/ai/chat";
import { buildLegalSystemPrompt } from "@/lib/ai/legal-prompts";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const RECENT_CONTEXT_LIMIT = 16;
const SUMMARY_THRESHOLD = 24;
const MAX_FILE_CONTEXT = 20000;
const MAX_PASTED_CONTEXT = 20000;

function friendlyError(locale: "ar" | "en") {
  return locale === "ar" ? "تعذر معالجة طلب المساعد حالياً. حاول مرة أخرى." : "Unable to process AI request right now. Please try again.";
}

function serviceUnavailable(locale: "ar" | "en") {
  return locale === "ar" ? "خدمة الذكاء الاصطناعي غير متاحة مؤقتاً. حاول لاحقاً." : "AI service is temporarily unavailable. Please try again later.";
}

function buildConversationSummary(existingSummary: string | null, olderMessages: { role: string; content: string }[]) {
  if (olderMessages.length === 0) return existingSummary;

  const compacted = olderMessages
    .slice(-30)
    .map((message) => `${message.role}: ${message.content.replace(/\s+/g, " ").slice(0, 500)}`)
    .join("\n")
    .slice(0, 6000);

  return [existingSummary, compacted].filter(Boolean).join("\n").slice(-8000);
}

function toChatRole(role: string): "user" | "assistant" {
  return role === "assistant" ? "assistant" : "user";
}

export async function POST(req: NextRequest) {
  let locale: "ar" | "en" = "en";

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI service key is missing. Set OPENAI_API_KEY." }, { status: 503 });
    }

    const body = ((await req.json().catch(() => ({}))) ?? {}) as {
      message?: string;
      category?: string;
      mode?: string;
      locale?: "ar" | "en";
      conversationId?: string;
      jurisdiction?: string;
      uploadedFileId?: string;
      extractedText?: string;
      fileText?: string;
    };

    locale = body.locale === "ar" ? "ar" : "en";
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: locale === "ar" ? "الرسالة مطلوبة." : "Message is required." }, { status: 400 });

    const requestedMode = body.mode ?? body.category;
    const mode: LegalMode = LEGAL_MODES.includes(requestedMode as LegalMode)
      ? (requestedMode as LegalMode)
      : "general_legal_consultation";
    const jurisdiction = body.jurisdiction?.trim() || null;
    const userId = await getCurrentAIUserId();

    const conversation = body.conversationId
      ? await prisma.aIConversation.findFirst({ where: { id: body.conversationId, userId } })
      : await prisma.aIConversation.create({
          data: {
            userId,
            title: message.slice(0, 80),
            category: mode,
            mode,
            jurisdiction,
          },
        });

    if (!conversation) {
      return NextResponse.json({ error: locale === "ar" ? "المحادثة غير موجودة." : "Conversation not found." }, { status: 404 });
    }

    if (jurisdiction !== conversation.jurisdiction || conversation.category !== mode || conversation.mode !== mode) {
      await prisma.aIConversation.update({ where: { id: conversation.id }, data: { jurisdiction, category: mode, mode } });
    }

    const previousMessages = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });

    const olderMessages = previousMessages.length > SUMMARY_THRESHOLD ? previousMessages.slice(0, -RECENT_CONTEXT_LIMIT) : [];
    const recentMessages = previousMessages.slice(-RECENT_CONTEXT_LIMIT);
    const nextSummary = buildConversationSummary(conversation.summary, olderMessages);

    if (olderMessages.length > 0 && nextSummary !== conversation.summary) {
      await prisma.aIConversation.update({ where: { id: conversation.id }, data: { summary: nextSummary } });
    }

    const uploadedFile = body.uploadedFileId
      ? await prisma.aIFile.findFirst({ where: { id: body.uploadedFileId, conversationId: conversation.id, userId } })
      : null;
    const pastedText = (body.extractedText ?? body.fileText)?.trim();
    const fileText = uploadedFile?.extractedText ?? pastedText ?? "";
    const fileContext = fileText
      ? `\n\n[Uploaded contract/document extracted text - use only as provided, do not reveal unnecessary sensitive text]\n${fileText.slice(0, uploadedFile ? MAX_FILE_CONTEXT : MAX_PASTED_CONTEXT)}`
      : "";

    const userMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const systemPrompt = buildLegalSystemPrompt({ locale, mode, jurisdiction: jurisdiction ?? undefined, summary: nextSummary ?? undefined });
    const chatMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map((m) => ({ role: toChatRole(m.role), content: m.content }) satisfies ChatCompletionMessageParam),
      { role: "user", content: `${message}${fileContext}` },
    ];

    let stream;
    try {
      stream = await streamLegalResponse({ messages: chatMessages, category: mode, locale, jurisdiction: jurisdiction ?? undefined });
    } catch (error: unknown) {
      console.error("[ai-chat] failed", error instanceof Error ? error.message : error);
      const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : undefined;
      if (status === 429) return NextResponse.json({ error: serviceUnavailable(locale) }, { status: 503 });
      throw error;
    }

    const encoder = new TextEncoder();
    let fullAssistantReply = "";

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content ?? "";
            if (!text) continue;
            fullAssistantReply += text;
            controller.enqueue(encoder.encode(text));
          }

          if (fullAssistantReply.trim()) {
            await prisma.aIMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: fullAssistantReply } });
          }
          controller.close();
        } catch (error: unknown) {
          console.error("[ai-chat] failed", error instanceof Error ? error.message : error);
          const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : undefined;
          const fallback = status === 429 ? serviceUnavailable(locale) : fullAssistantReply ? "" : friendlyError(locale);
          if (fallback) {
            fullAssistantReply += fallback;
            controller.enqueue(encoder.encode(fallback));
          }
          if (fullAssistantReply.trim()) {
            await prisma.aIMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: fullAssistantReply } });
          }
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Conversation-Id": conversation.id,
        "X-User-Message-Id": userMessage.id,
      },
    });
  } catch (error: unknown) {
    console.error("[ai-chat] failed", error instanceof Error ? error.message : error);
    const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : undefined;
    if (status === 429) return NextResponse.json({ error: serviceUnavailable(locale) }, { status: 503 });
    return NextResponse.json({ error: friendlyError(locale) }, { status: 500 });
  }
}
