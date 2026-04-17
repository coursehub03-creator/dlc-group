"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSettingsAction, type DashboardActionState } from "../actions";
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
      {pending ? "Saving..." : "Save settings"}
    </button>
  );
}

export function SettingsForm({
  defaultValues
}: {
  defaultValues: { language: "en" | "ar"; timezone?: string | null; notificationsEnabled: boolean };
}) {
  const [state, formAction] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormStatus success={state.success} error={state.error} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Language
          <select name="language" defaultValue={defaultValues.language} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Timezone
          <input name="timezone" defaultValue={defaultValues.timezone ?? ""} placeholder="Asia/Riyadh" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          {state.fieldErrors?.timezone ? <p className="text-xs text-rose-600">{state.fieldErrors.timezone[0]}</p> : null}
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
        <input type="checkbox" name="notificationsEnabled" defaultChecked={defaultValues.notificationsEnabled} className="h-4 w-4 rounded border-slate-300 text-navy" />
        Receive dashboard notifications about request updates
      </label>

      <SubmitButton />
    </form>
  );
}
