import Link from "next/link";

export function AuthLayout({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center p-6 sm:p-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white/95 p-7 shadow-[0_14px_40px_rgba(15,23,42,0.1)] backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Digital Legal Counsel</p>
        <h1 className="text-2xl font-semibold text-slate-900 text-start">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 text-start">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Need help? <Link href="/contact" className="font-medium text-slate-700 underline">Contact support</Link>
        </p>
      </div>
    </section>
  );
}
