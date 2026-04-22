"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const navItems = {
  en: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/blog", label: "Insights" },
    { href: "/contact", label: "Contact" }
  ],
  ar: [
    { href: "/", label: "الرئيسية" },
    { href: "/services", label: "الخدمات" },
    { href: "/blog", label: "الرؤى" },
    { href: "/contact", label: "تواصل معنا" }
  ]
} as const;

const authActions = {
  en: {
    signIn: "Sign In",
    signUp: "Create Account",
    dashboard: "Dashboard",
    logout: "Logout"
  },
  ar: {
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    dashboard: "لوحة التحكم",
    logout: "تسجيل الخروج"
  }
} as const;

export function SiteShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { status, data } = useSession();
  const locale = params.get("lang") === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = authActions[locale];
  const sessionRole = String((data?.user as { role?: string } | undefined)?.role ?? "").toUpperCase();
  const isAdmin = sessionRole === "ADMIN";

  const withLocale = (href: string) => `${href}?lang=${locale}`;

  return (
    <div dir={dir} className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {navItems[locale].map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={withLocale(item.href)}
                  className={`transition-colors ${active ? "text-navy" : "text-slate-600 hover:text-navy"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {status === "authenticated" ? (
              <>
                <Link
                  href={withLocale("/client/dashboard")}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-navy hover:text-navy"
                >
                  {t.dashboard}
                </Link>
                {isAdmin ? (
                  <Link
                    href={withLocale("/admin/dashboard")}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
                  >
                    Admin Dashboard
                  </Link>
                ) : null}
                <button
                  onClick={() => signOut({ callbackUrl: withLocale("/") })}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={withLocale("/auth/sign-in")}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-navy hover:text-navy"
                >
                  {t.signIn}
                </Link>
                <Link
                  href={withLocale("/auth/sign-up")}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.signUp}
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-white/30 bg-navy px-4 py-12 text-sm text-slate-100 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} DLC Group — Diamond Legal Consulting Group</p>
          <p className="text-slate-300">
            {locale === "ar" ? "خبرة قانونية عالمية، إدارة محلية دقيقة." : "Global legal intelligence. Local execution excellence."}
          </p>
        </div>
      </footer>
    </div>
  );
}
