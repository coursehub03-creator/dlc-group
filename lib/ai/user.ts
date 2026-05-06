import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const GUEST_EMAIL = "ai-guest@dlc.local";

export async function getCurrentAIUserId() {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const guestUser = await prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: {
      email: GUEST_EMAIL,
      name: "AI Guest User",
      passwordHash:
        "scrypt:55ac2bdb81e720f150b0326f03d22407:d570fc9a2a07f996c28a5e776e48d6ec85853c9ff5d83a9bf07ad5ad6ed1419a926e4cde7cf90d27f581066751ef9b53d3c71ed663f2b3d07fdb2379a0a31551",
    },
  });

  return guestUser.id;
}
