import { NextRequest } from "next/server";
import { streamLegalResponse } from "@/lib/ai/chat";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stream = await streamLegalResponse({ message: body.message, category: body.category ?? "corporate" });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });
  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
