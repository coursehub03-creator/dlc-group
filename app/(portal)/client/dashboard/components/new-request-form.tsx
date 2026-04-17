"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createClientRequestAction, type DashboardActionState } from "../actions";
import { FormStatus } from "./form-status";

type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
};

const initialState: DashboardActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Submitting..." : "Submit legal request"}
    </button>
  );
}

export function NewRequestForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(createClientRequestAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormStatus success={state.success} error={state.error} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Service category
          <select
            name="categoryId"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-navy focus:outline-none"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameEn} / {category.nameAr}
              </option>
            ))}
          </select>
          {state.fieldErrors?.categoryId ? <p className="text-xs text-rose-600">{state.fieldErrors.categoryId[0]}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Country (optional)
          <input
            type="text"
            name="country"
            placeholder="Saudi Arabia"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none"
          />
          {state.fieldErrors?.country ? <p className="text-xs text-rose-600">{state.fieldErrors.country[0]}</p> : null}
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Request subject
        <input
          type="text"
          name="title"
          required
          placeholder="Urgent review of supplier agreement"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none"
        />
        {state.fieldErrors?.title ? <p className="text-xs text-rose-600">{state.fieldErrors.title[0]}</p> : null}
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        Request details
        <textarea
          name="message"
          required
          rows={7}
          placeholder="Describe your legal issue, timeline, and expected support..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-navy focus:outline-none"
        />
        {state.fieldErrors?.message ? <p className="text-xs text-rose-600">{state.fieldErrors.message[0]}</p> : null}
      </label>

      <SubmitButton />
    </form>
  );
}
