import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export default function Page() {
  return (
    <AuthLayout title="Reset password" subtitle="Set a new password for your legal client account.">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
