import { SiteShell } from "@/components/layout/site-shell";

export default function PatentsPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Patent Support Request</h1>
        <p className="mt-2 text-slate-600">Submit your invention details for legal assessment and filing support.</p>
        <form className="mt-6 grid gap-3 rounded border bg-white p-4" action="/api/requests" method="post">
          <input type="hidden" name="requestType" value="patent" />
          <input className="rounded border p-2" name="applicantName" placeholder="Applicant name" required />
          <input className="rounded border p-2" name="country" placeholder="Country" required />
          <input className="rounded border p-2" name="inventionTitle" placeholder="Invention title" required />
          <textarea className="rounded border p-2" name="inventionSummary" placeholder="Invention summary" required />
          <input className="rounded border p-2" name="industry" placeholder="Industry" required />
          <input className="rounded border p-2" name="targetJurisdictions" placeholder="Target jurisdictions" required />
          <textarea className="rounded border p-2" name="notes" placeholder="Notes" />
          <button className="rounded bg-navy py-2 text-white" type="submit">
            Submit Patent Request
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
