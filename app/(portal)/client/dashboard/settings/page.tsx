import { prisma } from "@/lib/db/prisma";
import { SettingsForm } from "../components/settings-form";
import { requireDashboardUser, withSafeDashboardQuery } from "../lib/server-utils";

export default async function SettingsPage() {
  const user = await requireDashboardUser();

  const profile = await withSafeDashboardQuery(() => prisma.profile.findUnique({ where: { userId: user.id } }), null);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Control language, notifications, and workspace preferences.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SettingsForm
          defaultValues={{
            language: profile?.language === "en" ? "en" : "ar",
            timezone: profile?.timezone,
            notificationsEnabled: profile?.notificationsEnabled ?? true
          }}
        />
      </div>
    </section>
  );
}
