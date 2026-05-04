import OpenAI from "openai";
import { buildLegalSystemPrompt } from "@/lib/ai/legal-prompts";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
  defaultHeaders: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "HTTP-Referer": "https://dlcgroup.online",
    "X-Title": "DLC Legal AI",
  },
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing AI API key. Set OPENAI_API_KEY.");
  }

  const safeMode = LEGAL_MODES.includes(category as LegalMode) ? (category as LegalMode) : "general_legal_consultation";

  const completion = await openai.chat.completions.create({
    model: process.env.AI_MODEL || "openai/gpt-4o-mini",
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
