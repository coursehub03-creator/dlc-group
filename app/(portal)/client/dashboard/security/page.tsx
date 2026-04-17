import { SecurityForm } from "../components/security-form";
import { requireDashboardUser } from "../lib/server-utils";

export default async function SecurityPage() {
  await requireDashboardUser();

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Security</h1>
        <p className="mt-2 text-sm text-slate-600">Update your password to keep your legal workspace secure.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SecurityForm />
      </div>
    </section>
  );
}
