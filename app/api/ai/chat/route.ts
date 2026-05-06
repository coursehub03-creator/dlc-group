import { NextRequest, NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { LEGAL_MODES, type LegalMode, streamLegalResponse } from "@/lib/ai/chat";
import { buildLegalSystemPrompt } from "@/lib/ai/legal-prompts";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export const runtime = "nodejs";

async function getOrCreateGuestUserId() {
  const guestUser = await prisma.user.upsert({
    where: { email: "ai-guest@dlc.local" },
    update: {},
    create: {
      email: "ai-guest@dlc.local",
      name: "AI Guest User",
      passwordHash:
        "scrypt:55ac2bdb81e720f150b0326f03d22407:d570fc9a2a07f996c28a5e776e48d6ec85853c9ff5d83a9bf07ad5ad6ed1419a926e4cde7cf90d27f581066751ef9b53d3c71ed663f2b3d07fdb2379a0a31551",
    },
  });

  return guestUser.id;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI service key is missing. Set OPENAI_API_KEY." }, { status: 503 });
    }

    const body = ((await req.json().catch(() => ({}))) ?? {}) as {
      message?: string;
      category?: string;
      locale?: "ar" | "en";
      conversationId?: string;
      jurisdiction?: string;
      fileText?: string;
    };

    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const locale = body.locale === "ar" ? "ar" : "en";
    const category: LegalMode = LEGAL_MODES.includes(body.category as LegalMode)
      ? (body.category as LegalMode)
      : "general_legal_consultation";

    const jurisdiction = body.jurisdiction?.trim() || null;
    const session = await auth();
    const userId = session?.user?.id || (await getOrCreateGuestUserId());

    const conversation = body.conversationId
      ? await prisma.aIConversation.findFirst({ where: { id: body.conversationId, userId } })
      : await prisma.aIConversation.create({
          data: {
            userId,
            title: message.slice(0, 80),
            category,
            jurisdiction,
          },
        });

    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

    if (jurisdiction && conversation.jurisdiction !== jurisdiction) {
      await prisma.aIConversation.update({ where: { id: conversation.id }, data: { jurisdiction, category } });
    } else if (conversation.category !== category) {
      await prisma.aIConversation.update({ where: { id: conversation.id }, data: { category } });
    }

    const previousMessages = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });
    const currentUserContent = body.fileText
      ? `${message}\n\n[Uploaded contract/document extracted text]\n${body.fileText.slice(0, 20000)}`
      : message;
    const chatMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: buildLegalSystemPrompt({ locale, mode: category, jurisdiction: jurisdiction ?? undefined }) },
      ...previousMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }) satisfies ChatCompletionMessageParam),
      {
        role: "user",
        content: currentUserContent,
      },
    ];

    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    let stream;
    try {
      stream = await streamLegalResponse({ messages: chatMessages, category, locale, jurisdiction: jurisdiction ?? undefined });
    } catch (error: unknown) {
      console.error("[ai-chat] failed", error);
      const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : undefined;
      if (status === 429) {
        return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again later." }, { status: 503 });
      }

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
            await prisma.aIMessage.create({
              data: { conversationId: conversation.id, role: "assistant", content: fullAssistantReply },
            });
          }

          controller.close();
        } catch (error: unknown) {
          console.error("[ai-chat] failed", error);
          const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : undefined;
          if (status === 429) {
            const friendlyMessage = "AI service is temporarily unavailable. Please try again later.";
            fullAssistantReply += friendlyMessage;
            controller.enqueue(encoder.encode(friendlyMessage));
            await prisma.aIMessage.create({
              data: { conversationId: conversation.id, role: "assistant", content: fullAssistantReply },
            });
            controller.close();
            return;
          }

          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error: unknown) {
    console.error("[ai-chat] failed", error);
    const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : undefined;

    if (status === 429) {
      return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again later." }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process AI request right now. Please try again." },
      { status: 500 },
    );
  }
}
