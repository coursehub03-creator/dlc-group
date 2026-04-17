import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Billing</h1>
        <p className="mt-2 text-sm text-slate-600">Subscription and invoicing will be available in an upcoming release.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Current plan</h2>
        <p className="mt-2 text-sm text-slate-600">Premium Legal Advisory (Mock)</p>
        <p className="mt-1 text-sm text-slate-600">Next renewal: May 1, 2026 (Mock)</p>
      </div>
    </section>
  );
}
