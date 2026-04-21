import { updateAdminProfileAction } from "../actions";
import { requireAdminUser } from "@/lib/admin/guard";
import { prisma } from "@/lib/db/prisma";

export default async function AdminSettingsPage() {
  const admin = await requireAdminUser();
  const profile = await prisma.profile.findUnique({ where: { userId: admin.id } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Admin settings</h1>
      <form action={updateAdminProfileAction} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-2">
        <input name="name" defaultValue={admin.name ?? ""} placeholder="Full name" className="rounded border px-3 py-2 text-sm" required />
        <input name="phone" defaultValue={profile?.phone ?? ""} placeholder="Phone" className="rounded border px-3 py-2 text-sm" />
        <input name="country" defaultValue={profile?.country ?? ""} placeholder="Country" className="rounded border px-3 py-2 text-sm" />
        <select name="language" defaultValue={profile?.language ?? "ar"} className="rounded border px-3 py-2 text-sm"><option value="ar">Arabic</option><option value="en">English</option></select>
        <button className="rounded bg-navy px-3 py-2 text-sm text-white">Save settings</button>
      </form>
    </div>
  );
}
