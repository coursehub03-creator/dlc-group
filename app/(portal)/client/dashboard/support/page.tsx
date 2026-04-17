import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { SupportForm } from "../components/support-form";

const faqs = [
  {
    question: "How quickly will my request be reviewed?",
    answer: "Most client requests are triaged within one business day."
  },
  {
    question: "How can I provide additional files?",
    answer: "Reply from your assigned legal consultant once your request is in progress."
  },
  {
    question: "Can I request Arabic and English updates?",
    answer: "Yes. Set your preferred language in Profile or Settings."
  }
];

export default async function SupportPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Support Center</h1>
        <p className="mt-2 text-sm text-slate-600">Find answers quickly or contact our legal operations support team.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Frequently asked questions</h2>
          <ul className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <li key={faq.question} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-800">{faq.question}</p>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Send a support request</h2>
          <p className="mt-2 text-sm text-slate-600">Share your issue and we will respond in your portal notifications.</p>
          <div className="mt-4">
            <SupportForm />
          </div>
        </div>
      </div>
    </section>
  );
}
