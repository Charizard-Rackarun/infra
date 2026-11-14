"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Sparkles, Store } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, useFetch } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, EmptyState, PageSkeleton, Spinner, btnGhost, btnPrimary } from "@/components/form";
import type { Opportunity } from "@/types";

const prioridadeStyle: Record<Opportunity["priority"], string> = {
  Alta: "bg-rose-50 text-rose-600",
  Média: "bg-amber-50 text-amber-700",
  Baixa: "bg-slate-100 text-slate-500",
};

export default function OportunidadesPage() {
  const { data, error, loading, setData } = useFetch(() => api.getOpportunities());
  const [gerando, setGerando] = useState(false);
  const [genError, setGenError] = useState("");
  const [gerou, setGerou] = useState(false);

  async function gerar() {
    setGenError("");
    setGerando(true);
    try {
      setData(await api.generateOpportunities());
      setGerou(true);
    } catch (e) {
      setGenError(errorMessage(e));
    } finally {
      setGerando(false);
    }
  }

  const botao = (
    <button onClick={gerar} disabled={gerando} className={btnPrimary}>
      {gerando ? <Spinner /> : <Sparkles size={15} />} {data && data.length > 0 ? "Atualizar análise" : "Gerar análise com IA"}
    </button>
  );

  return (
    <>
      <PageHeading eyebrow="VITRINEIA INSIGHTS" title="Oportunidades" description="Conexões entre interesses dos visitantes que podem virar campanhas conjuntas entre lojas." action={botao} />
      {error && <Alert>{error}</Alert>}
      {genError && <div className="mb-4"><Alert>{genError}</Alert></div>}
      {loading && !data && <PageSkeleton />}

      {data && data.length === 0 && (
        <EmptyState icon={<Lightbulb size={22} />} title={gerou ? "Nenhuma oportunidade encontrada ainda" : "Nenhuma análise gerada"} action={gerou ? <Link href="/questionarios" className={btnGhost}>Ver questionários</Link> : botao}>
          {gerou
            ? "Ainda não há padrões fortes o bastante nas respostas. Colete mais respostas e tente novamente."
            : "A análise cruza os interesses informados nos questionários e sugere campanhas de venda cruzada. Quanto mais respostas, melhores os resultados."}
        </EmptyState>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.map((o) => (
            <article key={o.id} className="card p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`pill ${prioridadeStyle[o.priority]}`}>Prioridade {o.priority.toLowerCase()}</span>
                <span className="pill bg-blue-50 text-brand">{o.category}</span>
                <span className="pill bg-slate-50 text-slate-500">{o.potential}</span>
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-ink">{o.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{o.description}</p>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-400">Confiança</span><strong className="text-slate-700">{o.confidence}%</strong></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${o.confidence}%` }} /></div>
              </div>
              {o.stores.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Store size={14} className="text-slate-400" />
                  {o.stores.map((s) => <span key={s} className="pill bg-slate-50 text-slate-600">{s}</span>)}
                </div>
              )}
              <Link href="/campanhas" className={`${btnGhost} mt-5`}>Criar campanha a partir disto</Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
