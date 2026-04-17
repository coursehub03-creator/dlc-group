"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSupportRequestAction, type DashboardActionState } from "../actions";
import { FormStatus } from "./form-status";

const initialState: DashboardActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
    >
      {pending ? "Sending..." : "Send support request"}
    </button>
  );
}

export function SupportForm() {
  const [state, formAction] = useActionState(createSupportRequestAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormStatus success={state.success} error={state.error} />

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Subject
        <input name="subject" required placeholder="Need help with an active request" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        {state.fieldErrors?.subject ? <p className="text-xs text-rose-600">{state.fieldErrors.subject[0]}</p> : null}
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Message
        <textarea name="message" rows={6} required placeholder="Tell us what you need and our legal support team will assist." className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        {state.fieldErrors?.message ? <p className="text-xs text-rose-600">{state.fieldErrors.message[0]}</p> : null}
      </label>

      <SubmitButton />
    </form>
  );
}
