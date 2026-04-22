import Link from "next/link";
import { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { adminText, getAdminLang, localeFor } from "@/lib/admin/i18n";

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; country?: string; sort?: string; lang?: string }> }) {
  const params = await searchParams;
  const lang = getAdminLang(params.lang);
  const t = adminText(lang);
  const locale = localeFor(lang);

  const categories = await prisma.serviceCategory.findMany({ orderBy: { nameEn: "asc" } });
  const requests = await prisma.legalRequest.findMany({
    where: {
      ...(params.q ? { subject: { contains: params.q, mode: "insensitive" } } : {}),
      ...(params.status && Object.values(RequestStatus).includes(params.status as RequestStatus) ? { status: params.status as RequestStatus } : {}),
      ...(params.category ? { categoryId: params.category } : {}),
      ...(params.country ? { country: { contains: params.country, mode: "insensitive" } } : {})
    },
    include: { user: true, category: true },
    orderBy: { createdAt: params.sort === "oldest" ? "asc" : "desc" },
    take: 80
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{t.nav.requests}</h1>
      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-6">
        <input name="q" defaultValue={params.q ?? ""} placeholder={lang === "ar" ? "البحث في الموضوع" : "Search subject"} className="rounded border px-3 py-2 text-sm" />
        <select name="status" defaultValue={params.status ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">{lang === "ar" ? "كل الحالات" : "All status"}</option>{Object.values(RequestStatus).map((s) => <option key={s} value={s}>{t.status[s]}</option>)}</select>
        <select name="category" defaultValue={params.category ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">{lang === "ar" ? "كل التصنيفات" : "All categories"}</option>{categories.map((c) => <option key={c.id} value={c.id}>{lang === "ar" ? c.nameAr : c.nameEn}</option>)}</select>
        <input name="country" defaultValue={params.country ?? ""} placeholder={lang === "ar" ? "الدولة" : "Country"} className="rounded border px-3 py-2 text-sm" />
        <select name="sort" defaultValue={params.sort ?? "newest"} className="rounded border px-3 py-2 text-sm"><option value="newest">{lang === "ar" ? "الأحدث" : "Newest"}</option><option value="oldest">{lang === "ar" ? "الأقدم" : "Oldest"}</option></select>
        <button className="rounded bg-navy px-3 py-2 text-sm text-white">{t.common.filter}</button>
      </form>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-slate-500"><th className="p-3">{lang === "ar" ? "الموضوع" : "Subject"}</th><th>{lang === "ar" ? "العميل" : "Client"}</th><th>{lang === "ar" ? "الحالة" : "Status"}</th><th>{lang === "ar" ? "الدولة" : "Country"}</th><th>{lang === "ar" ? "التاريخ" : "Created"}</th><th></th></tr></thead>
          <tbody>
            {requests.map((r) => <tr key={r.id} className="border-b"><td className="p-3">{r.subject}<div className="text-xs text-slate-500">{lang === "ar" ? r.category.nameAr : r.category.nameEn}</div></td><td>{r.user.email}</td><td>{t.status[r.status]}</td><td>{r.country ?? "-"}</td><td>{new Date(r.createdAt).toLocaleDateString(locale)}</td><td><Link className="text-navy underline" href={`/admin/dashboard/requests/${r.id}?lang=${lang}`}>{t.common.open}</Link></td></tr>) }
          </tbody>
        </table>
      </div>
    </div>
  );
}
