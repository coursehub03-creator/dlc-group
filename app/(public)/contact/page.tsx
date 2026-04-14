import { SiteShell } from "@/components/layout/site-shell";
import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Contact DLC Group</h1>
        <p className="mt-2 text-slate-600">Submit legal consultation or service request.</p>
        <div className="mt-6"><ContactForm /></div>
      </section>
    </SiteShell>
  );
}
