import { notFound } from "next/navigation";
import { servicesContent } from "@/content/services/data";
import { SiteShell } from "@/components/layout/site-shell";

export default function ServiceDetail({ params }: { params: { slug: string } }) {
  const service = servicesContent.find((s) => s.slug === params.slug);
  if (!service) return notFound();
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-semibold">{service.titleEn}</h1>
        <p className="mt-2 text-slate-600">{service.summaryEn}</p>
      </section>
    </SiteShell>
  );
}
