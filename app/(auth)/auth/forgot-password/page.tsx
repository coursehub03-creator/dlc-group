import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

const copy = {
  en: {
    title: "Forgot password",
    subtitle: "Enter your account email and we will send recovery instructions."
  },
  ar: {
    title: "نسيت كلمة المرور",
    subtitle: "أدخل بريدك الإلكتروني وسنرسل لك تعليمات الاستعادة."
  }
} as const;

export default async function Page({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = (await searchParams) ?? {};
  const locale = params.lang === "ar" ? "ar" : "en";

  return (
    <AuthLayout title={copy[locale].title} subtitle={copy[locale].subtitle}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
