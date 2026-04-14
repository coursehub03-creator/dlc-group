import OpenAI from "openai";
import { baseSystemPrompt, categoryTone } from "@/config/ai-prompts";

export const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function streamLegalResponse(input: { message: string; category: string }) {
  const prompt = `${baseSystemPrompt}\nCategory tone: ${categoryTone[input.category] ?? "Professional"}`;
  return client.chat.completions.create({
    model: "gpt-4.1-mini",
    stream: true,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: input.message }
    ]
  });
}
