"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AssistantChat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setResponse("");
    const res = await fetch("/api/ai/chat", { method: "POST", body: JSON.stringify({ message, category: "corporate" }) });
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
      <p className="rounded bg-amber-50 p-2 text-xs text-amber-900">AI guidance is informational and not a final substitute for attorney review.</p>
      <textarea className="min-h-32 rounded border p-3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your legal question..." />
      <div className="flex gap-2"><Button onClick={send} disabled={loading}>{loading ? "Typing..." : "Send"}</Button><Button className="bg-gold text-navy">Escalate to Human Consultation</Button></div>
      <article className="min-h-20 rounded border p-3 text-sm whitespace-pre-wrap">{response || "Welcome to DLC AI Assistant. Choose a category and ask your question."}</article>
    </section>
  );
}
