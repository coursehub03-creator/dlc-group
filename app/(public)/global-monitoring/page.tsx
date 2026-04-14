import { SiteShell } from "@/components/layout/site-shell";

export default function GlobalMonitoringPage() {
  return <SiteShell><section className="mx-auto max-w-4xl px-4 py-16"><h1 className="text-3xl font-semibold">Global Companies Monitoring</h1><p className="mt-2 text-slate-600">Regulatory watch and legal-compliance updates for strategic decisions.</p><form className="mt-6 grid gap-3 rounded border bg-white p-4"><input className="rounded border p-2" placeholder="Company name"/><input className="rounded border p-2" placeholder="Country"/><input className="rounded border p-2" placeholder="Industry"/><textarea className="rounded border p-2" placeholder="Monitoring purpose"/><textarea className="rounded border p-2" placeholder="Notes"/><button className="rounded bg-navy py-2 text-white">Submit Monitoring Request</button></form></section></SiteShell>;
}
