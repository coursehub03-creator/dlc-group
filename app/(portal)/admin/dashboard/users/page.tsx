import { RoleType } from "@prisma/client";
import { updateUserAction } from "../actions";
import { prisma } from "@/lib/db/prisma";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const role = params.role as RoleType | undefined;

  const users = await prisma.user.findMany({
    where: {
      ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
      ...(role && Object.values(RoleType).includes(role) ? { role } : {})
    },
    include: {
      profile: true,
      legalRequests: { take: 3, orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" },
    take: 60
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Users management</h1>
      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="Search name or email" className="rounded border px-3 py-2 text-sm" />
        <select name="role" defaultValue={role ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">All roles</option>{Object.values(RoleType).map((v) => <option key={v} value={v}>{v}</option>)}</select>
        <button className="rounded bg-navy px-3 py-2 text-sm font-semibold text-white">Filter</button>
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-semibold">{user.name ?? "Unnamed"}</p><p className="text-xs text-slate-500">{user.email}</p></div>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs">{user.role}</span>
            </div>
            <form action={updateUserAction} className="grid gap-2 md:grid-cols-5">
              <input type="hidden" name="userId" value={user.id} />
              <input name="name" defaultValue={user.name ?? ""} className="rounded border px-3 py-2 text-sm" required />
              <select name="role" defaultValue={user.role} className="rounded border px-3 py-2 text-sm">{Object.values(RoleType).map((v) => <option key={v} value={v}>{v}</option>)}</select>
              <label className="flex items-center gap-2 rounded border px-3 py-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={user.isActive} /> Active</label>
              <div className="rounded border px-3 py-2 text-xs">{user.profile?.phone ?? "No phone"} · {user.profile?.country ?? "No country"} · {user.profile?.language ?? "ar"}</div>
              <button className="rounded bg-gold px-3 py-2 text-sm font-semibold text-navy">Save</button>
            </form>
            <div className="mt-2 text-xs text-slate-600">Recent requests: {user.legalRequests.length === 0 ? "none" : user.legalRequests.map((r) => r.subject).join(" • ")}</div>
          </div>
        ))}
        {users.length === 0 ? <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">No users found for this filter.</div> : null}
      </div>
    </div>
  );
}
