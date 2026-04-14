import { SiteShell } from "@/components/layout/site-shell";
import { AssistantChat } from "@/components/ai/assistant-chat";

export default function AIAssistantPage() {
  return <SiteShell><section className="mx-auto max-w-5xl px-4 py-16"><h1 className="text-3xl font-semibold">AI Legal Assistant</h1><p className="mt-2 text-slate-600">Streaming, multilingual assistant with legal safeguards.</p><div className="mt-6"><AssistantChat /></div></section></SiteShell>;
}
