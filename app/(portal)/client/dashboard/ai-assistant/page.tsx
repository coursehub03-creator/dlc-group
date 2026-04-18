import { AssistantChat } from "@/components/ai/assistant-chat";
import { parseDashboardLocale, requireDashboardUser } from "../lib/server-utils";

const copy = {
  en: {
    title: "AI Legal Assistant",
    subtitle:
      "Use the assistant inside your client workspace to draft questions, understand legal concepts, and escalate to your legal team when needed."
  },
  ar: {
    title: "المساعد القانوني الذكي",
    subtitle: "استخدم المساعد داخل مساحة العميل لصياغة الأسئلة وفهم المفاهيم القانونية والتصعيد لفريقك القانوني عند الحاجة."
  }
} as const;

export default async function ClientAIAssistantPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  await requireDashboardUser();

  const params = (await searchParams) ?? {};
  const locale = parseDashboardLocale(params);
  const t = copy[locale];

  return (
    <section className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <AssistantChat locale={locale} />
      </div>
    </section>
  );
}
