import { NextRequest, NextResponse } from "next/server";
import { LEGAL_MODES, streamLegalResponse } from "@/lib/ai/chat";
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
    if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "AI service key is missing. Set OPENAI_API_KEY or OPENROUTER_API_KEY." }, { status: 503 });
    }

    const body = (await req.json()) as {
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
    const category = LEGAL_MODES.includes(body.category as never)
      ? (body.category as string)
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
      await prisma.aIConversation.update({ where: { id: conversation.id }, data: { jurisdiction } });
    }

    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const stream = await streamLegalResponse({ message, category, locale, jurisdiction: jurisdiction ?? undefined, fileText: body.fileText });
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
        } catch (error) {
          console.error("[ai-chat] failed", error);
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
  } catch (error) {
    console.error("[ai-chat] failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process AI request right now. Please try again." },
      { status: 500 },
    );
  }
}
