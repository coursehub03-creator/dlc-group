import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireDashboardUser, withSafeDashboardQuery } from "../lib/server-utils";

export default async function RequestsPage({
  searchParams
}: {
  searchParams?: Promise<{ created?: string }>;
}) {
  const user = await requireDashboardUser();

  const params = (await searchParams) ?? {};

  const requests = await withSafeDashboardQuery(
    () =>
      prisma.legalRequest.findMany({
        where: { userId: user.id },
        include: {
          category: {
            select: {
              nameEn: true,
              nameAr: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
    []
  );

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">My Requests</h1>
        <p className="mt-2 text-sm text-slate-600">Track all legal requests, progress, and communication updates.</p>
      </div>

      {params.created === "1" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Your legal request was submitted successfully.
        </div>
      ) : null}

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-800">No legal requests yet</h2>
          <p className="mt-2 text-sm text-slate-500">Create your first request to start working with our legal team.</p>
          <Link href="/client/dashboard/new-request" className="mt-5 inline-flex rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white">
            Submit a request
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{request.subject}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-500">{request.category?.nameEn ?? "General"} / {request.category?.nameAr ?? "عام"}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{request.country ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-600">{new Date(request.createdAt).toLocaleDateString("en-US")}</td>
                  <td className="max-w-xs px-4 py-4 text-slate-600">
                    <p className="line-clamp-2">{request.details}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/client/dashboard/requests/${request.id}`} className="font-semibold text-navy hover:text-gold">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
