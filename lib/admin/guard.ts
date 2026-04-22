import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export type AdminLocale = "en" | "ar";

export function resolveAdminLocale(value?: string | null): AdminLocale {
  return value === "ar" ? "ar" : "en";
}

export async function requireAdminUser() {
  const session = await auth();
  const id = session?.user?.id;

  if (!id) {
    redirect("/auth/sign-in?callbackUrl=/admin/dashboard");
  }

  const user = await getAdminUserForGuard(id);

  if (!user || !user.isActive || user.role !== "ADMIN") {
    redirect("/client/dashboard");
  }

  return user;
}

async function getAdminUserForGuard(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022")
    ) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!user) {
        return null;
      }

      return { ...user, isActive: true };
    }

    throw error;
  }
}

export async function withSafeAdminQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022")
    ) {
      return fallback;
    }
    throw error;
  }
}
