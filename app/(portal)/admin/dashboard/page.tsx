import Link from "next/link";
import { RequestStatus, RoleType } from "@prisma/client";
import { withSafeAdminQuery } from "@/lib/admin/guard";
import { prisma } from "@/lib/db/prisma";
import { adminText, getAdminLang, localeFor } from "@/lib/admin/i18n";

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang = getAdminLang(params.lang);
  const t = adminText(lang);
  const locale = localeFor(lang);

  const [
    totalUsers,
    totalClients,
    totalAdmins,
    totalRequests,
    activeRequests,
    completedRequests,
    supportCount,
    unreadNotifications,
    inquiriesCount,
    recentActivity,
    recentRequests,
    recentSupport
  ] = await Promise.all([
    withSafeAdminQuery(() => prisma.user.count(), 0),
    withSafeAdminQuery(() => prisma.user.count({ where: { role: RoleType.CLIENT } }), 0),
    withSafeAdminQuery(() => prisma.user.count({ where: { role: RoleType.ADMIN } }), 0),
    withSafeAdminQuery(() => prisma.legalRequest.count(), 0),
    withSafeAdminQuery(() => prisma.legalRequest.count({ where: { status: { in: [RequestStatus.NEW, RequestStatus.UNDER_REVIEW, RequestStatus.IN_PROGRESS] } } }), 0),
    withSafeAdminQuery(() => prisma.legalRequest.count({ where: { status: RequestStatus.COMPLETED } }), 0),
    withSafeAdminQuery(() => prisma.contactInquiry.count({ where: { serviceType: { startsWith: "Support" } } }), 0),
    withSafeAdminQuery(() => prisma.notification.count({ where: { readAt: null } }), 0),
    withSafeAdminQuery(() => prisma.contactInquiry.count(), 0),
    withSafeAdminQuery(() => prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }), []),
    withSafeAdminQuery(() => prisma.legalRequest.findMany({ include: { user: true, category: true }, orderBy: { createdAt: "desc" }, take: 6 }), []),
    withSafeAdminQuery(() => prisma.contactInquiry.findMany({ where: { serviceType: { startsWith: "Support" } }, orderBy: { createdAt: "desc" }, take: 6 }), [])
  ]);

  const cards = lang === "ar"
    ? [["إجمالي المستخدمين", totalUsers], ["إجمالي العملاء", totalClients], ["إجمالي المشرفين", totalAdmins], ["إجمالي الطلبات القانونية", totalRequests], ["الطلبات النشطة", activeRequests], ["الطلبات المكتملة", completedRequests], ["طلبات الدعم", supportCount], ["الإشعارات غير المقروءة", unreadNotifications], ["استفسارات التواصل", inquiriesCount]]
    : [["Total users", totalUsers], ["Total clients", totalClients], ["Total admins", totalAdmins], ["Total legal requests", totalRequests], ["Active requests", activeRequests], ["Completed requests", completedRequests], ["Support requests", supportCount], ["Unread notifications", unreadNotifications], ["Contact inquiries", inquiriesCount]];

  const withLang = (href: string) => `${href}?lang=${lang}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{lang === "ar" ? "مركز قيادة الإدارة" : "Admin Command Center"}</h1>
        <p className="text-sm text-slate-600">{lang === "ar" ? "متابعة فورية للعمليات عبر المستخدمين والطلبات والمحتوى." : "Live platform operations across users, legal requests, support, and content."}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {cards.map(([label, value]) => <div key={label as string} className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-navy">{value as number}</p></div>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-4 lg:col-span-2">
          <h2 className="font-semibold">{lang === "ar" ? "أحدث الطلبات القانونية" : "Recent legal requests"}</h2>
          <div className="mt-3 space-y-2 text-sm">
            {recentRequests.map((request) => <Link key={request.id} href={withLang(`/admin/dashboard/requests/${request.id}`)} className="flex items-center justify-between rounded border p-2 hover:bg-slate-50"><span>{request.subject}</span><span className="text-xs text-slate-500">{request.user.email}</span></Link>)}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{lang === "ar" ? "إجراءات سريعة" : "Quick actions"}</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href={withLang("/admin/dashboard/users")} className="rounded border p-2 hover:bg-slate-50">{t.nav.users}</Link>
            <Link href={withLang("/admin/dashboard/requests")} className="rounded border p-2 hover:bg-slate-50">{t.nav.requests}</Link>
            <Link href={withLang("/admin/dashboard/notifications")} className="rounded border p-2 hover:bg-slate-50">{t.nav.notifications}</Link>
            <Link href={withLang("/admin/dashboard/content")} className="rounded border p-2 hover:bg-slate-50">{t.nav.content}</Link>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{lang === "ar" ? "النشاط الأخير" : "Recent activity timeline"}</h2>
          <div className="mt-2 space-y-2 text-sm">
            {recentActivity.map((item) => <div key={item.id} className="rounded border p-2"><p className="font-medium">{item.action}</p><p className="text-xs text-slate-500">{item.entityType} · {new Date(item.createdAt).toLocaleString(locale)}</p></div>)}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{lang === "ar" ? "أحدث عناصر الدعم" : "Recent support items"}</h2>
          <div className="mt-2 space-y-2 text-sm">
            {recentSupport.map((item) => <div key={item.id} className="rounded border p-2"><p className="font-medium">{item.name} · {item.email}</p><p className="text-xs text-slate-500 line-clamp-2">{item.message}</p></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
