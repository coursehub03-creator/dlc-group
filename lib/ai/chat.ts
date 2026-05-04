import OpenAI from "openai";
import { buildLegalSystemPrompt } from "@/lib/ai/legal-prompts";

const isOpenRouter = Boolean(process.env.OPENROUTER_API_KEY) && !process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  ...(isOpenRouter
    ? {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://dlcgroup.online",
          "X-Title": "DLC Group",
        },
      }
    : {}),
});

export const LEGAL_MODES = [
  "general_legal_consultation",
  "contract_analysis",
  "contract_drafting",
  "land_real_estate_dispute",
  "trademark_patent_support",
  "company_monitoring",
  "case_evaluation",
  "legal_strategy",
] as const;

export type LegalMode = (typeof LEGAL_MODES)[number];

type StreamLegalResponseInput = {
  message: string;
  category?: string;
  locale?: "ar" | "en";
  jurisdiction?: string;
  fileText?: string;
};

export async function streamLegalResponse({
  message,
  category = "general_legal_consultation",
  locale = "en",
  jurisdiction,
  fileText,
}: StreamLegalResponseInput) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing AI API key. Set OPENAI_API_KEY or OPENROUTER_API_KEY.");
  }

  const safeMode = LEGAL_MODES.includes(category as LegalMode) ? (category as LegalMode) : "general_legal_consultation";

  const completion = await openai.chat.completions.create({
    model: process.env.AI_MODEL || (isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini"),
    messages: [
      { role: "system", content: buildLegalSystemPrompt({ locale, mode: safeMode, jurisdiction }) },
      {
        role: "user",
        content: fileText
          ? `${message}\n\n[Uploaded contract/document extracted text]\n${fileText.slice(0, 20000)}`
          : message,
      },
    ],
    stream: true,
  });

  return completion;
}
