import { requireAdminUser } from "@/lib/admin/guard";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  return children;
}
