import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { StatsCard } from "./components/stats-card";
import { parseDashboardLocale, requireDashboardUser, withSafeDashboardQuery } from "./lib/server-utils";

const copy = {
  en: {
    welcome: "Welcome back",
    subtitle: "Track your consultations, legal requests, and recent updates from your legal team.",
    stats: {
      total: "Total consultations",
      active: "Active requests",
      completed: "Completed requests"
    },
    quickActions: "Quick actions",
    actions: {
      assistant: "Open AI Legal Assistant",
      request: "Submit legal request",
      support: "Contact support"
    },
    recentActivity: "Recent activity",
    noConsultations: "No consultations yet",
    noConsultationsHint: "Once you submit a request or start an AI conversation, your activity timeline appears here.",
    status: "Status",
    viewRequests: "View my requests"
  },
  ar: {
    welcome: "مرحبًا بعودتك",
    subtitle: "تابع الاستشارات والطلبات القانونية وآخر التحديثات من فريقك القانوني.",
    stats: {
      total: "إجمالي الاستشارات",
      active: "الطلبات النشطة",
      completed: "الطلبات المكتملة"
    },
    quickActions: "إجراءات سريعة",
    actions: {
      assistant: "افتح المساعد القانوني الذكي",
      request: "أرسل طلبًا قانونيًا",
      support: "تواصل مع الدعم"
    },
    recentActivity: "النشاط الأخير",
    noConsultations: "لا توجد استشارات بعد",
    noConsultationsHint: "بعد إرسال طلب أو بدء محادثة مع المساعد الذكي سيظهر سجل النشاط هنا.",
    status: "الحالة",
    viewRequests: "عرض طلباتي"
  }
} as const;

export default async function ClientDashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const user = await requireDashboardUser();

  const params = (await searchParams) ?? {};
  const locale = parseDashboardLocale(params);
  const t = copy[locale];

  const [stats, recentRequests] = await Promise.all([
    withSafeDashboardQuery(
      () =>
        prisma.legalRequest.count({
          where: { userId: user.id }
        }),
      0
    ),
    withSafeDashboardQuery(
      () =>
        prisma.legalRequest.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            category: {
              select: {
                nameEn: true,
                nameAr: true
              }
            }
          }
        }),
      []
    )
  ]);

  const totals = {
    totalConsultations: stats,
    activeRequests: stats,
    completedRequests: 0
  };

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-semibold text-navy">
          {t.welcome}, {user.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label={t.stats.total} value={totals.totalConsultations} accent="slate" />
        <StatsCard label={t.stats.active} value={totals.activeRequests} accent="gold" />
        <StatsCard label={t.stats.completed} value={totals.completedRequests} accent="navy" />
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3 md:p-6">
        <h2 className="md:col-span-3 text-lg font-semibold text-navy">{t.quickActions}</h2>
        <Link
          href={`/client/dashboard/ai-assistant?lang=${locale}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-navy hover:text-navy"
        >
          {t.actions.assistant}
        </Link>
        <Link
          href={`/client/dashboard/new-request?lang=${locale}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-navy hover:text-navy"
        >
          {t.actions.request}
        </Link>
        <Link
          href={`/client/dashboard/support?lang=${locale}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-navy hover:text-navy"
        >
          {t.actions.support}
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">{t.recentActivity}</h2>
          <Link href={`/client/dashboard/requests?lang=${locale}`} className="text-sm font-semibold text-navy hover:text-gold">
            {t.viewRequests}
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">{t.noConsultations}</p>
            <p className="mt-2 text-sm text-slate-500">{t.noConsultationsHint}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {recentRequests.map((request) => (
              <li key={request.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">
                    {locale === "ar" ? request.category?.nameAr ?? request.category?.nameEn ?? "General request" : request.category?.nameEn ?? request.category?.nameAr ?? "General request"}
                  </p>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {t.status}: SUBMITTED
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-800">{request.subject}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{request.details}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(request.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en-US")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
