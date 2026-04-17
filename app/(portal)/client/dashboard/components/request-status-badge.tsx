import { RequestStatus } from "@prisma/client";

const styleMap: Record<RequestStatus, string> = {
  NEW: "bg-blue-50 text-blue-700",
  UNDER_REVIEW: "bg-amber-50 text-amber-700",
  IN_PROGRESS: "bg-violet-50 text-violet-700",
  NEEDS_CLARIFICATION: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700"
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styleMap[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
