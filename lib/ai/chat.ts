import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function streamLegalResponse({ message, category, locale }) {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini", // مهم
    messages: [
      {
        role: "system",
        content: "You are a helpful legal assistant.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    stream: true,
  });

  return completion;
}
