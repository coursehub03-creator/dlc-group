"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type DashboardHeaderProps = {
  locale: "en" | "ar";
  onMenuClick: () => void;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

const copy = {
  en: {
    role: "Role",
    logout: "Logout",
    workspace: "Client Workspace"
  },
  ar: {
    role: "الدور",
    logout: "تسجيل الخروج",
    workspace: "مساحة العميل"
  }
} as const;

export function DashboardHeader({ locale, onMenuClick, user }: DashboardHeaderProps) {
  const t = copy[locale];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <Link href={`/client/dashboard?lang=${locale}`} className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-navy">
              {t.workspace}
            </Link>
            <p className="truncate text-sm font-semibold text-navy">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-flex">
            {t.role}: {user.role}
          </span>
          <LanguageSwitcher />
          <button
            onClick={() => signOut({ callbackUrl: locale === "ar" ? "/?lang=ar" : "/" })}
            className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
