import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const jurisdiction = searchParams.get("jurisdiction") ?? undefined;

  const guest = await prisma.user.findUnique({ where: { email: "ai-guest@dlc.local" }, select: { id: true } });
  if (!guest) return Response.json({ conversations: [], stats: { total: 0 } });

  const conversations = await prisma.aIConversation.findMany({
    where: { userId: guest.id, category, jurisdiction },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return Response.json({
    conversations,
    stats: {
      total: conversations.length,
      byCategory: Object.entries(conversations.reduce<Record<string, number>>((acc, c) => ((acc[c.category] = (acc[c.category] ?? 0) + 1), acc), {})),
      byJurisdiction: Object.entries(conversations.reduce<Record<string, number>>((acc, c) => ((acc[c.jurisdiction ?? "unspecified"] = (acc[c.jurisdiction ?? "unspecified"] ?? 0) + 1), acc), {})),
    },
  });
}
