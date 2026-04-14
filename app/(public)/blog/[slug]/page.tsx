import { notFound } from "next/navigation";
import { blogPosts } from "@/content/blog/posts";
import { SiteShell } from "@/components/layout/site-shell";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetail({ params }: Props) {
  const { slug } = await params;

  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">{post.titleEn}</h1>
        <p className="mt-3 text-slate-700">{post.bodyEn}</p>
      </article>
    </SiteShell>
  );
}
