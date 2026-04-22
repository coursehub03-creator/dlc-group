import { markSupportHandledAction } from "../actions";
import { prisma } from "@/lib/db/prisma";
import { getAdminLang, localeFor } from "@/lib/admin/i18n";

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ q?: string; lang?: string }> }) {
  const params = await searchParams;
  const lang = getAdminLang(params.lang);
  const locale = localeFor(lang);
  const supportItems = await prisma.contactInquiry.findMany({
    where: {
      serviceType: { startsWith: "Support" },
      ...(params.q ? { OR: [{ email: { contains: params.q, mode: "insensitive" } }, { serviceType: { contains: params.q, mode: "insensitive" } }] } : {})
    },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{lang === "ar" ? "مركز الدعم" : "Support center"}</h1>
      <form className="rounded-xl border bg-white p-4"><input type="hidden" name="lang" value={lang} /><input name="q" defaultValue={params.q ?? ""} placeholder={lang === "ar" ? "بحث بالبريد أو العنوان" : "Search by email or subject"} className="w-full rounded border px-3 py-2 text-sm" /></form>
      {supportItems.map((item) => (
        <form key={item.id} action={markSupportHandledAction} className="rounded-xl border bg-white p-4 text-sm">
          <input type="hidden" name="inquiryId" value={item.id} />
          <p className="font-semibold">{item.serviceType ?? (lang === "ar" ? "دعم" : "Support")}</p>
          <p className="text-xs text-slate-500">{item.name} · {item.email} · {new Date(item.createdAt).toLocaleString(locale)}</p>
          <p className="mt-2 whitespace-pre-wrap">{item.message}</p>
          <textarea name="adminNote" defaultValue={item.adminNote ?? ""} className="mt-2 w-full rounded border px-3 py-2 text-sm" placeholder={lang === "ar" ? "ملاحظة داخلية" : "Internal note"} />
          <button className="mt-2 rounded bg-navy px-3 py-2 text-xs text-white">{item.reviewedAt ? (lang === "ar" ? "تحديث المراجعة" : "Update review") : (lang === "ar" ? "تعيين كمعالج" : "Mark handled")}</button>
        </form>
      ))}
    </div>
  );
}
