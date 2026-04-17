"use client";

import { useTransition } from "react";
import { markNotificationAsReadAction } from "../actions";

export function MarkNotificationReadButton({ notificationId }: { notificationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(async () => markNotificationAsReadAction(notificationId))}
      disabled={pending}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-navy hover:text-navy disabled:opacity-70"
    >
      {pending ? "Updating..." : "Mark as read"}
    </button>
  );
}
