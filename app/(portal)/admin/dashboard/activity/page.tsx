import { prisma } from "@/lib/db/prisma";
import { getAdminLang, localeFor } from "@/lib/admin/i18n";

export default async function AdminActivityPage({ searchParams }: { searchParams: Promise<{ lang?: string; action?: string }> }) {
  const params = await searchParams;
  const lang = getAdminLang(params.lang);
  const locale = localeFor(lang);
  const logs = await prisma.activityLog.findMany({
    where: params.action ? { action: { contains: params.action, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{lang === "ar" ? "سجل نشاط المنصة" : "Platform activity log"}</h1>
      <form className="rounded-xl border bg-white p-4"><input type="hidden" name="lang" value={lang} /><input name="action" defaultValue={params.action ?? ""} placeholder={lang === "ar" ? "تصفية بالإجراء" : "Filter by action"} className="w-full rounded border px-3 py-2 text-sm" /></form>
      <div className="rounded-xl border bg-white p-4">
        <div className="space-y-2 text-sm">
          {logs.map((log) => <div key={log.id} className="rounded border p-2"><p className="font-medium">{log.action}</p><p className="text-xs text-slate-500">{log.entityType} · {log.entityId ?? "-"} · {new Date(log.createdAt).toLocaleString(locale)}</p></div>)}
          {logs.length === 0 ? <p className="text-sm text-slate-500">{lang === "ar" ? "لا يوجد نشاط بعد." : "No activity logged yet."}</p> : null}
        </div>
      </div>
    </div>
  );
}
