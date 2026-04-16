import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { DashboardShell } from "./components/dashboard-shell";

export default async function ClientDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const [totalConsultations, activeRequests, completedRequests] = await Promise.all([
    prisma.serviceRequest.count({ where: { userId: session.user.id } }),
    prisma.serviceRequest.count({
      where: {
        userId: session.user.id,
        status: {
          in: ["NEW", "UNDER_REVIEW", "IN_PROGRESS", "NEEDS_CLARIFICATION"]
        }
      }
    }),
    prisma.serviceRequest.count({
      where: {
        userId: session.user.id,
        status: {
          in: ["COMPLETED", "CLOSED"]
        }
      }
    })
  ]);

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? "Client",
        email: session.user.email ?? "",
        role: (session.user as { role?: string }).role ?? "CLIENT"
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
