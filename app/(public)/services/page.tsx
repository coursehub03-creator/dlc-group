import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { servicesContent } from "@/content/services/data";

export default function ServicesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Legal Services</h1>
        <p className="mt-2 text-slate-600">Data-driven services catalog with consistent workflows and outcomes.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {servicesContent.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-lg border bg-white p-5 hover:border-gold">
              <h2 className="font-semibold">{s.titleEn}</h2>
              <p className="mt-2 text-sm text-slate-600">{s.summaryEn}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
