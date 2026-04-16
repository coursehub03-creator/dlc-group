import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export default function Page() {
  return (
    <AuthLayout title="Forgot password" subtitle="Enter your account email and we will send recovery instructions.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
