import { upsertSiteContentAction, updateFaqAction } from "../actions";
import { prisma } from "@/lib/db/prisma";

const contentKeys = ["hero", "services_highlights", "testimonials_teaser"];

export default async function AdminContentPage() {
  const [contentEntries, faqs, testimonials] = await Promise.all([
    prisma.siteContent.findMany({ orderBy: { key: "asc" } }),
    prisma.fAQ.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-navy">Content / CMS</h1>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Website sections</h2>
        <div className="mt-3 space-y-3">
          {contentKeys.map((key) => {
            const item = contentEntries.find((entry) => entry.key === key);
            return (
              <form key={key} action={upsertSiteContentAction} className="grid gap-2 rounded border p-3">
                <input type="hidden" name="key" value={key} />
                <p className="text-xs font-semibold uppercase text-slate-500">{key}</p>
                <input name="titleEn" defaultValue={item?.titleEn ?? ""} placeholder="Title (EN)" className="rounded border px-3 py-2 text-sm" required />
                <input name="titleAr" defaultValue={item?.titleAr ?? ""} placeholder="Title (AR)" className="rounded border px-3 py-2 text-sm" required />
                <textarea name="bodyEn" defaultValue={item?.bodyEn ?? ""} placeholder="Body (EN)" rows={2} className="rounded border px-3 py-2 text-sm" />
                <textarea name="bodyAr" defaultValue={item?.bodyAr ?? ""} placeholder="Body (AR)" rows={2} className="rounded border px-3 py-2 text-sm" />
                <button className="rounded bg-navy px-3 py-2 text-sm text-white">Save section</button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">FAQ entries</h2>
        <form action={updateFaqAction} className="mt-3 grid gap-2 rounded border p-3">
          <input name="questionEn" placeholder="Question EN" className="rounded border px-3 py-2 text-sm" required />
          <textarea name="answerEn" placeholder="Answer EN" className="rounded border px-3 py-2 text-sm" required />
          <input name="questionAr" placeholder="Question AR" className="rounded border px-3 py-2 text-sm" required />
          <textarea name="answerAr" placeholder="Answer AR" className="rounded border px-3 py-2 text-sm" required />
          <button className="rounded border px-3 py-2 text-sm">Add FAQ</button>
        </form>
        <div className="mt-3 space-y-2 text-sm">{faqs.map((faq) => <div key={faq.id} className="rounded border p-2"><p className="font-medium">{faq.questionEn}</p><p className="text-slate-600">{faq.answerEn}</p></div>)}</div>
      </section>

      <section className="rounded-xl border bg-white p-4 text-sm">
        <h2 className="font-semibold">Testimonials preview</h2>
        {testimonials.map((t) => <div key={t.id} className="mt-2 rounded border p-2"><p className="font-medium">{t.name}</p><p className="text-slate-600">{t.quoteEn}</p></div>)}
      </section>
    </div>
  );
}
