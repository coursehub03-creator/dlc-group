import { prisma } from "@/lib/db/prisma";
import { requireDashboardUser, withSafeDashboardQuery } from "../lib/server-utils";

const actionLabels: Record<string, string> = {
  REQUEST_CREATED: "Created a new legal request",
  PROFILE_UPDATED: "Updated profile details",
  SETTINGS_UPDATED: "Updated workspace settings",
  PASSWORD_CHANGED: "Changed account password",
  SUPPORT_REQUEST_CREATED: "Submitted a support request"
};

export default async function ActivityPage() {
  const user = await requireDashboardUser();

  const [logs, recentRequests] = await Promise.all([
    withSafeDashboardQuery(
      () =>
        prisma.activityLog.findMany({
          where: { actorId: user.id },
          orderBy: { createdAt: "desc" },
          take: 30
        }),
      []
    ),
    withSafeDashboardQuery(
      () =>
        prisma.serviceRequest.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, title: true, createdAt: true }
        }),
      []
    )
  ]);

  const fallbackRequestEvents = recentRequests.map((request) => ({
    id: `request-${request.id}`,
    action: "REQUEST_CREATED",
    entityType: "ServiceRequest",
    createdAt: request.createdAt,
    meta: { title: request.title }
  }));

  const timeline = (logs.length > 0 ? logs : fallbackRequestEvents).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Activity</h1>
        <p className="mt-2 text-sm text-slate-600">Review recent actions across your client workspace.</p>
      </div>

      {timeline.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-slate-700">No activity yet</p>
          <p className="mt-2 text-sm text-slate-500">As you submit requests and update your account, activity will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {timeline.map((entry) => (
            <li key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-800">{actionLabels[entry.action] ?? entry.action}</p>
              <p className="mt-1 text-sm text-slate-600">{entry.entityType}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString("en-US")}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
