import { notFound } from "next/navigation";
import { RequestStatus } from "@prisma/client";
import { updateLegalRequestAction } from "../../actions";
import { prisma } from "@/lib/db/prisma";

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await prisma.legalRequest.findUnique({ where: { id }, include: { user: true, category: true } });
  if (!request) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Request detail</h1>
      <div className="rounded-xl border bg-white p-4 text-sm">
        <p className="font-semibold">{request.subject}</p>
        <p className="mt-2 whitespace-pre-wrap text-slate-700">{request.details}</p>
        <p className="mt-2 text-xs text-slate-500">Client: {request.user.email} · Category: {request.category.nameEn} · Created: {new Date(request.createdAt).toLocaleString("en-US")}</p>
      </div>

      <form action={updateLegalRequestAction} className="rounded-xl border bg-white p-4">
        <input type="hidden" name="requestId" value={request.id} />
        <div className="grid gap-2 md:grid-cols-2">
          <select name="status" defaultValue={request.status} className="rounded border px-3 py-2 text-sm">{Object.values(RequestStatus).map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <textarea name="adminNote" defaultValue={request.adminNote ?? ""} rows={4} className="rounded border px-3 py-2 text-sm" placeholder="Internal admin note" />
        </div>
        <button className="mt-3 rounded bg-gold px-3 py-2 text-sm font-semibold text-navy">Save changes</button>
      </form>
    </div>
  );
}
