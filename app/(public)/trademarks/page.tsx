import { SiteShell } from "@/components/layout/site-shell";

export default function TrademarksPage() {
  return <SiteShell><section className="mx-auto max-w-4xl px-4 py-16"><h1 className="text-3xl font-semibold">Trademark Support Request</h1><form className="mt-6 grid gap-3 rounded border bg-white p-4"><input className="rounded border p-2" placeholder="Applicant name"/><input className="rounded border p-2" placeholder="Brand name"/><input className="rounded border p-2" placeholder="Industry"/><input className="rounded border p-2" placeholder="Country / jurisdictions"/><input className="rounded border p-2" placeholder="Existing registration status"/><textarea className="rounded border p-2" placeholder="Notes"/><input className="rounded border p-2" placeholder="File upload placeholder"/><button className="rounded bg-navy py-2 text-white">Submit Trademark Request</button></form></section></SiteShell>;
}
