import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function PageHeading({
  eyebrow, title, description, action,
}: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-[10px] font-bold tracking-[.16em] text-brand">{eyebrow}</div>}
        <h1 className="font-[Manrope] text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const accents = {
  blue: "bg-blue-50 text-brand",
  violet: "bg-violet-50 text-violet-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
} as const;

export function StatCard({
  label, value, change, icon, accent = "blue",
}: { label: string; value: string; change: number; icon: ReactNode; accent?: keyof typeof accents }) {
  const up = change >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}>{icon}</span>
      </div>
      <div className="mt-4 font-[Manrope] text-2xl font-extrabold tracking-tight text-ink">{value}</div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px]">
        <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold ${up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
        </span>
        <span className="text-slate-400">vs. período anterior</span>
      </div>
    </div>
  );
}