import { prisma } from "@/lib/db/prisma";

export default async function AdminAIConversationsPage() {
  const conversations = await prisma.aIConversation.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, title: true, category: true, jurisdiction: true, createdAt: true },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">AI Conversations</h1>
      <p className="text-sm text-slate-600">Usage visibility by category and jurisdiction with limited sensitive content exposure.</p>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Jurisdiction</th><th className="p-3">Created</th></tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id} className="border-t"><td className="p-3">{c.title}</td><td className="p-3">{c.category}</td><td className="p-3">{c.jurisdiction ?? "unspecified"}</td><td className="p-3">{c.createdAt.toISOString().slice(0, 10)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
