import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/auth-forms";

export default function Page() {
  return (
    <AuthLayout title="Create your account" subtitle="Open a secure account to manage requests, messages, and legal documents.">
      <SignUpForm />
    </AuthLayout>
  );
}
