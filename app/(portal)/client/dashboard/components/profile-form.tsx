"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileAction, type DashboardActionState } from "../actions";
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
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

type ProfileFormProps = {
  defaultValues: {
    name: string;
    email: string;
    phone?: string | null;
    country?: string | null;
    language: "en" | "ar";
  };
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormStatus success={state.success} error={state.error} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Full name
          <input name="name" defaultValue={defaultValues.name} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          {state.fieldErrors?.name ? <p className="text-xs text-rose-600">{state.fieldErrors.name[0]}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Email
          <input value={defaultValues.email} disabled className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500" />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Phone
          <input name="phone" defaultValue={defaultValues.phone ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          {state.fieldErrors?.phone ? <p className="text-xs text-rose-600">{state.fieldErrors.phone[0]}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Country
          <input name="country" defaultValue={defaultValues.country ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          {state.fieldErrors?.country ? <p className="text-xs text-rose-600">{state.fieldErrors.country[0]}</p> : null}
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Language
        <select name="language" defaultValue={defaultValues.language} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm md:max-w-xs">
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </label>

      <SubmitButton />
    </form>
  );
}
