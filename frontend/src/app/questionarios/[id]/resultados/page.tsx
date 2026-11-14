"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Copy, Info, Trophy, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, EmptyState, PageSkeleton, btnGhost, btnPrimary } from "@/components/form";
import type { PerguntaResultado, TipoPergunta } from "@/types";

const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}%`;
const nota = (n: number) => n.toFixed(1).replace(".", ",");
const ROTULO_TIPO: Record<TipoPergunta, string> = {
  unica: "Escolha única", multipla: "Múltipla escolha", escala: "Escala de 1 a 5", sim_nao: "Sim ou não",
};

/** Opções com mais votos (mais de uma em caso de empate). Vazio se ninguém respondeu. */
function lideres(p: PerguntaResultado) {
  const max = Math.max(...p.opcoes.map((o) => o.total));
  return max > 0 ? p.opcoes.filter((o) => o.total === max) : [];
}

export default function ResultadosPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, error, loading } = useFetch(() => api.getResultados(id), [id]);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const link = `${window.location.origin}/responder/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copie o link do questionário:", link);
    }
  }

  const copiarBtn = (estilo: string) => (
    <button onClick={copyLink} className={estilo}>{copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar link para visitantes</>}</button>
  );

  return (
    <>
      <Link href="/questionarios" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand"><ArrowLeft size={14} /> Questionários</Link>
      <PageHeading
        eyebrow={`QUESTIONÁRIO #${id}`}
        title="Resultados"
        description="O que os visitantes mais responderam, de forma agregada e anônima."
        action={copiarBtn(btnGhost)}
      />
      {error && <Alert>{error}</Alert>}
      {loading && !data && <PageSkeleton />}

      {data && data.totalRespostas === 0 && (
        <EmptyState icon={<Users size={22} />} title="Ainda não há respostas" action={copiarBtn(btnPrimary)}>
          Compartilhe o link com os visitantes ou gere um QR code para o balcão. Os resultados aparecem aqui assim que as primeiras respostas chegarem.
        </EmptyState>
      )}

      {data && data.totalRespostas > 0 && (
        <div className="max-w-3xl space-y-5">
          <div className="card flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand"><Users size={20} /></div>
            <div><div className="text-2xl font-extrabold text-ink">{data.totalRespostas}</div><div className="text-xs text-slate-400">{data.totalRespostas === 1 ? "resposta recebida" : "respostas recebidas"}</div></div>
          </div>

          {data.amostraPequena && (
            <Alert kind="info">
              <span className="flex items-center gap-1.5 font-bold"><Info size={14} /> Amostra pequena</span>
              <span className="mt-1 block font-normal">Você tem {data.totalRespostas} de {data.minimoRecomendado} respostas recomendadas. Os percentuais já aparecem, mas ainda podem mudar bastante. Use como indicativo.</span>
            </Alert>
          )}

          <section className="card p-5 md:p-6">
            <h2 className="flex items-center gap-2 font-bold text-ink"><Trophy size={16} className="text-amber-500" /> Principais resultados</h2>
            <ul className="mt-4 divide-y divide-slate-50">
              {data.perguntas.map((p) => {
                if (p.respondentes === 0) return null;
                const top = lideres(p);
                return (
                  <li key={p.perguntaId} className="flex items-start justify-between gap-4 py-3 text-xs">
                    <span className="text-slate-500">{p.texto}</span>
                    <strong className="shrink-0 text-right text-slate-700">
                      {p.tipo === "escala" && p.media !== null
                        ? `Nota média ${nota(p.media)} de 5`
                        : top.length > 0 ? `${top.map((o) => o.texto).join(" / ")} (${pct(top[0].percentual)})` : "—"}
                    </strong>
                  </li>
                );
              })}
            </ul>
          </section>

          {data.perguntas.map((p, i) => {
            const top = new Set(lideres(p).map((o) => o.opcaoId));
            return (
              <section key={p.perguntaId} className="card p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-400">
                  <span>PERGUNTA {i + 1}</span>
                  <span className="font-normal">{ROTULO_TIPO[p.tipo]} · {p.respondentes} {p.respondentes === 1 ? "respondente" : "respondentes"}</span>
                </div>
                <h3 className="mt-1 font-bold text-ink">{p.texto}</h3>

                {p.tipo === "escala" && p.media !== null && (
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-brand">{nota(p.media)}</span>
                    <span className="text-xs text-slate-400">de 5, nota média</span>
                  </div>
                )}
                {p.tipo === "multipla" && <p className="mt-1 text-[11px] text-slate-400">Cada pessoa pôde marcar mais de uma opção, então a soma passa de 100%.</p>}

                <div className="mt-4 space-y-3.5">
                  {p.opcoes.map((o) => {
                    const destaque = p.tipo !== "escala" && top.has(o.opcaoId);
                    return (
                      <div key={o.opcaoId}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-2 font-semibold text-slate-600">
                            {o.texto}
                            {destaque && <span className="pill bg-amber-50 text-amber-700">Mais escolhida</span>}
                          </span>
                          <span className="shrink-0 text-slate-400"><strong className="text-slate-700">{pct(o.percentual)}</strong> · {o.total}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full transition-all ${p.tipo === "escala" || destaque ? "bg-brand" : "bg-blue-200"}`} style={{ width: `${o.percentual}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
