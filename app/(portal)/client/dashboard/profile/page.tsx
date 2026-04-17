import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ProfileForm } from "../components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  });

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Manage your legal workspace identity and communication preferences.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProfileForm
          defaultValues={{
            name: user.name,
            email: user.email,
            phone: user.profile?.phone,
            country: user.profile?.country,
            language: user.profile?.language === "en" ? "en" : "ar"
          }}
        />
      </div>
    </section>
  );
}
