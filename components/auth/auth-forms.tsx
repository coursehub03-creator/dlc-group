"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validators/auth";

type FieldErrors = Record<string, string | undefined>;

type Locale = "en" | "ar";

const copy = {
  en: {
    fullName: "Full name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    newPassword: "New password",
    signIn: "Sign in",
    createAccount: "Create account",
    creatingAccount: "Creating account...",
    signingIn: "Signing in...",
    forgotPassword: "Forgot password?",
    sendReset: "Send reset link",
    resetPassword: "Reset password",
    signInPrompt: "Already have an account?",
    signUpPrompt: "New here?",
    backToSignIn: "Back to sign in",
    rememberPassword: "Remembered your password?",
    registrationSuccess: "Account created successfully. Redirecting you to sign in...",
    registrationNotice: "Account created. Please sign in.",
    invalidCredentials: "Invalid email or password. Please try again.",
    genericError: "We could not complete your request. Please try again.",
    forgotPasswordSuccess: "If this email exists, a reset link will be sent shortly.",
    resetPasswordSuccess: "Your password has been reset. You can now sign in.",
    connectionError: "Could not connect right now. Please try again.",
    accountExists: "An account already exists with this email."
  },
  ar: {
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    creatingAccount: "جاري إنشاء الحساب...",
    signingIn: "جاري تسجيل الدخول...",
    forgotPassword: "نسيت كلمة المرور؟",
    sendReset: "إرسال رابط إعادة التعيين",
    resetPassword: "إعادة تعيين كلمة المرور",
    signInPrompt: "لديك حساب بالفعل؟",
    signUpPrompt: "مستخدم جديد؟",
    backToSignIn: "العودة إلى تسجيل الدخول",
    rememberPassword: "تذكرت كلمة المرور؟",
    registrationSuccess: "تم إنشاء الحساب بنجاح. سيتم تحويلك إلى تسجيل الدخول...",
    registrationNotice: "تم إنشاء الحساب. يرجى تسجيل الدخول.",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    genericError: "تعذر إكمال الطلب حالياً. حاول مرة أخرى.",
    forgotPasswordSuccess: "إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين قريباً.",
    resetPasswordSuccess: "تم إعادة تعيين كلمة المرور. يمكنك تسجيل الدخول الآن.",
    connectionError: "تعذر الاتصال حالياً. حاول مرة أخرى.",
    accountExists: "يوجد حساب مسجل بهذا البريد الإلكتروني."
  }
} as const;

function useLocale(): { locale: Locale; t: (typeof copy)[Locale] } {
  const searchParams = useSearchParams();
  const locale: Locale = searchParams.get("lang") === "ar" ? "ar" : "en";
  return { locale, t: copy[locale] };
}

function withLang(href: string, locale: Locale) {
  return `${href}?lang=${locale}`;
}

function InputField({
  name,
  label,
  type = "text",
  autoComplete,
  error
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="grid gap-1.5 text-start">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = signUpSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0]
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const payload = (await response.json()) as { message?: string; fieldErrors?: Record<string, string[]> };

      if (!response.ok) {
        setErrors({ email: payload.fieldErrors?.email?.[0] });
        setMessage(payload.message ?? t.accountExists);
        return;
      }

      setMessage(t.registrationSuccess);
      setTimeout(() => router.push(withLang("/auth/sign-in", locale) + "&registered=1"), 900);
    } catch {
      setMessage(t.connectionError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <InputField name="fullName" label={t.fullName} autoComplete="name" error={errors.fullName} />
      <InputField name="email" label={t.email} type="email" autoComplete="email" error={errors.email} />
      <InputField name="password" label={t.password} type="password" autoComplete="new-password" error={errors.password} />
      <InputField name="confirmPassword" label={t.confirmPassword} type="password" autoComplete="new-password" error={errors.confirmPassword} />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? t.creatingAccount : t.createAccount}
      </button>
      <p className="text-center text-sm text-slate-600">
        {t.signInPrompt} <Link href={withLang("/auth/sign-in", locale)} className="font-medium text-slate-800 underline">{t.signIn}</Link>
      </p>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const callbackUrl = useMemo(() => {
    const requested = searchParams.get("callbackUrl");
    if (!requested) return "/client/dashboard";

    if (requested.startsWith("/")) return requested;

    try {
      const parsed = new URL(requested, window.location.origin);
      if (parsed.origin !== window.location.origin) return "/client/dashboard";
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return "/client/dashboard";
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = signInSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0]
      });
      return;
    }

    setIsSubmitting(true);
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      callbackUrl
    });

    setIsSubmitting(false);

    if (!result) {
      setMessage(t.genericError);
      return;
    }

    if (result.error) {
      setMessage(result.error === "CredentialsSignin" ? t.invalidCredentials : t.genericError);
      return;
    }

    router.push(result.url || "/client/dashboard");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <SignInRegistrationNotice />
      <InputField name="email" label={t.email} type="email" autoComplete="email" error={errors.email} />
      <InputField name="password" label={t.password} type="password" autoComplete="current-password" error={errors.password} />
      <div className="flex justify-end">
        <Link href={withLang("/auth/forgot-password", locale)} className="text-sm font-medium text-slate-700 underline">{t.forgotPassword}</Link>
      </div>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? t.signingIn : t.signIn}
      </button>
      <p className="text-center text-sm text-slate-600">
        {t.signUpPrompt} <Link href={withLang("/auth/sign-up", locale)} className="font-medium text-slate-800 underline">{t.createAccount}</Link>
      </p>
    </form>
  );
}

function SignInRegistrationNotice() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const registrationNotice = searchParams.get("registered") === "1" ? t.registrationNotice : "";

  if (!registrationNotice) return null;

  return <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{registrationNotice}</p>;
}

export function ForgotPasswordForm() {
  const { locale, t } = useLocale();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = forgotPasswordSchema.safeParse(data);

    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? t.genericError);
      return;
    }

    setMessage(t.forgotPasswordSuccess);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <InputField name="email" label={t.email} type="email" autoComplete="email" error={error} />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
        {t.sendReset}
      </button>
      <p className="text-center text-sm text-slate-600">
        {t.rememberPassword} <Link href={withLang("/auth/sign-in", locale)} className="font-medium text-slate-800 underline">{t.backToSignIn}</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const { locale, t } = useLocale();
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = resetPasswordSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0]
      });
      return;
    }

    setMessage(t.resetPasswordSuccess);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <InputField name="password" label={t.newPassword} type="password" autoComplete="new-password" error={errors.password} />
      <InputField name="confirmPassword" label={t.confirmPassword} type="password" autoComplete="new-password" error={errors.confirmPassword} />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
        {t.resetPassword}
      </button>
      <p className="text-center text-sm text-slate-600">
        <Link href={withLang("/auth/sign-in", locale)} className="font-medium text-slate-800 underline">{t.backToSignIn}</Link>
      </p>
    </form>
  );
}
