"use client";

import Link from "next/link";
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

export function SiteShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = params.get("lang") === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {navItems[locale].map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={`${item.href}?lang=${locale}`}
                  className={`transition-colors ${active ? "text-navy" : "text-slate-600 hover:text-navy"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher />
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
