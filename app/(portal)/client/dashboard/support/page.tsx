import { prisma } from "@/lib/db/prisma";
import { SupportForm } from "../components/support-form";
import { requireDashboardUser, withSafeDashboardQuery } from "../lib/server-utils";

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
  const user = await requireDashboardUser();

  const supportMessages = await withSafeDashboardQuery(
    () => {
      if (!user.email) {
        return Promise.resolve([]);
      }

      return prisma.contactInquiry.findMany({
        where: {
          email: user.email,
          serviceType: {
            startsWith: "Support:"
          }
        },
        select: {
          id: true,
          serviceType: true,
          message: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 5
      });
    },
    []
  );

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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy">Recent support requests</h2>
        {supportMessages.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm font-semibold text-slate-700">No support requests yet</p>
            <p className="mt-1 text-sm text-slate-500">When you contact support, your latest messages will appear here.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {supportMessages.map((message) => (
              <li key={message.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-800">{message.serviceType?.replace("Support:", "").trim() || "Support request"}</p>
                <p className="mt-2 text-sm text-slate-600">{message.message}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString("en-US")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
