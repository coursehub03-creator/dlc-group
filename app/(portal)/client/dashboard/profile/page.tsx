import { prisma } from "@/lib/db/prisma";
import { ProfileForm } from "../components/profile-form";
import { requireDashboardUser, withSafeDashboardQuery } from "../lib/server-utils";

export default async function ProfilePage() {
  const authUser = await requireDashboardUser();

  const user = await withSafeDashboardQuery(
    () =>
      prisma.user.findUnique({
        where: { id: authUser.id },
        include: { profile: true }
      }),
    null
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Manage your legal workspace identity and communication preferences.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProfileForm
          defaultValues={{
            name: user?.name ?? authUser.name,
            email: user?.email ?? authUser.email,
            phone: user?.profile?.phone,
            country: user?.profile?.country,
            language: user?.profile?.language === "en" ? "en" : "ar"
          }}
        />
      </div>
    </section>
  );
}
