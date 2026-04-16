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
    <section className="mx-auto flex w-full max-w-7xl items-center px-4 py-16 md:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-100 p-8 shadow-xl lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Digital Legal Counsel</p>
          <h2 className="mt-4 text-3xl font-semibold text-navy">Premium legal operations, secured by design.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            DLC Group gives clients a secure multilingual workspace for consultations, compliance workflows, and executive-level legal communication.
          </p>
        </div>
        <div className="w-full rounded-2xl border border-slate-200 bg-white/95 p-7 shadow-[0_14px_40px_rgba(15,23,42,0.1)] backdrop-blur sm:p-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Digital Legal Counsel</p>
          <h1 className="text-start text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-start text-sm leading-6 text-slate-600">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Need help? <Link href="/contact" className="font-medium text-slate-700 underline">Contact support</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
