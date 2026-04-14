import { SiteShell } from "@/components/layout/site-shell";

export default function LandDisputesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Land Dispute Resolution</h1>
        <p className="mt-2 text-slate-600">Boundary conflicts, ownership claims, development and title disputes.</p>
        <form className="mt-6 grid gap-3 rounded border bg-white p-4" action="/api/requests" method="post">
          <input type="hidden" name="requestType" value="land-dispute" />
          <input className="rounded border p-2" name="clientName" placeholder="Client name" required />
          <input className="rounded border p-2" name="country" placeholder="Country" required />
          <input className="rounded border p-2" name="propertyLocation" placeholder="Property location" required />
          <input className="rounded border p-2" name="disputeType" placeholder="Type of dispute" required />
          <textarea className="rounded border p-2" name="description" placeholder="Description" required />
          <input className="rounded border p-2" name="opposingParty" placeholder="Opposing party info" />
          <input className="rounded border p-2" name="urgency" placeholder="Urgency" required />
          <button className="rounded bg-navy py-2 text-white" type="submit">
            Request Assessment
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
