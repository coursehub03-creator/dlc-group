import { SiteShell } from "@/components/layout/site-shell";

export default function GlobalMonitoringPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Global Companies Monitoring</h1>
        <p className="mt-2 text-slate-600">Regulatory watch and legal-compliance updates for strategic decisions.</p>
        <form className="mt-6 grid gap-3 rounded border bg-white p-4" action="/api/requests" method="post">
          <input type="hidden" name="requestType" value="monitoring" />
          <input className="rounded border p-2" name="companyName" placeholder="Company name" required />
          <input className="rounded border p-2" name="country" placeholder="Country" required />
          <input className="rounded border p-2" name="industry" placeholder="Industry" required />
          <textarea className="rounded border p-2" name="purpose" placeholder="Monitoring purpose" required />
          <textarea className="rounded border p-2" name="notes" placeholder="Notes" />
          <button className="rounded bg-navy py-2 text-white" type="submit">
            Submit Monitoring Request
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
