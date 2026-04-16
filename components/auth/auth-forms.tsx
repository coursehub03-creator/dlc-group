"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validators/auth";

type FieldErrors = Record<string, string | undefined>;

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
        setMessage(payload.message ?? "Unable to create account.");
        return;
      }

      setMessage("Account created successfully. Redirecting you to sign in...");
      setTimeout(() => router.push("/auth/sign-in?registered=1"), 900);
    } catch {
      setMessage("Could not connect right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <InputField name="fullName" label="Full name" autoComplete="name" error={errors.fullName} />
      <InputField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <InputField name="password" label="Password" type="password" autoComplete="new-password" error={errors.password} />
      <InputField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword} />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
      <p className="text-sm text-slate-600 text-center">
        Already have an account? <Link href="/auth/sign-in" className="font-medium text-slate-800 underline">Sign in</Link>
      </p>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const registrationNotice = useMemo(
    () => (searchParams.get("registered") === "1" ? "Account created. Please sign in." : ""),
    [searchParams]
  );

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
      redirect: false
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setMessage("Invalid email or password. Please try again.");
      return;
    }

    router.push("/client/dashboard");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      {registrationNotice ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{registrationNotice}</p> : null}
      <InputField name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      <InputField name="password" label="Password" type="password" autoComplete="current-password" error={errors.password} />
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-sm font-medium text-slate-700 underline">Forgot password?</Link>
      </div>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-sm text-slate-600 text-center">
        New here? <Link href="/auth/sign-up" className="font-medium text-slate-800 underline">Create account</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = forgotPasswordSchema.safeParse(data);

    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? "Please enter your email.");
      return;
    }

    setMessage("If this email exists, a reset link will be sent shortly.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <InputField name="email" label="Email" type="email" autoComplete="email" error={error} />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
        Send reset link
      </button>
      <p className="text-sm text-slate-600 text-center">
        Remembered your password? <Link href="/auth/sign-in" className="font-medium text-slate-800 underline">Back to sign in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
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

    setMessage("Your password has been reset. You can now sign in.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <InputField name="password" label="New password" type="password" autoComplete="new-password" error={errors.password} />
      <InputField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword} />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
        Reset password
      </button>
      <p className="text-sm text-slate-600 text-center">
        Back to <Link href="/auth/sign-in" className="font-medium text-slate-800 underline">sign in</Link>
      </p>
    </form>
  );
}
