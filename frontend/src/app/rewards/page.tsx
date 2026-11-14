"use client";

import Link from "next/link";
import { Gift, Moon, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert } from "@/components/form";
import { CuponsResgate, MaisQuestionarios } from "@/components/visitante";

export default function RewardsPage() {
  const rewards = useFetch(() => api.getRewards());
  const evento = useFetch(() => api.getSexta13());

  const data = rewards.data;
  if (rewards.error && !data) return <Alert>{rewards.error}</Alert>;
  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const semPontos = data.points === 0;
  const progress = data.nextLevelPoints > 0 ? Math.min(100, (data.points / data.nextLevelPoints) * 100) : 100;
  const faltam = Math.max(0, data.nextLevelPoints - data.points);
  const ev = evento.data;

  const pesquisas = <MaisQuestionarios subtitulo="Cada pesquisa respondida vira pontos para trocar pelos cupons das lojas parceiras." />;

  return (
    <>
      <PageHeading eyebrow="VITRINEIA REWARDS" title="Benefícios para consumidores" description="Uma experiência de fidelidade que conecta pessoas às ofertas das lojas." />

      {ev && (
        <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${ev.ativo ? "border-violet-200 bg-gradient-to-r from-violet-600 to-indigo-600 text-white" : "border-violet-100 bg-violet-50 text-violet-900"}`}>
          <Moon size={20} className="mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-extrabold">{ev.nome}</div>
            <p className={`mt-0.5 text-xs leading-relaxed ${ev.ativo ? "text-violet-100" : "text-violet-800"}`}>{ev.mensagem}</p>
          </div>
        </div>
      )}

      <section className="relative mb-6 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#273b87] via-[#3157D5] to-[#7658D6] p-6 text-white shadow-soft md:p-8">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-100"><Sparkles size={15} /> CLUBE DE BENEFÍCIOS</div>
            <h2 className="mt-3 text-2xl font-extrabold">Cada descoberta vale uma recompensa.</h2>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-blue-100/80">Participe de pesquisas, explore ofertas e acumule pontos para desbloquear benefícios especiais.</p>
            <div className="mt-6 max-w-sm">
              <div className="mb-2 flex justify-between text-[10px] text-blue-100"><span>Nível {data.level}</span><span>{data.points} / {data.nextLevelPoints} pontos</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} /></div>
              <div className="mt-2 text-[10px] text-blue-100/70">{faltam > 0 ? `${faltam} pontos para o próximo nível` : "Você está no nível máximo!"}</div>
            </div>
          </div>
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-white/10"><Gift size={54} strokeWidth={1.3} /></div>
        </div>
      </section>

      {semPontos && (
        <div className="mb-8">
          <Alert kind="info">Você ainda não tem pontos. Responda uma das pesquisas abaixo para ganhar pontos e trocar por cupons. Os cupons disponíveis aparecem logo depois.</Alert>
        </div>
      )}

      {semPontos && <div className="mb-10">{pesquisas}</div>}

      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><h2 className="font-bold text-ink">Cupons disponíveis</h2><p className="mt-1 text-xs text-slate-400">Troque seus pontos e apresente o código na loja</p></div>
          <span className="pill shrink-0 bg-blue-50 text-brand">{data.coupons.length} ofertas</span>
        </div>
        <CuponsResgate rewards={data} onRedeemed={rewards.reload} />
      </section>

      {!semPontos && <div className="mt-10">{pesquisas}</div>}

      {semPontos && <p className="mt-8 text-center text-[11px] text-slate-400"><Link href="/login" className="font-bold text-brand">Sou lojista</Link></p>}
    </>
  );
}
