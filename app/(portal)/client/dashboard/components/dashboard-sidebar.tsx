"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Bot,
  FolderKanban,
  UserCircle2,
  Settings,
  Bell,
  Shield,
  LifeBuoy,
  Activity,
  PlusSquare,
  X
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DashboardSidebarProps = {
  locale: "en" | "ar";
  isOpen: boolean;
  onClose: () => void;
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

const labels = {
  en: {
    title: "Client Portal",
    subtitle: "Diamond Legal Consulting",
    nav: [
      { href: "/client/dashboard", label: "Dashboard", icon: Home },
      { href: "/client/dashboard/requests", label: "My Requests", icon: FolderKanban },
      { href: "/client/dashboard/new-request", label: "New Request", icon: PlusSquare },
      { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
      { href: "/client/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/client/dashboard/activity", label: "Activity", icon: Activity },
      { href: "/client/dashboard/profile", label: "Profile", icon: UserCircle2 },
      { href: "/client/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/client/dashboard/security", label: "Security", icon: Shield },
      { href: "/client/dashboard/support", label: "Support", icon: LifeBuoy }
    ],
    summary: "Request Snapshot",
    total: "Total",
    active: "Active",
    completed: "Completed"
  },
  ar: {
    title: "بوابة العميل",
    subtitle: "دايموند للاستشارات القانونية",
    nav: [
      { href: "/client/dashboard", label: "لوحة التحكم", icon: Home },
      { href: "/client/dashboard/requests", label: "طلباتي", icon: FolderKanban },
      { href: "/client/dashboard/new-request", label: "طلب جديد", icon: PlusSquare },
      { href: "/ai-assistant", label: "المساعد الذكي", icon: Bot },
      { href: "/client/dashboard/notifications", label: "الإشعارات", icon: Bell },
      { href: "/client/dashboard/activity", label: "النشاط", icon: Activity },
      { href: "/client/dashboard/profile", label: "الملف الشخصي", icon: UserCircle2 },
      { href: "/client/dashboard/settings", label: "الإعدادات", icon: Settings },
      { href: "/client/dashboard/security", label: "الأمان", icon: Shield },
      { href: "/client/dashboard/support", label: "الدعم", icon: LifeBuoy }
    ],
    summary: "ملخص الطلبات",
    total: "الإجمالي",
    active: "النشطة",
    completed: "المكتملة"
  }
} as const;

export function DashboardSidebar({ locale, isOpen, onClose, user, stats }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = labels[locale];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-white/40 bg-gradient-to-b from-navy to-slate-900 p-6 text-slate-100 shadow-2xl transition-transform md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          locale === "ar" && "left-auto right-0 border-l border-r-0 md:border-l"
        )}
      >
        <button className="mb-4 ml-auto rounded-lg p-2 text-slate-300 md:hidden" onClick={onClose} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
        <div className="border-b border-white/10 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{t.title}</p>
          <h2 className="mt-2 text-lg font-semibold">{t.subtitle}</h2>
          <p className="mt-2 text-xs text-slate-300">{user.email}</p>
        </div>

        <nav className="mt-6 space-y-2">
          {t.nav.map(({ href, label, icon: Icon }) => {
            const [path, hash] = href.split("#");
            const active = path === "/client/dashboard" ? pathname === path : pathname.startsWith(path);
            const localizedHref = `${path}?lang=${locale}${hash ? `#${hash}` : ""}`;
            return (
              <Link
                key={href}
                href={localizedHref}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                  active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
          <p className="font-semibold text-gold">{t.summary}</p>
          <div className="mt-3 space-y-2 text-slate-200">
            <p className="flex justify-between"><span>{t.total}</span><strong>{stats.totalConsultations}</strong></p>
            <p className="flex justify-between"><span>{t.active}</span><strong>{stats.activeRequests}</strong></p>
            <p className="flex justify-between"><span>{t.completed}</span><strong>{stats.completedRequests}</strong></p>
          </div>
        </div>
      </aside>
    </>
  );
}
