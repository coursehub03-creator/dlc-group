import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://dlcgroup.online",
    "X-Title": "DLC Group",
  },
});

type StreamLegalResponseInput = {
  message: string;
  category?: string;
  locale?: "ar" | "en";
};

export async function streamLegalResponse({
  message,
  category,
  locale,
}: StreamLegalResponseInput) {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          locale === "ar"
            ? "أنت مساعد قانوني ذكي. قدم معلومات قانونية عامة فقط، ولا تقدم أحكامًا قانونية ملزمة، واطلب من المستخدم مراجعة محامٍ مرخص للمسائل الحساسة."
            : "You are a legal AI assistant. Provide general legal guidance only, do not provide binding legal rulings, and advise consulting a licensed lawyer for sensitive matters.",
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