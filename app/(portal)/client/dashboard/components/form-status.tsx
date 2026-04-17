"use client";

type FormStatusProps = {
  success?: string;
  error?: string;
};

export function FormStatus({ success, error }: FormStatusProps) {
  if (!success && !error) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {success ?? error}
    </div>
  );
}
