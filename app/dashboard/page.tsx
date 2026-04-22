import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function DashboardEntryPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }

  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/client/dashboard");
}
