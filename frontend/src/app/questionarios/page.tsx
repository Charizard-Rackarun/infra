"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Check, ClipboardList, Copy, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, useFetch } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, EmptyState, PageSkeleton, btnGhost, btnPrimary } from "@/components/form";

export default function QuestionariosPage() {
  const { data, error, loading, reload } = useFetch(() => api.listQuestionarios());
  const [copied, setCopied] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  async function copyLink(id: number) {
    const link = `${window.location.origin}/responder/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copie o link do questionário:", link);
    }
  }

  async function toggle(id: number, ativo: boolean) {
    setActionError("");
    try {
      await api.setQuestionarioAtivo(id, !ativo);
      reload();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  }

  const novo = (
    <Link href="/questionarios/novo" className={btnPrimary}><Plus size={15} /> Novo questionário</Link>
  );

  return (
    <>
      <PageHeading
        eyebrow="PESQUISAS"
        title="Questionários"
        description="Pergunte aos visitantes o que eles procuram. Cada resposta vira pontos para eles e inteligência para você."
        action={novo}
      />
      {error && <Alert>{error}</Alert>}
      {actionError && <div className="mb-4"><Alert>{actionError}</Alert></div>}
      {loading && !data ? <PageSkeleton /> : null}
      {data && data.length === 0 && (
        <EmptyState icon={<ClipboardList size={22} />} title="Nenhum questionário ainda" action={novo}>
          Crie o primeiro questionário e compartilhe o link (ou um QR code) com os visitantes. As respostas alimentam segmentos e oportunidades.
        </EmptyState>
      )}
      {data && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((q) => (
            <article key={q.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className={`pill ${q.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{q.ativo ? "Ativo" : "Pausado"}</span>
                <span className="text-[11px] text-slate-400">#{q.id}</span>
              </div>
              <h3 className="mt-3 font-bold text-ink">{q.titulo}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3"><div className="text-xl font-extrabold text-ink">{q.totalRespostas}</div><div className="text-[10px] text-slate-400">respostas</div></div>
                <div className="rounded-xl bg-blue-50 p-3"><div className="text-xl font-extrabold text-brand">{q.pontos}</div><div className="text-[10px] text-slate-400">pontos por resposta</div></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/questionarios/${q.id}`} className={`${btnGhost} flex-1`}><BarChart3 size={14} /> Resultados</Link>
                <button onClick={() => copyLink(q.id)} className={`${btnGhost} flex-1`}>
                  {copied === q.id ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar link</>}
                </button>
              </div>
              <button onClick={() => toggle(q.id, q.ativo)} className="mt-3 text-left text-[11px] font-bold text-slate-400 hover:text-brand">
                {q.ativo ? "Pausar coleta de respostas" : "Reativar coleta de respostas"}
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
