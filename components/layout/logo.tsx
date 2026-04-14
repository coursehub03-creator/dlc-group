import { brand } from "@/config/brand";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded bg-gold px-2 py-1 text-xs font-bold text-navy">DLC</div>
      <div>
        <p className="text-sm font-semibold text-navy">{brand.nameEn}</p>
        <p className="text-xs text-slate-500">{brand.nameAr}</p>
      </div>
    </div>
  );
}
