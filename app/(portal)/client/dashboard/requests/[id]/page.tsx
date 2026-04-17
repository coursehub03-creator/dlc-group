import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { RequestStatusBadge } from "../../components/request-status-badge";

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const request = await prisma.serviceRequest.findFirst({
    where: {
      id,
      userId: session.user.id
    },
    include: {
      category: {
        select: {
          nameEn: true,
          nameAr: true
        }
      },
      case: {
        include: {
          history: {
            orderBy: { createdAt: "asc" }
          }
        }
      }
    }
  });

  if (!request) {
    notFound();
  }

  const timeline: Array<{ id: string; label: string; date: Date; note?: string | null }> = [
    {
      id: `${request.id}-created`,
      label: "Request submitted",
      date: request.createdAt
    },
    ...(request.case?.history.map((item) => ({
      id: item.id,
      label: item.status.replaceAll("_", " "),
      note: item.note,
      date: item.createdAt
    })) ?? []),
    {
      id: `${request.id}-updated`,
      label: "Last updated",
      date: request.updatedAt
    }
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-navy">{request.title ?? request.category.nameEn}</h1>
            <p className="mt-1 text-sm text-slate-600">{request.category.nameEn} / {request.category.nameAr}</p>
          </div>
          <RequestStatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Request details</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{request.message}</p>

          <dl className="mt-6 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Created</dt>
              <dd className="mt-1 font-medium text-slate-800">{new Date(request.createdAt).toLocaleString("en-US")}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Updated</dt>
              <dd className="mt-1 font-medium text-slate-800">{new Date(request.updatedAt).toLocaleString("en-US")}</dd>
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
