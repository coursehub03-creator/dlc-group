import { SiteShell } from "@/components/layout/site-shell";
import { AssistantChat } from "@/components/ai/assistant-chat";

const pageCopy = {
  en: {
    title: "AI Legal Assistant",
    subtitle: "Bilingual legal information assistant with mandatory safeguards and human-escalation guidance."
  },
  ar: {
    title: "المساعد القانوني الذكي",
    subtitle: "مساعد ثنائي اللغة للمعلومات القانونية مع ضوابط إلزامية وتوجيه للتصعيد إلى خبير بشري."
  }
} as const;

export default async function AIAssistantPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const locale = params.lang === "ar" ? "ar" : "en";
  const t = pageCopy[locale];

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-16" dir={locale === "ar" ? "rtl" : "ltr"}>
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.subtitle}</p>
        <div className="mt-6">
          <AssistantChat locale={locale} />
        </div>
      </section>
    </SiteShell>
  );
}
