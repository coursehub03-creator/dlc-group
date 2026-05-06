"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Locale = "ar" | "en";
type ChatRole = "user" | "assistant";
type ChatMessage = { id?: string; role: ChatRole; content: string; createdAt?: string };
type UploadedFile = { fileId: string; filename: string; extractedTextPreview: string } | null;

type Conversation = {
  id: string;
  title: string;
  category: string;
  mode?: string | null;
  jurisdiction: string | null;
  updatedAt?: string;
  messages: ChatMessage[];
};

const MODES = [
  "general_legal_consultation",
  "contract_analysis",
  "contract_drafting",
  "case_evaluation",
  "legal_strategy",
  "land_real_estate_dispute",
  "trademark_patent_support",
  "company_monitoring",
] as const;

const JURISDICTIONS = ["", "Algeria", "UAE", "Saudi Arabia", "Qatar", "France", "International", "Other"] as const;

const MODE_LABELS = {
  en: {
    general_legal_consultation: "General Legal Consultation",
    contract_analysis: "Contract Analysis",
    contract_drafting: "Contract Drafting",
    case_evaluation: "Case Evaluation",
    legal_strategy: "Legal Strategy",
    land_real_estate_dispute: "Land / Real Estate Dispute",
    trademark_patent_support: "Trademark / Patent Support",
    company_monitoring: "Company Monitoring",
  },
  ar: {
    general_legal_consultation: "استشارة قانونية عامة",
    contract_analysis: "تحليل العقود",
    contract_drafting: "صياغة العقود",
    case_evaluation: "تقييم القضايا",
    legal_strategy: "استراتيجية قانونية",
    land_real_estate_dispute: "نزاع أراضي / عقار",
    trademark_patent_support: "دعم العلامات / البراءات",
    company_monitoring: "مراقبة الشركات",
  },
} as const;

const JURISDICTION_LABELS: Record<Locale, Record<(typeof JURISDICTIONS)[number], string>> = {
  en: {
    "": "Select jurisdiction",
    Algeria: "Algeria",
    UAE: "UAE",
    "Saudi Arabia": "Saudi Arabia",
    Qatar: "Qatar",
    France: "France",
    International: "International",
    Other: "Other",
  },
  ar: {
    "": "اختر الاختصاص",
    Algeria: "الجزائر",
    UAE: "الإمارات",
    "Saudi Arabia": "السعودية",
    Qatar: "قطر",
    France: "فرنسا",
    International: "دولي",
    Other: "أخرى",
  },
};

const chatCopy = {
  en: {
    send: "Send",
    loading: "Typing",
    disclaimer: "General legal information only. Not a substitute for licensed legal advice.",
    prompt: "Which country or jurisdiction does this matter relate to?",
    jurisdiction: "Jurisdiction",
    mode: "Legal mode",
    upload: "Attach PDF contract",
    uploadHint: "Manual fallback: paste contract or document text here.",
    uploadButton: "Upload & extract",
    uploading: "Extracting PDF...",
    noConversations: "No saved consultations yet.",
    chatError: "Sorry, we couldn't get an AI response right now. Please try again.",
    history: "Saved consultations",
    quick: "Quick prompts",
    placeholder: "Message the legal assistant with facts, dates, jurisdiction, and documents...",
    emptyChat: "Start a secure legal workspace chat. Memory, files, and follow-ups stay inside this conversation.",
    newChat: "New chat",
    retry: "Retry",
    selectedFile: "Selected file",
    uploadedFile: "Attached file",
    preview: "Extracted text preview",
    attachHint: "Upload a PDF, then ask: “Analyze the uploaded contract”.",
    textFallback: "Pasted contract text",
    streamingWarning: "Streaming response in progress. Please wait before sending another message.",
    suggestions: [
      "Analyze the uploaded contract and highlight risks.",
      "Draft an NDA under UAE law.",
      "Evaluate my case based on available evidence.",
      "Help with a land dispute over title and possession.",
      "Plan a legal strategy with deadlines and risks.",
    ],
  },
  ar: {
    send: "إرسال",
    loading: "جارٍ الكتابة",
    disclaimer: "هذه معلومات قانونية عامة وليست بديلاً عن استشارة محامٍ مرخّص.",
    prompt: "ما الدولة أو الاختصاص القضائي المرتبط بهذه المسألة؟",
    jurisdiction: "الدولة/الاختصاص",
    mode: "النمط القانوني",
    upload: "إرفاق عقد PDF",
    uploadHint: "بديل يدوي: الصق نص العقد أو المستند هنا.",
    uploadButton: "رفع واستخراج",
    uploading: "جارٍ استخراج PDF...",
    noConversations: "لا توجد استشارات محفوظة بعد.",
    chatError: "تعذّر الحصول على رد من المساعد حالياً. حاول مرة أخرى.",
    history: "الاستشارات المحفوظة",
    quick: "اقتراحات سريعة",
    placeholder: "راسل المساعد القانوني مع الوقائع والتواريخ والاختصاص والمستندات...",
    emptyChat: "ابدأ مساحة محادثة قانونية آمنة. الذاكرة والملفات والمتابعات تبقى داخل هذه المحادثة.",
    newChat: "محادثة جديدة",
    retry: "إعادة المحاولة",
    selectedFile: "الملف المحدد",
    uploadedFile: "الملف المرفق",
    preview: "معاينة النص المستخرج",
    attachHint: "ارفع ملف PDF ثم اسأل: «حلل العقد المرفق». ",
    textFallback: "نص العقد الملصوق",
    streamingWarning: "الرد المتدفق قيد الإنشاء. يرجى الانتظار قبل إرسال رسالة أخرى.",
    suggestions: [
      "حلل العقد المرفق وحدد المخاطر.",
      "صِغ اتفاقية عدم إفصاح وفق قانون الإمارات.",
      "قيّم قضيتي بناءً على الأدلة المتاحة.",
      "ساعدني في نزاع عقاري حول الملكية والحيازة.",
      "ابنِ استراتيجية قانونية تتضمن المواعيد والمخاطر.",
    ],
  },
} as const;

export function AssistantChat({ locale = "en" }: { locale?: Locale }) {
  const t = chatCopy[locale];
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<(typeof MODES)[number]>("general_legal_consultation");
  const [jurisdiction, setJurisdiction] = useState("");
  const [manualFileText, setManualFileText] = useState("");
  const [history, setHistory] = useState<Conversation[]>([]);
  const [error, setError] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const isRtl = locale === "ar";

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
    formData.append("locale", locale);
    formData.append("mode", mode);
    formData.append("jurisdiction", jurisdiction);
    if (conversationId) formData.append("conversationId", conversationId);

    try {
      const res = await fetch("/api/ai/files", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || t.chatError);
      } else {
        setUploadedFile({ fileId: data.fileId, filename: data.filename, extractedTextPreview: data.extractedTextPreview });
        setConversationId(data.conversationId);
        setShowPreview(false);
        refreshHistory();
      }
    } catch {
      setError(t.chatError);
    } finally {
      setUploadingPdf(false);
    }
  };

  const send = async (overrideMessage?: string) => {
    const outgoingMessage = (overrideMessage ?? message).trim();
    if (!outgoingMessage) return;
    if (loading) {
      setError(t.streamingWarning);
      return;
    }

    setLoading(true);
    setError("");
    setLastMessage(outgoingMessage);
    setMessage("");
    setChatMessages((items) => [...items, { role: "user", content: outgoingMessage }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: outgoingMessage,
          mode,
          category: mode,
          locale,
          jurisdiction,
          conversationId,
          uploadedFileId: uploadedFile?.fileId,
          extractedText: uploadedFile ? undefined : manualFileText,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setChatMessages((items) => items.slice(0, -2));
        setMessage(outgoingMessage);
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
          const chunk = decoder.decode(value, { stream: true });
          setChatMessages((items) => {
            const next = [...items];
            const last = next[next.length - 1];
            if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + chunk };
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
    setManualFileText("");
    setUploadedFile(null);
    setPdfFile(null);
  };

  const selectConversation = (conversation: Conversation) => {
    setConversationId(conversation.id);
    setMode((MODES.includes((conversation.mode ?? conversation.category) as (typeof MODES)[number]) ? conversation.mode ?? conversation.category : "general_legal_consultation") as (typeof MODES)[number]);
    setJurisdiction(conversation.jurisdiction ?? "");
    setChatMessages(conversation.messages.filter((m) => m.role === "user" || m.role === "assistant"));
    setManualFileText("");
    setUploadedFile(null);
    setError("");
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl" dir={isRtl ? "rtl" : "ltr"}>
      <div className="grid min-h-[720px] lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 border-slate-200 bg-slate-950 p-4 text-white lg:border-e">
          <Button onClick={startNewChat} disabled={loading} className="w-full bg-white text-slate-950 hover:bg-slate-100">
            + {t.newChat}
          </Button>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.history}</h3>
            {history.length === 0 ? <p className="rounded-2xl border border-white/10 p-3 text-xs text-slate-400">{t.noConversations}</p> : null}
            <div className="space-y-2">
              {history.map((c) => (
                <button
                  key={c.id}
                  className={`w-full rounded-2xl p-3 text-start text-xs transition ${conversationId === c.id ? "bg-white text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                  onClick={() => selectConversation(c)}
                >
                  <span className="line-clamp-2 font-medium">{c.title}</span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-200">{MODE_LABELS[locale][(MODES.includes((c.mode ?? c.category) as (typeof MODES)[number]) ? c.mode ?? c.category : "general_legal_consultation") as (typeof MODES)[number]]}</span>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-100">{c.jurisdiction || t.jurisdiction}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col bg-slate-50">
          <header className="border-b border-slate-200 bg-white p-4">
            <p className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">{t.disclaimer}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                {t.mode}
                <select className="mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm" value={mode} onChange={(e) => setMode(e.target.value as (typeof MODES)[number])}>
                  {MODES.map((m) => (
                    <option key={m} value={m}>{MODE_LABELS[locale][m]}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                {t.jurisdiction}
                <select className="mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
                  {JURISDICTIONS.map((j) => (
                    <option key={j || "empty"} value={j}>{JURISDICTION_LABELS[locale][j]}</option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          <main className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6" dir={isRtl ? "rtl" : "ltr"}>
              {chatMessages.length === 0 ? (
                <div className="mx-auto mt-16 max-w-xl rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                  <p className="text-lg font-semibold text-slate-900">{t.emptyChat}</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {t.suggestions.slice(0, 4).map((s) => (
                      <button key={s} className="rounded-2xl border border-slate-200 p-3 text-start text-xs text-slate-700 hover:border-slate-400" onClick={() => setMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {chatMessages.map((item, index) => (
                <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] whitespace-pre-wrap rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-sm ${item.role === "user" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
                    {item.content || (item.role === "assistant" && loading ? <TypingIndicator label={t.loading} /> : null)}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
                    {t.upload}
                    <input className="sr-only" type="file" accept=".pdf,application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
                  </label>
                  {pdfFile ? <span className="text-xs text-slate-600">{t.selectedFile}: {pdfFile.name}</span> : <span className="text-xs text-slate-500">{t.attachHint}</span>}
                  <Button type="button" onClick={uploadPdf} disabled={!pdfFile || uploadingPdf || loading} className="rounded-full px-4 py-2 text-xs">
                    {uploadingPdf ? t.uploading : t.uploadButton}
                  </Button>
                </div>
                {uploadedFile ? (
                  <div className="mt-3 rounded-2xl bg-white p-3 text-xs text-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <span>{t.uploadedFile}: <strong>{uploadedFile.filename}</strong></span>
                      <button type="button" className="text-slate-900 underline" onClick={() => setShowPreview((value) => !value)}>{t.preview}</button>
                    </div>
                    {showPreview ? <p className="mt-2 max-h-24 overflow-y-auto whitespace-pre-wrap text-slate-500">{uploadedFile.extractedTextPreview}</p> : null}
                  </div>
                ) : null}
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-700">{t.textFallback}</summary>
                  <textarea className="mt-2 min-h-20 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm" dir={isRtl ? "rtl" : "ltr"} value={manualFileText} onChange={(e) => setManualFileText(e.target.value)} placeholder={t.uploadHint} />
                </details>
              </div>

              {error ? (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                  <span>{error}</span>
                  {lastMessage ? <button type="button" className="font-semibold underline" onClick={() => send(lastMessage)}>{t.retry}</button> : null}
                </div>
              ) : null}

              <div className="flex gap-2">
                <textarea
                  className="min-h-14 flex-1 resize-none rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-slate-400"
                  dir={isRtl ? "rtl" : "ltr"}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder={t.placeholder}
                  disabled={loading}
                />
                <Button onClick={() => send()} disabled={loading || !message.trim()} className="self-end rounded-3xl px-6">
                  {loading ? t.loading : t.send}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-slate-500">
      <span>{label}</span>
      <span className="inline-flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      </span>
    </span>
  );
}
