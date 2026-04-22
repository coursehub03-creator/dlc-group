"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  LifeBuoy,
  Bell,
  Mail,
  FolderTree,
  Activity,
  FilePenLine,
  Settings,
  Shield,
  Menu
} from "lucide-react";
import { adminSignOutAction } from "../actions";
import { cn } from "@/lib/utils/cn";
import { adminText, getAdminLang } from "@/lib/admin/i18n";

type Props = {
  children: React.ReactNode;
  user: { name: string | null; email: string };
};

export function AdminShell({ children, user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  const lang = getAdminLang(params.get("lang"));
  const t = adminText(lang);

  const withLang = (href: string) => `${href}?lang=${lang}`;

  const nav = [
    ["/admin/dashboard", t.nav.overview, LayoutDashboard],
    ["/admin/dashboard/users", t.nav.users, Users],
    ["/admin/dashboard/requests", t.nav.requests, FileText],
    ["/admin/dashboard/support", t.nav.support, LifeBuoy],
    ["/admin/dashboard/notifications", t.nav.notifications, Bell],
    ["/admin/dashboard/contact", t.nav.contact, Mail],
    ["/admin/dashboard/categories", t.nav.categories, FolderTree],
    ["/admin/dashboard/activity", t.nav.activity, Activity],
    ["/admin/dashboard/content", t.nav.content, FilePenLine],
    ["/admin/dashboard/settings", t.nav.settings, Settings],
    ["/admin/dashboard/security", t.nav.security, Shield]
  ] as const;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-white/10 bg-navy p-5 text-slate-100 transition md:static md:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
            lang === "ar" && "left-auto right-0 border-l border-r-0"
          )}
        >
          <Link href={`/?lang=${lang}`} className="block">
            <p className="text-xs uppercase tracking-[0.24em] text-gold">{t.common.adminPortal}</p>
            <p className="mt-2 text-lg font-semibold">{t.common.operations}</p>
          </Link>
          <p className="mt-1 text-xs text-slate-300">{user.email}</p>
          <nav className="mt-6 space-y-2">
            {nav.map(([href, label, Icon]) => {
              const active = href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={withLang(href)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    active ? "bg-white/15" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col md:ml-0">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded border p-2 md:hidden" onClick={() => setOpen((v) => !v)}>
                <Menu className="h-4 w-4" />
              </button>
              <input
                placeholder={lang === "ar" ? "بحث عن المستخدمين والطلبات..." : "Search users and requests..."}
                className="w-full max-w-lg rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <Link href={`${pathname}?lang=${lang === "ar" ? "en" : "ar"}`} className="rounded-lg border px-3 py-2 text-xs">
                {lang === "ar" ? "EN" : "AR"}
              </Link>
              <div className="text-right text-xs">
                <p className="font-semibold">{user.name ?? (lang === "ar" ? "مسؤول" : "Admin")}</p>
                <p className="text-slate-500">{t.common.administrator}</p>
              </div>
              <form action={adminSignOutAction}>
                <button className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white">{t.common.logout}</button>
              </form>
            </div>
          </header>
          <section className="p-4 md:p-6">{children}</section>
        </main>
      </div>
    </div>
  );
}
