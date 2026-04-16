import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/auth-forms";

export default function Page() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your secure client legal workspace.">
      <SignInForm />
    </AuthLayout>
  );
}
