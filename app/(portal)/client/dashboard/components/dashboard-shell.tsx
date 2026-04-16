"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
  stats: {
    totalConsultations: number;
    activeRequests: number;
    completedRequests: number;
  };
};

export function DashboardShell({ children, user, stats }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useSearchParams();
  const locale = params.get("lang") === "ar" ? "ar" : "en";

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <DashboardSidebar
          locale={locale}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          stats={stats}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            locale={locale}
            user={user}
            onMenuClick={() => setSidebarOpen((value) => !value)}
          />
          <main className="flex-1 px-4 pb-8 pt-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
