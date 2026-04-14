import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { blogPosts } from "@/content/blog/posts";

export default function BlogPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Legal Insights</h1>
        <div className="mt-6 space-y-4">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block rounded-lg border bg-white p-4">
              <h2 className="font-semibold">{post.titleEn}</h2>
              <p className="text-sm text-slate-600">{post.bodyEn}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
