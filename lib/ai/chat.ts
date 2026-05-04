import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://dlcgroup.online",
    "X-Title": "DLC Group",
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

function buildSystemPrompt(locale: "ar" | "en", category: string, jurisdiction?: string) {
  if (locale === "ar") {
    return `أنت مستشار قانوني ذكي محترف لمنصة SaaS قانونية متعددة اللغات.
النمط: هادئ، دقيق، مهني، بدون مبالغة أو وعود بنتائج.
الوضع الحالي: ${category}.
الاختصاص القضائي: ${jurisdiction ?? "غير محدد"}.

قواعد إلزامية:
1) فرّق دائماً بين "معلومات قانونية عامة" و"استشارة قانونية نهائية".
2) لا تعطِ رأياً قانونياً ملزماً أو تأكيداً قطعياً للنتيجة.
3) إذا نقصت بيانات أساسية، ابدأ بأسئلة توضيحية قبل التحليل.
4) إذا لم يتم تحديد الدولة/الاختصاص، اسأل حرفياً: "Which country or jurisdiction does this matter relate to?"
5) لا تختلق قوانين أو مواد نظامية. إذا لم تكن متأكداً، اذكر أن الأمر يحتاج تحققاً قانونياً محلياً.
6) في المسائل الحساسة، أوصِ بمراجعة محامٍ مرخّص.

عند وجود بيانات كافية، نظّم الرد بالأقسام التالية:
- ملخص
- الإشكال القانوني
- المعلومات المطلوبة
- الخيارات الممكنة
- المخاطر
- الخطوات الموصى بها

وفي وضع تحليل العقد، أضف:
- ملخص الوثيقة
- الأطراف
- الالتزامات
- المواعيد النهائية
- البنود المبهمة
- الشروط غير المتوازنة
- البنود الناقصة
- التعديلات المقترحة
- أسئلة للمراجعة مع محامٍ

اختم دائماً بتنبيه موجز: هذه معلومات قانونية عامة وليست بديلاً عن استشارة محامٍ مرخّص.`;
  }

  return `You are a premium legal AI assistant for a multilingual legal consulting SaaS platform.
Style: calm, precise, lawyer-like, professional, and clear.
Current mode: ${category}.
Jurisdiction context: ${jurisdiction ?? "not provided"}.

Mandatory rules:
1) Clearly distinguish general legal information from formal legal advice.
2) Do not give binding legal opinions or guaranteed outcomes.
3) Ask clarifying questions first when key facts are missing.
4) If jurisdiction is missing, ask exactly: "Which country or jurisdiction does this matter relate to?"
5) Never invent laws or citations; if uncertain, state that verification is required.
6) Recommend consulting a licensed lawyer for sensitive/high-risk matters.

When sufficient facts are available, structure every answer using:
- Summary
- Legal issue
- Required information
- Possible options
- Risks
- Recommended next steps

For contract analysis mode, also include:
- Document summary
- Parties
- Obligations
- Deadlines
- Vague clauses
- Unfavorable terms
- Missing clauses
- Recommended changes
- Questions for lawyer review

Always end with a short disclaimer that this is general legal information and not a substitute for legal advice from a licensed lawyer.`;
}

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

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: buildSystemPrompt(locale, category, jurisdiction) },
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
