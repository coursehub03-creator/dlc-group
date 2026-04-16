import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/auth-forms";
import { Suspense } from "react";

const copy = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to access your secure client legal workspace."
  },
  ar: {
    title: "مرحباً بعودتك",
    subtitle: "سجّل الدخول للوصول إلى مساحة عملك القانونية الآمنة."
  }
} as const;

export default async function Page({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = (await searchParams) ?? {};
  const locale = params.lang === "ar" ? "ar" : "en";

  return (
    <AuthLayout title={copy[locale].title} subtitle={copy[locale].subtitle}>
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
