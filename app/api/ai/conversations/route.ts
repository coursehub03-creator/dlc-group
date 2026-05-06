import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const jurisdiction = searchParams.get("jurisdiction") ?? undefined;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json({ conversations: [], stats: { total: 0, byCategory: [], byJurisdiction: [] } });
    }

    const conversations = await prisma.aIConversation.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
        ...(jurisdiction ? { jurisdiction } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        mode: true,
        jurisdiction: true,
        updatedAt: true,
        createdAt: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });

    return Response.json({
      conversations: conversations.map((conversation) => ({
        ...conversation,
        mode: conversation.mode ?? conversation.category,
      })),
      stats: {
        total: conversations.length,
        byCategory: Object.entries(
          conversations.reduce<Record<string, number>>((acc, c) => ((acc[c.category] = (acc[c.category] ?? 0) + 1), acc), {}),
        ),
        byJurisdiction: Object.entries(
          conversations.reduce<Record<string, number>>(
            (acc, c) => ((acc[c.jurisdiction ?? "unspecified"] = (acc[c.jurisdiction ?? "unspecified"] ?? 0) + 1), acc),
            {},
          ),
        ),
      },
    });
  } catch (error) {
    console.error("[ai-conversations] failed", error instanceof Error ? error.message : error);
    return Response.json({ conversations: [], stats: { total: 0, byCategory: [], byJurisdiction: [] } });
  }
}
