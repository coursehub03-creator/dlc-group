import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden gap-5 text-sm md:flex">
            <Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/blog">Insights</Link><Link href="/contact">Contact</Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-12 bg-navy px-4 py-10 text-sm text-slate-100">
        <div className="mx-auto max-w-7xl">© {new Date().getFullYear()} DLC Group — Diamond Legal Consulting Group</div>
      </footer>
    </div>
  );
}
