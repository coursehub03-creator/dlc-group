import { SiteShell } from "@/components/layout/site-shell";

export default function TrademarksPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Trademark Support Request</h1>
        <p className="mt-2 text-slate-600">Register and protect your brand across your target markets.</p>
        <form className="mt-6 grid gap-3 rounded border bg-white p-4" action="/api/requests" method="post">
          <input type="hidden" name="requestType" value="trademark" />
          <input className="rounded border p-2" name="applicantName" placeholder="Applicant name" required />
          <input className="rounded border p-2" name="brandName" placeholder="Brand name" required />
          <input className="rounded border p-2" name="industry" placeholder="Industry" required />
          <input className="rounded border p-2" name="jurisdictions" placeholder="Country / jurisdictions" required />
          <input className="rounded border p-2" name="existingStatus" placeholder="Existing registration status" />
          <textarea className="rounded border p-2" name="notes" placeholder="Notes" />
          <button className="rounded bg-navy py-2 text-white" type="submit">
            Submit Trademark Request
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
