import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { services } from "@/content/services";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const service = services.find((item) => item.slug === slug);
  if (!service) return notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-semibold">{service.titleEn}</h1>
        <p className="mt-4 text-slate-700">{service.descriptionEn}</p>
      </article>
    </SiteShell>
  );
}
