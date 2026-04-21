import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireDashboardUser, withSafeDashboardQuery } from "../../lib/server-utils";

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireDashboardUser();

  const { id } = await params;
  if (typeof id !== "string" || id.trim().length === 0) {
    notFound();
  }

  const request = await withSafeDashboardQuery(
    () =>
      prisma.legalRequest.findFirst({
        where: {
          id,
          userId: user.id
        },
        include: {
          category: {
            select: {
              nameEn: true,
              nameAr: true
            }
          },
        }
      }),
    null
  );

  if (!request) {
    notFound();
  }

  const timeline: Array<{ id: string; label: string; date: Date; note?: string | null }> = [
    {
      id: `${request.id}-created`,
      label: "Request submitted",
      date: request.createdAt
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-navy">{request.subject}</h1>
            <p className="mt-1 text-sm text-slate-600">{request.category?.nameEn ?? "General"} / {request.category?.nameAr ?? "عام"}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">SUBMITTED</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Request details</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{request.details}</p>

          <dl className="mt-6 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Created</dt>
              <dd className="mt-1 font-medium text-slate-800">{new Date(request.createdAt).toLocaleString("en-US")}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Country</dt>
              <dd className="mt-1 font-medium text-slate-800">{request.country ?? "Not specified"}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Request ID</dt>
              <dd className="mt-1 font-medium text-slate-800">{request.id}</dd>
            </div>
          </dl>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Status timeline</h2>
          <ul className="mt-4 space-y-3">
            {timeline.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                {item.note ? <p className="mt-1 text-xs text-slate-600">{item.note}</p> : null}
                <p className="mt-1 text-xs text-slate-500">{new Date(item.date).toLocaleString("en-US")}</p>
              </li>
            ))}
          </ul>

          <Link href="/client/dashboard/requests" className="mt-5 inline-flex text-sm font-semibold text-navy hover:text-gold">
            Back to all requests
          </Link>
        </aside>
      </div>
    </section>
  );
}
