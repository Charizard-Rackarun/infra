import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-brand focus:ring-4 focus:ring-blue-50";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-rose-100 bg-rose-50 text-rose-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    info: "border-blue-100 bg-blue-50 text-blue-700",
  }[kind];
  const Icon = kind === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl border p-3.5 text-xs font-semibold ${styles}`}>
      <Icon size={16} className="mt-px shrink-0" />
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 size={16} className={`animate-spin ${className}`} />;
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand">{icon}</div>
      <h3 className="font-bold text-ink">{title}</h3>
      {children && <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-12 w-64 rounded-xl bg-slate-200" />
      <div className="h-48 rounded-2xl bg-white" />
    </div>
  );
}
