"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Locale = "ar" | "en";

const chatCopy = {
  en: {
    placeholder: "Describe your legal question...",
    send: "Send",
    loading: "Typing...",
    escalate: "Escalate to Human Legal Expert",
    welcome: "Welcome to DLC AI Assistant. Ask your question in English or Arabic.",
    disclaimer:
      "Important: This AI provides general legal information only and does not issue binding legal rulings. For jurisdiction-specific or high-risk matters, escalate to a licensed lawyer.",
    ack: "I understand and want to continue"
  },
  ar: {
    placeholder: "اكتب سؤالك القانوني...",
    send: "إرسال",
    loading: "جارٍ الكتابة...",
    escalate: "التصعيد إلى خبير قانوني بشري",
    welcome: "مرحباً بك في المساعد القانوني الذكي. يمكنك السؤال بالعربية أو الإنجليزية.",
    disclaimer:
      "تنبيه مهم: هذا المساعد يقدم معلومات قانونية عامة فقط ولا يصدر أحكاماً قانونية ملزمة. في المسائل عالية المخاطر أو الخاصة بولاية قضائية محددة، يُرجى التصعيد إلى محامٍ مرخّص.",
    ack: "أفهم ذلك وأرغب بالمتابعة"
  }
} as const;

export function AssistantChat({ locale = "en" }: { locale?: Locale }) {
  const t = useMemo(() => chatCopy[locale], [locale]);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResponse("");

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        category: "corporate",
        locale,
        conversationId
      })
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
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={acceptedDisclaimer}
          onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
        />
        <span>{t.ack}</span>
      </label>
      <textarea
        className="min-h-32 rounded border p-3"
        dir={locale === "ar" ? "rtl" : "ltr"}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t.placeholder}
      />
      <div className="flex gap-2">
        <Button onClick={send} disabled={loading || !acceptedDisclaimer}>
          {loading ? t.loading : t.send}
        </Button>
        <Button className="bg-gold text-navy">{t.escalate}</Button>
      </div>
      <article className="min-h-20 whitespace-pre-wrap rounded border p-3 text-sm" dir={locale === "ar" ? "rtl" : "ltr"}>
        {response || t.welcome}
      </article>
    </section>
  );
}
