"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
  async function submit(formData: FormData) {
    setStatus("Submitting...");
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/contact", { method: "POST", body: JSON.stringify({ ...payload, consent: payload.consent === "on" }) });
    setStatus(res.ok ? "Request submitted successfully." : "Something went wrong.");
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border bg-white p-5">
      <input name="name" placeholder="Name" className="rounded border p-2" required />
      <input name="email" placeholder="Email" type="email" className="rounded border p-2" required />
      <input name="phone" placeholder="Phone" className="rounded border p-2" />
      <input name="country" placeholder="Country" className="rounded border p-2" />
      <input name="serviceType" placeholder="Service Type" className="rounded border p-2" />
      <textarea name="message" placeholder="Message" className="min-h-24 rounded border p-2" required />
      <label className="text-xs"><input type="checkbox" name="consent" required /> I consent to data processing for consultation response.</label>
      <button className="rounded bg-navy px-4 py-2 text-white">Send inquiry</button>
      <p className="text-sm text-slate-600">{status}</p>
    </form>
  );
}
