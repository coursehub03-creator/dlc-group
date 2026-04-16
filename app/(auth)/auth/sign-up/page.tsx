import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/auth-forms";

const copy = {
  en: {
    title: "Create your account",
    subtitle: "Open a secure account to manage requests, messages, and legal documents."
  },
  ar: {
    title: "أنشئ حسابك",
    subtitle: "افتح حساباً آمناً لإدارة الطلبات والرسائل والوثائق القانونية."
  }
} as const;

export default async function Page({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = (await searchParams) ?? {};
  const locale = params.lang === "ar" ? "ar" : "en";

  return (
    <AuthLayout title={copy[locale].title} subtitle={copy[locale].subtitle}>
      <SignUpForm />
    </AuthLayout>
  );
}
