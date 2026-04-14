"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = params.get("lang") === "ar" ? "ar" : "en";

  const toggleLocale = () => {
    const next = new URLSearchParams(params.toString());
    next.set("lang", locale === "en" ? "ar" : "en");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <button
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.16em] text-slate-700 shadow-sm transition-all hover:border-gold hover:text-navy"
      onClick={toggleLocale}
    >
      {locale === "en" ? "AR" : "EN"}
    </button>
  );
}
