import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function requireDashboardUser(): Promise<DashboardUser> {
  const session = await auth();
  const sessionUser = session?.user;
  const id = sessionUser?.id;

  if (typeof id !== "string" || id.trim().length === 0) {
    redirect("/auth/sign-in");
  }

  return {
    id,
    name: typeof sessionUser?.name === "string" && sessionUser.name.trim().length > 0 ? sessionUser.name : "Client",
    email: typeof sessionUser?.email === "string" ? sessionUser.email : "",
    role: typeof (sessionUser as { role?: unknown } | undefined)?.role === "string" ? String((sessionUser as { role?: string }).role) : "CLIENT"
  };
}

export function parseDashboardLocale(searchParams?: { lang?: string } | null): "en" | "ar" {
  return searchParams?.lang === "ar" ? "ar" : "en";
}

export async function withSafeDashboardQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error("[dashboard] query failed", error);
    return fallback;
  }
}
