import OpenAI from "openai";
import { baseSystemPrompt, categoryTone } from "@/config/ai-prompts";
import { formatKnowledgeContext, retrieveRelevantLegalKnowledge } from "@/lib/ai/legal-knowledge";

export const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function streamLegalResponse(input: {
  message: string;
  category: string;
  locale: "ar" | "en";
}) {
  const snippets = await retrieveRelevantLegalKnowledge({
    message: input.message,
    category: input.category,
    locale: input.locale
  });

  const prompt = `${baseSystemPrompt}\nCategory tone: ${categoryTone[input.category] ?? "Professional"}\nLanguage: ${input.locale}\nKnowledge context:\n${formatKnowledgeContext(snippets)}`;

  return client.chat.completions.create({
    model: "gpt-4.1-mini",
    stream: true,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: input.message }
    ]
  });
}
