import { requireAdminUser } from "@/lib/admin/guard";
import { AdminShell } from "./components/admin-shell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminUser();

  return <AdminShell user={{ name: admin.name, email: admin.email }}>{children}</AdminShell>;
}
