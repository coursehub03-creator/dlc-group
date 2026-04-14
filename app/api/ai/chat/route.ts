import { NextRequest } from "next/server";
import { streamLegalResponse } from "@/lib/ai/chat";
import { prisma } from "@/lib/db/prisma";

async function getOrCreateGuestUserId() {
  const guestUser = await prisma.user.upsert({
    where: { email: "ai-guest@dlc.local" },
    update: {},
    create: {
      email: "ai-guest@dlc.local",
      name: "AI Guest User"
    }
  });

  return guestUser.id;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    message?: string;
    category?: string;
    locale?: "ar" | "en";
    conversationId?: string;
  };

  const message = body.message?.trim();
  if (!message) {
    return new Response("Message is required.", { status: 400 });
  }

  const locale = body.locale === "ar" ? "ar" : "en";
  const category = body.category ?? "corporate";
  const userId = await getOrCreateGuestUserId();

  const conversation = body.conversationId
    ? await prisma.aIConversation.findUnique({ where: { id: body.conversationId } })
    : await prisma.aIConversation.create({
        data: {
          userId,
          title: message.slice(0, 80),
          category
        }
      });

  if (!conversation) {
    return new Response("Conversation not found.", { status: 404 });
  }

  await prisma.aIMessage.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message
    }
  });

  const stream = await streamLegalResponse({ message, category, locale });
  const encoder = new TextEncoder();
  let fullAssistantReply = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        fullAssistantReply += text;
        controller.enqueue(encoder.encode(text));
      }

      if (fullAssistantReply.trim()) {
        await prisma.aIMessage.create({
          data: {
            conversationId: conversation.id,
            role: "assistant",
            content: fullAssistantReply
          }
        });
      }

      controller.close();
    }
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversation.id
    }
  });
}
