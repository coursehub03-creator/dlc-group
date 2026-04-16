import { SiteShell } from "@/components/layout/site-shell";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
