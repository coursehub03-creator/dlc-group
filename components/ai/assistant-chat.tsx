"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Locale = "ar" | "en";
type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

type Conversation = {
  id: string;
  title: string;
  category: string;
  jurisdiction: string | null;
  messages: ChatMessage[];
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
    emptyChat: "Start a conversation with the AI legal assistant. Your messages will stay in this chat.",
    newChat: "New chat",
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
    prompt: "ما الدولة أو الاختصاص القضائي المرتبط بهذه المسألة؟",
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
    emptyChat: "ابدأ محادثة مع المساعد القانوني. ستبقى رسائلك محفوظة في هذه المحادثة.",
    newChat: "محادثة جديدة",
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mode, setMode] = useState<(typeof MODES)[number]>("general_legal_consultation");
  const [jurisdiction, setJurisdiction] = useState("");
  const [fileText, setFileText] = useState("");
  const [history, setHistory] = useState<Conversation[]>([]);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const refreshHistory = useCallback(() => {
    fetch("/api/ai/conversations")
      .then((r) => r.json())
      .then((d) => setHistory(d.conversations ?? []))
      .catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, loading]);

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
    const outgoingMessage = message.trim();
    if (!outgoingMessage || loading) return;

    setLoading(true);
    setError("");
    setMessage("");
    setChatMessages((items) => [...items, { role: "user", content: outgoingMessage }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: outgoingMessage, category: mode, locale, jurisdiction, conversationId, fileText }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setChatMessages((items) => items.slice(0, -1));
        setError(payload.error || t.chatError);
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
          const chunk = decoder.decode(value);
          setChatMessages((items) => {
            const next = [...items];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = { ...last, content: last.content + chunk };
            }
            return next;
          });
        }
      }

      refreshHistory();
    } catch {
      setChatMessages((items) => items.slice(0, -1));
      setError(t.chatError);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setChatMessages([]);
    setMessage("");
    setError("");
    setFileText("");
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="flex h-[28rem] flex-col gap-3 overflow-y-auto rounded border bg-slate-50 p-3" dir={locale === "ar" ? "rtl" : "ltr"}>
            {chatMessages.length === 0 ? <p className="m-auto max-w-sm text-center text-sm text-slate-500">{t.emptyChat}</p> : null}
            {chatMessages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm ${item.role === "user" ? "bg-slate-900 text-white" : "border bg-white text-slate-800"}`}>
                  {item.content || (item.role === "assistant" && loading ? t.loading : "")}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-3 grid gap-2">
            <textarea className="min-h-28 rounded border p-3" dir={locale === "ar" ? "rtl" : "ltr"} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.placeholder} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-2">
              <Button onClick={send} disabled={loading || !message.trim()}>{loading ? t.loading : t.send}</Button>
              <Button type="button" className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50" onClick={startNewChat} disabled={loading}>{t.newChat}</Button>
            </div>
          </div>
        </div>
        <aside className="space-y-3 rounded border p-3">
          <h3 className="text-sm font-semibold">{t.quick}</h3>
          {t.suggestions.map((s) => <button key={s} className="block text-left text-xs text-slate-700" onClick={() => setMessage(s)}>{s}</button>)}
          <h3 className="pt-2 text-sm font-semibold">{t.history}</h3>
          {history.length === 0 ? <p className="text-xs text-slate-500">{t.noConversations}</p> : null}
          {history.slice(0, 6).map((c) => (
            <button
              key={c.id}
              className="block text-left text-xs text-slate-600"
              onClick={() => {
                setConversationId(c.id);
                setMode((c.category as (typeof MODES)[number]) || "general_legal_consultation");
                setJurisdiction(c.jurisdiction ?? "");
                setChatMessages(c.messages.filter((m) => m.role === "user" || m.role === "assistant"));
                setError("");
              }}
            >
              {c.title}
            </button>
          ))}
        </aside>
      </div>
    </section>
  );
}
