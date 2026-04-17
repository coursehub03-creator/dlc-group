import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "./components/dashboard-shell";
import { requireDashboardUser, withSafeDashboardQuery } from "./lib/server-utils";

export default async function ClientDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireDashboardUser();

  const [totalConsultations, activeRequests, completedRequests] = await Promise.all([
    withSafeDashboardQuery(() => prisma.serviceRequest.count({ where: { userId: user.id } }), 0),
    withSafeDashboardQuery(
      () =>
        prisma.serviceRequest.count({
          where: {
            userId: user.id,
            status: {
              in: ["NEW", "UNDER_REVIEW", "IN_PROGRESS", "NEEDS_CLARIFICATION"]
            }
          }
        }),
      0
    ),
    withSafeDashboardQuery(
      () =>
        prisma.serviceRequest.count({
          where: {
            userId: user.id,
            status: {
              in: ["COMPLETED", "CLOSED"]
            }
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
    >
      {children}
    </DashboardShell>
  );
}
