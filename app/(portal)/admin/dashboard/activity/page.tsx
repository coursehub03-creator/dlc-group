import { prisma } from "@/lib/db/prisma";

export default async function AdminActivityPage() {
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Platform activity log</h1>
      <div className="rounded-xl border bg-white p-4">
        <div className="space-y-2 text-sm">
          {logs.map((log) => <div key={log.id} className="rounded border p-2"><p className="font-medium">{log.action}</p><p className="text-xs text-slate-500">{log.entityType} · {log.entityId ?? "-"} · {new Date(log.createdAt).toLocaleString("en-US")}</p></div>)}
          {logs.length === 0 ? <p className="text-sm text-slate-500">No activity logged yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
