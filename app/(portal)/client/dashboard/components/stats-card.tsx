type StatsCardProps = {
  label: string;
  value: number;
  accent: "navy" | "gold" | "slate";
};

const accentClasses = {
  navy: "border-navy/20 bg-navy/5 text-navy",
  gold: "border-gold/30 bg-gold/10 text-slate-900",
  slate: "border-slate-300 bg-white text-slate-900"
};

export function StatsCard({ label, value, accent }: StatsCardProps) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${accentClasses[accent]}`}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}
