"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSecurityAction, type DashboardActionState } from "../actions";
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
      {pending ? "Updating..." : "Change password"}
    </button>
  );
}

export function SecurityForm() {
  const [state, formAction] = useActionState(updateSecurityAction, initialState);

  return (
    <form action={formAction} className="space-y-5 md:max-w-xl">
      <FormStatus success={state.success} error={state.error} />

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Current password
        <input type="password" name="currentPassword" required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        New password
        <input type="password" name="newPassword" required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        {state.fieldErrors?.newPassword ? <p className="text-xs text-rose-600">{state.fieldErrors.newPassword[0]}</p> : null}
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Confirm new password
        <input type="password" name="confirmPassword" required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        {state.fieldErrors?.confirmPassword ? <p className="text-xs text-rose-600">{state.fieldErrors.confirmPassword[0]}</p> : null}
      </label>

      <SubmitButton />
    </form>
  );
}
