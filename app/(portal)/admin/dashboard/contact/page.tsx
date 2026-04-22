import { markSupportHandledAction } from "../actions";
import { prisma } from "@/lib/db/prisma";
import { getAdminLang } from "@/lib/admin/i18n";

export default async function AdminContactPage({ searchParams }: { searchParams: Promise<{ q?: string; service?: string; lang?: string }> }) {
  const params = await searchParams;
  const lang = getAdminLang(params.lang);
  const inquiries = await prisma.contactInquiry.findMany({
    where: {
      ...(params.q ? { OR: [{ name: { contains: params.q, mode: "insensitive" } }, { email: { contains: params.q, mode: "insensitive" } }] } : {}),
      ...(params.service ? { serviceType: { contains: params.service, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{lang === "ar" ? "استفسارات التواصل" : "Contact inquiries"}</h1>
      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input type="hidden" name="lang" value={lang} />
        <input name="q" defaultValue={params.q ?? ""} placeholder={lang === "ar" ? "بحث بالاسم/البريد" : "Search name/email"} className="rounded border px-3 py-2 text-sm" />
        <input name="service" defaultValue={params.service ?? ""} placeholder={lang === "ar" ? "نوع الخدمة" : "Service type"} className="rounded border px-3 py-2 text-sm" />
        <button className="rounded border px-3 py-2 text-sm">{lang === "ar" ? "تصفية" : "Filter"}</button>
      </form>
      {inquiries.map((item) => (
        <form key={item.id} action={markSupportHandledAction} className="rounded-xl border bg-white p-4 text-sm">
          <input type="hidden" name="inquiryId" value={item.id} />
          <p className="font-semibold">{item.name} · {item.email}</p>
          <p className="text-xs text-slate-500">{item.serviceType ?? (lang === "ar" ? "استفسار عام" : "General inquiry")}</p>
          <p className="mt-2 whitespace-pre-wrap">{item.message}</p>
          <textarea name="adminNote" defaultValue={item.adminNote ?? ""} className="mt-2 w-full rounded border px-3 py-2" placeholder={lang === "ar" ? "ملاحظة مراجعة داخلية" : "Internal review note"} />
          <button className="mt-2 rounded bg-navy px-3 py-2 text-xs text-white">{item.reviewedAt ? (lang === "ar" ? "تحديث المراجعة" : "Update review") : (lang === "ar" ? "تعيين كمراجع" : "Mark reviewed")}</button>
        </form>
      ))}
    </div>
  );
}
