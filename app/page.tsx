import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

const services = {
  en: [
    "Strategic Legal Consultations",
    "Corporate Legal Advisory",
    "Land Dispute Resolution",
    "Patent Registration Strategy",
    "Trademark Protection Services",
    "Contract Audit & Redlining"
  ],
  ar: [
    "استشارات قانونية استراتيجية",
    "إدارة قانونية للشركات",
    "حل نزاعات الأراضي",
    "استراتيجية تسجيل براءات الاختراع",
    "خدمات حماية العلامات التجارية",
    "مراجعة وصياغة العقود"
  ]
} as const;

const copy = {
  en: {
    eyebrow: "Diamond Legal Consulting Group",
    title: "Cross-border legal certainty for investors, founders, and enterprises.",
    subtitle:
      "Designed as a premium legal command center—where strategic counsel, intellectual property, and compliance intelligence move in one elegant workflow.",
    cta: { consult: "Book Executive Consultation", ai: "Open AI Legal Assistant", services: "Explore Services" },
    metrics: ["24h initial response", "12+ jurisdictions supported", "Enterprise-grade client confidentiality"],
    valueTitle: "Why global clients choose DLC Group",
    valueCards: [
      "Partner-level legal guidance with structured delivery standards.",
      "Arabic-native and English-native legal communication by design.",
      "Real-time request visibility with premium dashboard workflows."
    ],
    faqTitle: "Client assurance",
    faq: [
      "How fast can onboarding begin? — Most engagements begin within one business day.",
      "Can you support complex cross-border mandates? — Yes, through validated jurisdictional partner networks."
    ]
  },
  ar: {
    eyebrow: "مجموعة الماسة للاستشارات القانونية",
    title: "يقين قانوني عابر للحدود للمستثمرين وروّاد الأعمال والشركات.",
    subtitle:
      "تم تصميم التجربة كمنصة قانونية فاخرة تجمع الاستشارة الاستراتيجية والملكية الفكرية والامتثال المؤسسي ضمن مسار واحد أنيق.",
    cta: { consult: "احجز استشارة تنفيذية", ai: "افتح المساعد القانوني الذكي", services: "استكشف الخدمات" },
    metrics: ["استجابة أولية خلال 24 ساعة", "+12 ولاية قضائية مدعومة", "سرية مؤسسية بمعايير عالية"],
    valueTitle: "لماذا يختارنا العملاء الدوليون",
    valueCards: [
      "إشراف قانوني رفيع المستوى مع معايير تسليم واضحة.",
      "تجربة عربية أصيلة وإنجليزية احترافية من الأساس.",
      "رؤية لحظية للطلبات عبر لوحات متابعة فاخرة."
    ],
    faqTitle: "ضمانات تجربة العميل",
    faq: [
      "متى يبدأ تنفيذ الطلب؟ — غالباً خلال يوم عمل واحد.",
      "هل تدعمون الملفات العابرة للحدود؟ — نعم عبر شبكة شركاء موثوقة في ولايات متعددة."
    ]
  }
} as const;

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const locale = params.lang === "ar" ? "ar" : "en";
  const t = copy[locale];

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0c1630] via-navy to-[#081223] px-4 pb-28 pt-24 text-white md:px-8">
        <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/90">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">{t.subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={`/contact?lang=${locale}`}><Button>{t.cta.consult}</Button></Link>
              <Link href={`/ai-assistant?lang=${locale}`}><Button className="bg-gold text-navy">{t.cta.ai}</Button></Link>
              <Link href={`/services?lang=${locale}`}><Button className="border border-white/20 bg-white/10 text-white shadow-none backdrop-blur">{t.cta.services}</Button></Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <p className="text-sm uppercase tracking-[0.26em] text-slate-200">Executive Snapshot</p>
            <div className="mt-5 space-y-3">
              {t.metrics.map((item) => (
                <div key={item} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-16 grid max-w-7xl gap-5 px-4 md:grid-cols-2 md:px-8 xl:grid-cols-3">
        {services[locale].map((service) => (
          <article
            key={service}
            className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
          >
            <h3 className="text-lg font-semibold text-slate-900">{service}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {locale === "ar"
                ? "مسار عمل احترافي مع نقاط متابعة واضحة وتنسيق قانوني دقيق."
                : "Refined delivery model with transparent milestones and legal precision at every stage."}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="text-3xl font-semibold text-slate-900">{t.valueTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {t.valueCards.map((value) => (
            <div key={value} className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 text-sm text-slate-700">
              {value}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <h2 className="text-3xl font-semibold text-slate-900">{t.faqTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {t.faq.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
