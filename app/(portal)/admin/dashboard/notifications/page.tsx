import { broadcastNotificationAction, deleteNotificationAction, markNotificationReadAction, sendNotificationAction } from "../actions";
import { prisma } from "@/lib/db/prisma";

export default async function AdminNotificationsPage({ searchParams }: { searchParams: Promise<{ userId?: string; state?: string }> }) {
  const params = await searchParams;
  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true, email: true, role: true }, orderBy: { createdAt: "desc" }, take: 200 });
  const notifications = await prisma.notification.findMany({
    where: {
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.state === "unread" ? { readAt: null } : {}),
      ...(params.state === "read" ? { NOT: { readAt: null } } : {})
    },
    include: { user: true, sender: true },
    orderBy: { createdAt: "desc" },
    take: 150
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Notifications</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <form action={sendNotificationAction} className="rounded-xl border bg-white p-4 text-sm">
          <h2 className="font-semibold">Send notification to one user</h2>
          <select name="userId" className="mt-2 w-full rounded border px-3 py-2" required>{users.map((u) => <option key={u.id} value={u.id}>{u.email} ({u.role})</option>)}</select>
          <input name="title" placeholder="Title" className="mt-2 w-full rounded border px-3 py-2" required />
          <textarea name="message" placeholder="Message" className="mt-2 w-full rounded border px-3 py-2" rows={3} required />
          <button className="mt-2 rounded bg-navy px-3 py-2 text-white">Send</button>
        </form>
        <form action={broadcastNotificationAction} className="rounded-xl border bg-white p-4 text-sm">
          <h2 className="font-semibold">Broadcast notification</h2>
          <select name="audience" className="mt-2 w-full rounded border px-3 py-2"><option value="ALL_USERS">All users</option><option value="CLIENTS">All clients</option></select>
          <input name="title" placeholder="Title" className="mt-2 w-full rounded border px-3 py-2" required />
          <textarea name="message" placeholder="Message" className="mt-2 w-full rounded border px-3 py-2" rows={3} required />
          <button className="mt-2 rounded bg-gold px-3 py-2 font-semibold text-navy">Broadcast</button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <form className="mb-3 grid gap-2 md:grid-cols-3">
          <select name="userId" defaultValue={params.userId ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}</select>
          <select name="state" defaultValue={params.state ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">All</option><option value="unread">Unread</option><option value="read">Read</option></select>
          <button className="rounded border px-3 py-2 text-sm">Filter</button>
        </form>
        <div className="space-y-2 text-sm">{notifications.map((n) => <div key={n.id} className="rounded border p-3"><p className="font-semibold">{n.title}</p><p>{n.message}</p><p className="text-xs text-slate-500">to {n.user.email} · by {n.sender?.email ?? "system"}</p><div className="mt-2 flex gap-2"><form action={markNotificationReadAction}><input type="hidden" name="notificationId" value={n.id} /><button className="rounded border px-2 py-1 text-xs">Mark read</button></form><form action={deleteNotificationAction}><input type="hidden" name="notificationId" value={n.id} /><button className="rounded border px-2 py-1 text-xs">Delete</button></form></div></div>)}</div>
      </div>
    </div>
  );
}
