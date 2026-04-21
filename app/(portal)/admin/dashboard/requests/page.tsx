import Link from "next/link";
import { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; country?: string; sort?: string }> }) {
  const params = await searchParams;
  const categories = await prisma.serviceCategory.findMany({ orderBy: { nameEn: "asc" } });
  const requests = await prisma.legalRequest.findMany({
    where: {
      ...(params.q ? { subject: { contains: params.q, mode: "insensitive" } } : {}),
      ...(params.status && Object.values(RequestStatus).includes(params.status as RequestStatus) ? { status: params.status as RequestStatus } : {}),
      ...(params.category ? { categoryId: params.category } : {}),
      ...(params.country ? { country: { contains: params.country, mode: "insensitive" } } : {})
    },
    include: { user: true, category: true },
    orderBy: { createdAt: params.sort === "oldest" ? "asc" : "desc" },
    take: 80
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Legal requests</h1>
      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-6">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search subject" className="rounded border px-3 py-2 text-sm" />
        <select name="status" defaultValue={params.status ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">All status</option>{Object.values(RequestStatus).map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select name="category" defaultValue={params.category ?? ""} className="rounded border px-3 py-2 text-sm"><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}</select>
        <input name="country" defaultValue={params.country ?? ""} placeholder="Country" className="rounded border px-3 py-2 text-sm" />
        <select name="sort" defaultValue={params.sort ?? "newest"} className="rounded border px-3 py-2 text-sm"><option value="newest">Newest</option><option value="oldest">Oldest</option></select>
        <button className="rounded bg-navy px-3 py-2 text-sm text-white">Apply</button>
      </form>

      <div className="rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-slate-500"><th className="p-3">Subject</th><th>Client</th><th>Status</th><th>Country</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {requests.map((r) => <tr key={r.id} className="border-b"><td className="p-3">{r.subject}<div className="text-xs text-slate-500">{r.category.nameEn}</div></td><td>{r.user.email}</td><td>{r.status}</td><td>{r.country ?? "-"}</td><td>{new Date(r.createdAt).toLocaleDateString("en-US")}</td><td><Link className="text-navy underline" href={`/admin/dashboard/requests/${r.id}`}>Open</Link></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
