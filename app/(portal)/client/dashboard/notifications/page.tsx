import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { MarkNotificationReadButton } from "../components/mark-notification-read-button";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Notifications</h1>
        <p className="mt-2 text-sm text-slate-600">Stay updated on legal request progress and support updates.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-slate-700">No notifications yet</p>
          <p className="mt-2 text-sm text-slate-500">You will see updates here when your requests change status.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString("en-US")}</p>
                </div>
                {notification.readAt ? (
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Read</span>
                ) : (
                  <MarkNotificationReadButton notificationId={notification.id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
