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

const chatCopy = {
  en: {
    send: "Send",
    loading: "Typing...",
    disclaimer: "General legal information only. Not a substitute for licensed legal advice.",
    prompt: "Which country or jurisdiction does this matter relate to?",
    jurisdiction: "Jurisdiction",
    mode: "Mode",
    upload: "Upload contract PDF (scaffold: paste extracted text)",
    history: "Saved consultations",
    quick: "Quick prompts",
    placeholder: "Describe your legal matter with facts, dates, and documents...",
    suggestions: [
      "Analyze this contract",
      "Draft a non-disclosure agreement",
      "Evaluate a land dispute",
      "What documents do I need for trademark registration?",
      "Build a legal strategy for my case",
    ],
  },
  ar: {
    send: "إرسال",
    loading: "جارٍ الكتابة...",
    disclaimer: "هذه معلومات قانونية عامة وليست بديلاً عن استشارة محامٍ مرخّص.",
    prompt: "Which country or jurisdiction does this matter relate to?",
    jurisdiction: "الدولة/الاختصاص",
    mode: "النمط",
    upload: "رفع عقد PDF (نموذج أولي: الصق النص المستخرج)",
    history: "الاستشارات المحفوظة",
    quick: "اقتراحات سريعة",
    placeholder: "اشرح المسألة القانونية مع الوقائع والتواريخ والمستندات...",
    suggestions: [
      "Analyze this contract",
      "Draft a non-disclosure agreement",
      "Evaluate a land dispute",
      "What documents do I need for trademark registration?",
      "Build a legal strategy for my case",
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

  useEffect(() => {
    fetch("/api/ai/conversations")
      .then((r) => r.json())
      .then((d) => setHistory(d.conversations ?? []))
      .catch(() => setHistory([]));
  }, [response]);

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResponse("");
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, category: mode, locale, jurisdiction, conversationId, fileText }),
    });

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
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t.jurisdiction}
          <input className="mt-1 w-full rounded border p-2" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder={t.prompt} />
        </label>
      </div>
      <textarea className="min-h-24 rounded border p-3" dir={locale === "ar" ? "rtl" : "ltr"} value={fileText} onChange={(e) => setFileText(e.target.value)} placeholder={t.upload} />
      <textarea className="min-h-32 rounded border p-3" dir={locale === "ar" ? "rtl" : "ltr"} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.placeholder} />
      <div className="flex gap-2">
        <Button onClick={send} disabled={loading}>{loading ? t.loading : t.send}</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="min-h-20 whitespace-pre-wrap rounded border p-3 text-sm md:col-span-2" dir={locale === "ar" ? "rtl" : "ltr"}>{response || t.prompt}</article>
        <aside className="space-y-3 rounded border p-3">
          <h3 className="text-sm font-semibold">{t.quick}</h3>
          {t.suggestions.map((s) => <button key={s} className="block text-left text-xs text-slate-700" onClick={() => setMessage(s)}>{s}</button>)}
          <h3 className="pt-2 text-sm font-semibold">{t.history}</h3>
          {history.slice(0, 6).map((c) => <button key={c.id} className="block text-left text-xs text-slate-600" onClick={() => { setConversationId(c.id); setMode((c.category as (typeof MODES)[number]) || "general_legal_consultation"); setJurisdiction(c.jurisdiction ?? ""); setResponse(c.messages.map((m) => `${m.role}: ${m.content}`).join("\n\n")); }}>{c.title}</button>)}
        </aside>
      </div>
    </section>
  );
}
