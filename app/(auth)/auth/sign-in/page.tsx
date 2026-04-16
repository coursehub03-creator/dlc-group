import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/auth-forms";
import { Suspense } from "react";

export default function Page() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your secure client legal workspace.">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
