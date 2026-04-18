import { prisma } from "@/lib/db/prisma";
import { NewRequestForm } from "../components/new-request-form";
import { requireDashboardUser, withSafeDashboardQuery } from "../lib/server-utils";

export default async function NewRequestPage() {
  await requireDashboardUser();

  const categories = await withSafeDashboardQuery(async () => {
    const existing = await prisma.serviceCategory.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameAr: true }
    });

    if (existing.length > 0) {
      return existing;
    }

    const fallback = await prisma.serviceCategory.upsert({
      where: { slug: "general-legal-consultation" },
      create: {
        slug: "general-legal-consultation",
        nameEn: "General legal consultation",
        nameAr: "استشارة قانونية عامة"
      },
      update: {},
      select: { id: true, nameEn: true, nameAr: true }
    });

    return [fallback];
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Submit legal request</h1>
        <p className="mt-2 text-sm text-slate-600">Share your legal matter and our team will review it securely.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Service categories are temporarily unavailable. Please try again shortly or contact support.
          </div>
        ) : (
          <NewRequestForm categories={categories} />
        )}
      </div>
    </section>
  );
}
