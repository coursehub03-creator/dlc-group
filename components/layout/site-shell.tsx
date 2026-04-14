import { Suspense } from "react";
import { SiteShellClient } from "@/components/layout/site-shell-client";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SiteShellClient>{children}</SiteShellClient>
    </Suspense>
  );
}
