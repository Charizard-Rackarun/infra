"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Copy, QrCode, Store, Ticket } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, useFetch } from "@/lib/hooks";
import { Alert, Spinner } from "@/components/form";
import type { RewardSummary } from "@/types";

const duracao = (segundos: number) => (segundos < 60 ? `${segundos} s` : `${Math.round(segundos / 60)} min`);

/** Cupons disponíveis para troca. Os que o visitante já pode pagar aparecem primeiro. */
export function CuponsResgate({ rewards, onRedeemed, limit }: { rewards: RewardSummary; onRedeemed: () => void; limit?: number }) {
  const [resgatando, setResgatando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string; codigo?: string | null } | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function resgatar(code: string) {
    setResultado(null);
    setResgatando(code);
    try {
      const r = await api.redeemCoupon(code);
      setResultado({ ok: r.success, msg: r.message, codigo: r.resgateCodigo });
      onRedeemed();
    } catch (e) {
      setResultado({ ok: false, msg: errorMessage(e) });
    } finally {
      setResgatando(null);
    }
  }

  async function copiar(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sem permissão de área de transferência */ }
  }

  const ordenados = [...rewards.coupons].sort((a, b) => {
    const pagaA = (a.costPoints ?? 0) <= rewards.points ? 0 : 1;
    const pagaB = (b.costPoints ?? 0) <= rewards.points ? 0 : 1;
    return pagaA - pagaB || (a.costPoints ?? 0) - (b.costPoints ?? 0);
  });
  const lista = limit ? ordenados.slice(0, limit) : ordenados;

  return (
    <div>
      {resultado && (
        <div className="mb-5">
          <Alert kind={resultado.ok ? "success" : "error"}>
            {resultado.msg}
            {resultado.ok && resultado.codigo && (
              <button onClick={() => copiar(resultado.codigo!)} className="mt-2 flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-mono text-xs font-bold text-emerald-700">
                {copiado ? <Check size={13} /> : <Copy size={13} />} {resultado.codigo}
              </button>
            )}
          </Alert>
        </div>
      )}

      {lista.length === 0 ? (
        <div className="card px-6 py-12 text-center text-xs text-slate-400">
          Nenhum cupom disponível no momento. As lojas parceiras ainda estão publicando ofertas, volte em breve.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map((c) => {
            const custo = c.costPoints ?? 0;
            const falta = Math.max(0, custo - rewards.points);
            const pode = falta === 0;
            return (
              <article key={c.id} className="card overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                  <span className="pill bg-white text-slate-500">{c.category}</span>
                  <Ticket size={18} className="text-brand" />
                </div>
                <div className="p-5">
                  <div className="text-xs text-slate-400">{c.store}</div>
                  <h3 className="mt-1 font-bold text-ink">{c.title}</h3>
                  <div className="my-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-4 text-center">
                    <div className="text-3xl font-extrabold text-brand">{c.discount}</div>
                    <div className="mt-1 text-[10px] text-slate-500">{c.description}</div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Válido até {c.expires}</span>
                    <span className="font-bold text-slate-600">{custo} pontos</span>
                  </div>
                  {!pode && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand/60" style={{ width: `${Math.min(100, (rewards.points / custo) * 100)}%` }} />
                    </div>
                  )}
                  <button onClick={() => resgatar(c.code)} disabled={resgatando !== null || !pode} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {resgatando === c.code ? <Spinner /> : <QrCode size={15} />} {pode ? "Resgatar cupom" : `Faltam ${falta} pontos`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Pesquisas de todas as lojas parceiras que o visitante ainda não respondeu. */
export function MaisQuestionarios({ excluirId, titulo = "Ganhe mais pontos", subtitulo = "Responda pesquisas rápidas de outras lojas e troque por mais cupons." }: { excluirId?: number; titulo?: string; subtitulo?: string }) {
  const { data, error, loading } = useFetch(() => api.listQuestionariosPublicos());
  const disponiveis = (data ?? []).filter((q) => !q.respondido && q.id !== excluirId);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div><h2 className="font-bold text-ink">{titulo}</h2><p className="mt-1 text-xs text-slate-400">{subtitulo}</p></div>
        {data && <span className="pill shrink-0 bg-violet-50 text-violet-700">{disponiveis.length} {disponiveis.length === 1 ? "pesquisa" : "pesquisas"}</span>}
      </div>
      {error && <Alert>{error}</Alert>}
      {loading && !data && <div className="h-32 animate-pulse rounded-2xl bg-white" />}
      {data && disponiveis.length === 0 && (
        <div className="card px-6 py-10 text-center text-xs text-slate-400">Você já respondeu todas as pesquisas disponíveis. Novas pesquisas aparecem aqui quando as lojas publicarem.</div>
      )}
      {disponiveis.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {disponiveis.map((q) => (
            <Link key={q.id} href={`/responder/${q.id}`} className="card group flex flex-col p-5 transition hover:border-brand">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><Store size={13} className="text-slate-400" /> {q.loja}<span className="text-slate-300">·</span><span className="font-normal text-slate-400">{q.segmento}</span></div>
              <h3 className="mt-2 font-bold text-ink">{q.titulo}</h3>
              {q.descricao && <p className="mt-1 text-xs text-slate-400">{q.descricao}</p>}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-50 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill bg-blue-50 text-brand">+{q.pontosHoje} pontos{q.pontosHoje > q.pontos ? " (em dobro hoje)" : ""}</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400"><Clock size={12} /> {q.totalPerguntas} {q.totalPerguntas === 1 ? "pergunta" : "perguntas"}, cerca de {duracao(q.segundosEstimados)}</span>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-300 transition group-hover:text-brand" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
