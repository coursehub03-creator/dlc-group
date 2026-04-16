import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";

const messages = {
  en: {
    title: "Sign-in unavailable",
    subtitle: "We could not complete authentication. Please try again.",
    actions: {
      signIn: "Back to sign in",
      support: "Contact support"
    },
    byError: {
      Configuration: "Authentication service is temporarily misconfigured. Please try again shortly.",
      AccessDenied: "You are not allowed to sign in with this account.",
      CredentialsSignin: "Incorrect email or password. Please try again.",
      default: "Authentication failed unexpectedly."
    }
  },
  ar: {
    title: "تعذر تسجيل الدخول",
    subtitle: "تعذر إكمال عملية المصادقة حالياً. حاول مرة أخرى.",
    actions: {
      signIn: "العودة إلى تسجيل الدخول",
      support: "تواصل مع الدعم"
    },
    byError: {
      Configuration: "يوجد خلل مؤقت في إعدادات المصادقة. يرجى المحاولة لاحقاً.",
      AccessDenied: "ليس لديك صلاحية تسجيل الدخول بهذا الحساب.",
      CredentialsSignin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      default: "حدث خطأ غير متوقع أثناء المصادقة."
    }
  }
} as const;

export default async function AuthErrorPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: keyof (typeof messages)["en"]["byError"]; lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const locale = params.lang === "ar" ? "ar" : "en";
  const t = messages[locale];
  const errorKey = params.error ?? "default";
  const errorMessage = t.byError[errorKey] ?? t.byError.default;

  return (
    <AuthLayout title={t.title} subtitle={t.subtitle}>
      <div className="grid gap-4">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{errorMessage}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/auth/sign-in?lang=${locale}`} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            {t.actions.signIn}
          </Link>
          <Link href={`/contact?lang=${locale}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500">
            {t.actions.support}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
