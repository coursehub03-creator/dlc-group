import { prisma } from "@/lib/db/prisma";
import { NewRequestForm } from "../components/new-request-form";
import { requireDashboardUser, withSafeDashboardQuery } from "../lib/server-utils";

export default async function NewRequestPage() {
  await requireDashboardUser();

  const categories = await withSafeDashboardQuery(
    () =>
      prisma.serviceCategory.findMany({
        orderBy: { nameEn: "asc" },
        select: { id: true, nameEn: true, nameAr: true }
      }),
    []
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Submit legal request</h1>
        <p className="mt-2 text-sm text-slate-600">Share your legal matter and our team will review it securely.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <NewRequestForm categories={categories} />
      </div>
    </section>
  );
}
