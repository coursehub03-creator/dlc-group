import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

const copy = {
  en: {
    title: "Reset password",
    subtitle: "Set a new password for your legal client account."
  },
  ar: {
    title: "إعادة تعيين كلمة المرور",
    subtitle: "عيّن كلمة مرور جديدة لحسابك القانوني."
  }
} as const;

export default async function Page({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = (await searchParams) ?? {};
  const locale = params.lang === "ar" ? "ar" : "en";

  return (
    <AuthLayout title={copy[locale].title} subtitle={copy[locale].subtitle}>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
