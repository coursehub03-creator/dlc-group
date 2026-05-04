"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Locale = "ar" | "en";

type Conversation = {
  id: string;
  title: string;
  category: string;
  jurisdiction: string | null;
  messages: { role: string; content: string }[];
};

const MODES = [
  "general_legal_consultation",
  "contract_analysis",
  "contract_drafting",
  "land_real_estate_dispute",
  "trademark_patent_support",
  "company_monitoring",
  "case_evaluation",
  "legal_strategy",
] as const;

const MODE_LABELS = {
  en: {
    general_legal_consultation: "General Legal Consultation",
    contract_analysis: "Contract Analysis",
    contract_drafting: "Contract Drafting",
    land_real_estate_dispute: "Land / Real Estate Disputes",
    trademark_patent_support: "Trademark / Patent Support",
    company_monitoring: "Company Monitoring",
    case_evaluation: "Case Evaluation",
    legal_strategy: "Legal Strategy",
  },
  ar: {
    general_legal_consultation: "استشارة قانونية عامة",
    contract_analysis: "تحليل العقود",
    contract_drafting: "صياغة العقود",
    land_real_estate_dispute: "منازعات الأراضي / العقار",
    trademark_patent_support: "دعم العلامات / البراءات",
    company_monitoring: "مراقبة الشركات",
    case_evaluation: "تقييم القضايا",
    legal_strategy: "الاستراتيجية القانونية",
  },
} as const;

const chatCopy = {
  en: {
    send: "Send",
    loading: "Typing...",
    disclaimer: "General legal information only. Not a substitute for licensed legal advice.",
    prompt: "Which country or jurisdiction does this matter relate to?",
    jurisdiction: "Jurisdiction",
    mode: "Mode",
    upload: "Upload contract PDF",
    uploadHint: "Or paste extracted contract text manually",
    uploadButton: "Extract text from PDF",
    uploading: "Extracting...",
    noConversations: "No saved consultations yet",
    chatError: "Sorry, we couldn't get an AI response right now. Please try again.",
    history: "Saved consultations",
    quick: "Quick prompts",
    placeholder: "Describe your legal matter with facts, dates, and documents...",
    suggestions: [
      "Analyze this contract and highlight risks.",
      "Draft an NDA under UAE law.",
      "Evaluate my case based on available evidence.",
      "Help with a land dispute over title and possession.",
      "Plan a legal strategy with deadlines and risks.",
    ],
  },
  ar: {
    send: "إرسال",
    loading: "جارٍ الكتابة...",
    disclaimer: "هذه معلومات قانونية عامة وليست بديلاً عن استشارة محامٍ مرخّص.",
    prompt: "Which country or jurisdiction does this matter relate to?",
    jurisdiction: "الدولة/الاختصاص",
    mode: "النمط",
    upload: "رفع عقد PDF",
    uploadHint: "أو الصق نص العقد يدوياً",
    uploadButton: "استخراج النص من PDF",
    uploading: "جارٍ الاستخراج...",
    noConversations: "لا توجد استشارات محفوظة بعد",
    chatError: "تعذّر الحصول على رد من المساعد حالياً. حاول مرة أخرى.",
    history: "الاستشارات المحفوظة",
    quick: "اقتراحات سريعة",
    placeholder: "اشرح المسألة القانونية مع الوقائع والتواريخ والمستندات...",
    suggestions: [
      "حلّل هذا العقد وحدد المخاطر.",
      "صِغ اتفاقية عدم إفصاح وفق قانون دولة محددة.",
      "قيّم قضيتي بناءً على الأدلة المتاحة.",
      "ساعدني في نزاع عقاري حول الملكية والحيازة.",
      "ابنِ استراتيجية قانونية تتضمن المواعيد والمخاطر.",
    ],
  },
} as const;

export function AssistantChat({ locale = "en" }: { locale?: Locale }) {
  const t = useMemo(() => chatCopy[locale], [locale]);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mode, setMode] = useState<(typeof MODES)[number]>("general_legal_consultation");
  const [jurisdiction, setJurisdiction] = useState("");
  const [fileText, setFileText] = useState("");
  const [history, setHistory] = useState<Conversation[]>([]);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    fetch("/api/ai/conversations")
      .then((r) => r.json())
      .then((d) => setHistory(d.conversations ?? []))
      .catch(() => setHistory([]));
  }, [response]);

  const uploadPdf = async () => {
    if (!pdfFile) return;
    if (pdfFile.type !== "application/pdf" && !pdfFile.name.toLowerCase().endsWith(".pdf")) {
      setError(locale === "ar" ? "يرجى رفع ملف PDF فقط." : "Please upload a PDF file only.");
      return;
    }
    if (pdfFile.size > 10 * 1024 * 1024) {
      setError(locale === "ar" ? "حجم ملف PDF يجب ألا يتجاوز 10MB." : "PDF size must be 10MB or less.");
      return;
    }

    setUploadingPdf(true);
    setError("");
    const formData = new FormData();
    formData.append("file", pdfFile);
    const res = await fetch("/api/ai/pdf-extract", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t.chatError);
    } else {
      setFileText(data.text || "");
    }
    setUploadingPdf(false);
  };

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResponse("");
    setError("");
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, category: mode, locale, jurisdiction, conversationId, fileText }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error || t.chatError);
      setLoading(false);
      return;
    }

    const nextConversationId = res.headers.get("X-Conversation-Id");
    if (nextConversationId) setConversationId(nextConversationId);

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponse((s) => s + decoder.decode(value));
      }
    }

    setLoading(false);
  };

  return (
    <section className="grid gap-4 rounded-lg border bg-white p-4">
      <p className="rounded bg-amber-50 p-3 text-xs text-amber-900">{t.disclaimer}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          {t.mode}
          <select className="mt-1 w-full rounded border p-2" value={mode} onChange={(e) => setMode(e.target.value as (typeof MODES)[number])}>
            {MODES.map((m) => (
              <option key={m} value={m}>{MODE_LABELS[locale][m]}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t.jurisdiction}
          <input className="mt-1 w-full rounded border p-2" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder={t.prompt} />
        </label>
      </div>
      {mode === "contract_analysis" && (
        <div className="space-y-2 rounded border p-3">
          <label className="text-sm font-medium">{t.upload}</label>
          <input type="file" accept=".pdf,application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
          {pdfFile ? <p className="text-xs text-slate-600">{pdfFile.name}</p> : null}
          <Button onClick={uploadPdf} disabled={!pdfFile || uploadingPdf}>{uploadingPdf ? t.uploading : t.uploadButton}</Button>
          <textarea className="min-h-24 w-full rounded border p-3" dir={locale === "ar" ? "rtl" : "ltr"} value={fileText} onChange={(e) => setFileText(e.target.value)} placeholder={t.uploadHint} />
        </div>
      )}
      <textarea className="min-h-32 rounded border p-3" dir={locale === "ar" ? "rtl" : "ltr"} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.placeholder} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <Button onClick={send} disabled={loading}>{loading ? t.loading : t.send}</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="min-h-20 whitespace-pre-wrap rounded border p-3 text-sm md:col-span-2" dir={locale === "ar" ? "rtl" : "ltr"}>{response || t.prompt}</article>
        <aside className="space-y-3 rounded border p-3">
          <h3 className="text-sm font-semibold">{t.quick}</h3>
          {t.suggestions.map((s) => <button key={s} className="block text-left text-xs text-slate-700" onClick={() => setMessage(s)}>{s}</button>)}
          <h3 className="pt-2 text-sm font-semibold">{t.history}</h3>
          {history.length === 0 ? <p className="text-xs text-slate-500">{t.noConversations}</p> : null}
          {history.slice(0, 6).map((c) => <button key={c.id} className="block text-left text-xs text-slate-600" onClick={() => { setConversationId(c.id); setMode((c.category as (typeof MODES)[number]) || "general_legal_consultation"); setJurisdiction(c.jurisdiction ?? ""); setResponse(c.messages.map((m) => `${m.role}: ${m.content}`).join("\n\n")); }}>{c.title}</button>)}
        </aside>
      </div>
    </section>
  );
}
