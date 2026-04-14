import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

const services = [
  "General Legal Consultations","Corporate Legal Advisory","Land Dispute Resolution","Patents Registration Support","Trademark Registration Support","Contract Review","Legal Risk Assessment","Company Monitoring","Document Preparation"
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className="bg-gradient-to-b from-navy to-slate-900 px-4 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-gold">مجموعة الماسة للاستشارات القانونية</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold">Strategic legal confidence for ambitious people and companies.</h1>
          <p className="mt-4 max-w-2xl text-slate-200">DLC Group delivers multilingual legal consulting, IP services, land dispute advisory, and compliance monitoring with premium client experience.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact"><Button>Book Consultation</Button></Link>
            <Link href="/ai-assistant"><Button className="bg-gold text-navy">Talk to AI Assistant</Button></Link>
            <Link href="/services"><Button className="bg-white text-navy">Explore Services</Button></Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:grid-cols-3">
        {services.map((s) => <article key={s} className="rounded-lg border bg-white p-5 shadow-sm"><h3 className="font-semibold">{s}</h3><p className="mt-2 text-sm text-slate-600">Premium scope, clear workflow, status tracking, and attorney escalation.</p></article>)}
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="text-2xl font-semibold">Why choose DLC Group</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3"><li className="rounded border bg-white p-4">AI + lawyer collaboration</li><li className="rounded border bg-white p-4">Arabic-first multilingual experience</li><li className="rounded border bg-white p-4">Enterprise-grade workflows and governance</li></ul>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="text-2xl font-semibold">FAQ Preview</h2>
        <div className="mt-4 space-y-3"><div className="rounded border bg-white p-4">How quickly can we start? — Usually within 24 hours.</div><div className="rounded border bg-white p-4">Do you support cross-border matters? — Yes, with jurisdictional partners.</div></div>
      </section>
    </SiteShell>
  );
}
