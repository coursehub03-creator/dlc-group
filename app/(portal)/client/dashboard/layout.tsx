import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "./components/dashboard-shell";
import { requireDashboardUser, withSafeDashboardQuery } from "./lib/server-utils";

export default async function ClientDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireDashboardUser();

  const [totalConsultations, activeRequests, completedRequests, unreadNotifications] = await Promise.all([
    withSafeDashboardQuery(() => prisma.legalRequest.count({ where: { userId: user.id } }), 0),
    withSafeDashboardQuery(() => prisma.legalRequest.count({ where: { userId: user.id } }), 0),
    0,
    withSafeDashboardQuery(
      () =>
        prisma.notification.count({
          where: {
            userId: user.id,
            readAt: null
          }
        }),
      0
    )
  ]);

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role
      }}
      stats={{
        totalConsultations,
        activeRequests,
        completedRequests
      }}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </DashboardShell>
  );
}
