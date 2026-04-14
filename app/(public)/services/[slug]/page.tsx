import { notFound } from "next/navigation";
import { services } from "@/content/services";
import { SiteShell } from "@/components/layout/site-shell";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const service = services.find((item) => item.slug === slug);
  if (!service) return notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">{service.titleEn}</h1>
        <p className="mt-3 text-slate-700">{service.descriptionEn}</p>
      </article>
    </SiteShell>
  );
}
