import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function createActivityLog(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  meta?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        meta: input.meta
      }
    });
  } catch (error) {
    console.error("[admin] activity logging skipped", error);
  }
}
