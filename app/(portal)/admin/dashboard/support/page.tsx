import { markSupportHandledAction } from "../actions";
import { prisma } from "@/lib/db/prisma";

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ q?: string; date?: string }> }) {
  const params = await searchParams;
  const supportItems = await prisma.contactInquiry.findMany({
    where: {
      serviceType: { startsWith: "Support" },
      ...(params.q ? { OR: [{ email: { contains: params.q, mode: "insensitive" } }, { serviceType: { contains: params.q, mode: "insensitive" } }] } : {})
    },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Support center</h1>
      <form className="rounded-xl border bg-white p-4"><input name="q" defaultValue={params.q ?? ""} placeholder="Search by email or subject" className="w-full rounded border px-3 py-2 text-sm" /></form>
      {supportItems.map((item) => (
        <form key={item.id} action={markSupportHandledAction} className="rounded-xl border bg-white p-4 text-sm">
          <input type="hidden" name="inquiryId" value={item.id} />
          <p className="font-semibold">{item.serviceType ?? "Support"}</p>
          <p className="text-xs text-slate-500">{item.name} · {item.email} · {new Date(item.createdAt).toLocaleString("en-US")}</p>
          <p className="mt-2 whitespace-pre-wrap">{item.message}</p>
          <textarea name="adminNote" defaultValue={item.adminNote ?? ""} className="mt-2 w-full rounded border px-3 py-2 text-sm" placeholder="Internal note" />
          <button className="mt-2 rounded bg-navy px-3 py-2 text-xs text-white">{item.reviewedAt ? "Update review" : "Mark handled"}</button>
        </form>
      ))}
    </div>
  );
}
