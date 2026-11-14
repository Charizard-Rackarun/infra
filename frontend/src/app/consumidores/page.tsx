"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ShieldCheck, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, EmptyState, PageSkeleton, btnPrimary } from "@/components/form";

export default function ConsumidoresPage() {
  const { data, error, loading } = useFetch(() => api.getConsumerSegments());

  return (
    <>
      <PageHeading eyebrow="AUDIÊNCIA" title="Consumidores" description="Perfil agregado e anônimo dos visitantes, construído a partir das respostas aos questionários." />
      {error && <Alert>{error}</Alert>}
      {loading && !data && <PageSkeleton />}
      {data && data.length === 0 && (
        <EmptyState
          icon={<ShieldCheck size={22} />}
          title="Ainda não há dados suficientes"
          action={<Link href="/questionarios" className={btnPrimary}>Ir para questionários</Link>}
        >
          Para proteger a privacidade dos visitantes (LGPD), um segmento só aparece quando reúne respostas suficientes. Publique um questionário com uma pergunta de “Interesses” e compartilhe o link.
        </EmptyState>
      )}
      {data && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((s) => {
            const up = s.trend >= 0;
            return (
              <article key={s.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: s.color }}><Users size={18} /></span>
                    <div><h3 className="font-bold text-ink">{s.name}</h3><div className="text-[11px] text-slate-400">{s.count.toLocaleString("pt-BR")} seleções</div></div>
                  </div>
                  <span className={`pill flex items-center gap-0.5 ${up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                    {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(s.trend)}%
                  </span>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-400">Participação</span><strong className="text-slate-700">{s.percentage}%</strong></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${s.percentage}%`, background: s.color }} /></div>
                </div>
                {s.interests.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-[10px] font-bold tracking-wider text-slate-400">TAMBÉM INTERESSADOS EM</div>
                    <div className="flex flex-wrap gap-1.5">{s.interests.map((i) => <span key={i} className="pill bg-slate-50 text-slate-500">{i}</span>)}</div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
