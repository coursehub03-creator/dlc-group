import { NextRequest, NextResponse } from "next/server";
import { streamLegalResponse } from "@/lib/ai/chat";
import { prisma } from "@/lib/db/prisma";

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
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      message?: string;
      category?: string;
      locale?: "ar" | "en";
      conversationId?: string;
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const locale = body.locale === "ar" ? "ar" : "en";
    const category = body.category ?? "corporate";
    const userId = await getOrCreateGuestUserId();

    const conversation = body.conversationId
      ? await prisma.aIConversation.findUnique({
          where: { id: body.conversationId },
        })
      : await prisma.aIConversation.create({
          data: {
            userId,
            title: message.slice(0, 80),
            category,
          },
        });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const stream = await streamLegalResponse({ message, category, locale });
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
              data: {
                conversationId: conversation.id,
                role: "assistant",
                content: fullAssistantReply,
              },
            });
          }

          controller.close();
        } catch (error) {
          console.error("AI stream error:", error);
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
    console.error("POST /api/ai/chat error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
