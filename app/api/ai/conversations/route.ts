import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const guest = await prisma.user.findUnique({
    where: { email: "ai-guest@dlc.local" },
    select: { id: true }
  });

  if (!guest) {
    return Response.json({ conversations: [] });
  }

  const conversations = await prisma.aIConversation.findMany({
    where: { userId: guest.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  return Response.json({ conversations });
}
