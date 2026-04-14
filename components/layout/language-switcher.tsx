"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = params.get("lang") === "ar" ? "ar" : "en";
  return (
    <button
      className="rounded border border-slate-300 px-3 py-1 text-xs"
      onClick={() => router.push(`${pathname}?lang=${locale === "en" ? "ar" : "en"}`)}
    >
      {locale === "en" ? "AR" : "EN"}
    </button>
  );
}
