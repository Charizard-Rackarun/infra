"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Gift, PartyPopper, Send, Store } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { errorMessage, useFetch } from "@/lib/hooks";
import { Alert, Spinner, btnPrimary } from "@/components/form";
import { CuponsResgate, MaisQuestionarios } from "@/components/visitante";
import type { PerguntaQuestionario, RespostaResultado } from "@/types";

/** Depois de responder: cupons que já dá para resgatar e outras pesquisas para ganhar mais pontos. */
function PosResposta({ excluirId, pontosTotal }: { excluirId: number; pontosTotal: number }) {
  const rewards = useFetch(() => api.getRewards());
  const LIMITE = 4;
  return (
    <div className="mt-10 space-y-10">
      <section>
        <div className="mb-5">
          <h2 className="font-bold text-ink">Resgate seus cupons</h2>
          <p className="mt-1 text-xs text-slate-400">Você tem {rewards.data?.points ?? pontosTotal} pontos para trocar por ofertas das lojas parceiras.</p>
        </div>
        {rewards.error && <Alert>{rewards.error}</Alert>}
        {!rewards.data && !rewards.error && <div className="h-40 animate-pulse rounded-2xl bg-white" />}
        {rewards.data && (
          <>
            <CuponsResgate rewards={rewards.data} onRedeemed={rewards.reload} limit={LIMITE} />
            {rewards.data.coupons.length > LIMITE && (
              <div className="mt-4 text-center"><Link href="/rewards" className="text-xs font-bold text-brand">Ver todos os {rewards.data.coupons.length} cupons</Link></div>
            )}
          </>
        )}
      </section>
      <MaisQuestionarios excluirId={excluirId} />
    </div>
  );
}

export default function ResponderPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: questionario, error, loading } = useFetch(() => api.getQuestionarioPublico(id), [id]);
  const [escolhas, setEscolhas] = useState<Record<number, number[]>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [resultado, setResultado] = useState<RespostaResultado | null>(null);

  function escolher(p: PerguntaQuestionario, opcaoId: number) {
    setEscolhas((atual) => {
      const marcadas = atual[p.id] ?? [];
      if (p.tipo !== "multipla") return { ...atual, [p.id]: [opcaoId] };
      if (marcadas.includes(opcaoId)) return { ...atual, [p.id]: marcadas.filter((o) => o !== opcaoId) };
      const opcao = p.opcoes.find((o) => o.id === opcaoId);
      if (opcao?.exclusiva) return { ...atual, [p.id]: [opcaoId] }; // "Nenhuma das anteriores" limpa o resto
      const livres = marcadas.filter((m) => !p.opcoes.find((o) => o.id === m)?.exclusiva);
      if (p.maxSelecoes && livres.length >= p.maxSelecoes) return atual; // limite atingido
      return { ...atual, [p.id]: [...livres, opcaoId] };
    });
  }

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (error || !questionario) {
    return (
      <div className="card px-6 py-14 text-center">
        <h1 className="font-bold text-ink">Questionário indisponível</h1>
        <p className="mt-2 text-xs text-slate-400">{error ?? "Este questionário não existe ou foi encerrado."}</p>
        <Link href="/rewards" className="mt-5 inline-block text-xs font-bold text-brand">Ver cupons disponíveis</Link>
      </div>
    );
  }

  const obrigatorias = questionario.perguntas.filter((p) => p.obrigatoria);
  const faltando = obrigatorias.filter((p) => (escolhas[p.id]?.length ?? 0) === 0);
  const feitas = obrigatorias.length - faltando.length;

  async function enviar() {
    if (!questionario) return;
    setSubmitError("");
    setBusy(true);
    try {
      const r = await api.responder(questionario.id, {
        respostas: questionario.perguntas
          .filter((p) => (escolhas[p.id]?.length ?? 0) > 0)
          .map((p) => ({ perguntaId: p.id, opcaoIds: escolhas[p.id] })),
      });
      setResultado(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setJaRespondeu(true);
      else setSubmitError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (resultado) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card mx-auto max-w-lg overflow-hidden text-center">
          <div className="bg-gradient-to-br from-[#273b87] via-[#3157D5] to-[#7658D6] px-6 py-10 text-white">
            <PartyPopper size={44} strokeWidth={1.4} className="mx-auto" />
            <h1 className="mt-4 font-[Manrope] text-2xl font-extrabold">Obrigado por responder!</h1>
            <p className="mt-1 text-sm text-blue-100">Você ganhou</p>
            <div className="mt-1 text-5xl font-extrabold">+{resultado.pontosGanhos}</div>
            <div className="text-xs text-blue-100">pontos</div>
            {resultado.bonusSexta13 && <div className="mx-auto mt-4 w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">Bônus Sexta 13: pontos em dobro!</div>}
          </div>
          <div className="px-6 py-6">
            <p className="text-sm text-slate-500">Seu saldo agora é de <strong className="text-ink">{resultado.pontosTotal} pontos</strong>.</p>
            <Link href="/rewards" className="mt-3 inline-block text-xs font-bold text-brand">Abrir minha carteira de pontos</Link>
          </div>
        </div>
        <PosResposta excluirId={questionario.id} pontosTotal={resultado.pontosTotal} />
      </div>
    );
  }

  if (jaRespondeu) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card mx-auto max-w-lg px-6 py-12 text-center">
          <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
          <h1 className="mt-4 font-bold text-ink">Você já respondeu este questionário</h1>
          <p className="mt-2 text-xs text-slate-400">Cada pessoa responde uma vez. Seus pontos continuam disponíveis, e há outras pesquisas abaixo.</p>
          <Link href="/rewards" className={`${btnPrimary} mt-5`}><Gift size={15} /> Ver meus pontos e cupons</Link>
        </div>
        <div className="mt-10"><MaisQuestionarios excluirId={questionario.id} /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill bg-blue-50 text-brand">+{questionario.pontos} pontos ao responder</span>
          {questionario.loja && <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><Store size={12} className="text-slate-400" /> Pesquisa de {questionario.loja}</span>}
        </div>
        <h1 className="mt-3 font-[Manrope] text-2xl font-extrabold text-ink">{questionario.titulo}</h1>
        {questionario.descricao && <p className="mt-1.5 text-sm text-slate-400">{questionario.descricao}</p>}
        {obrigatorias.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] text-slate-400"><span>Perguntas obrigatórias</span><span>{feitas} de {obrigatorias.length}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(feitas / obrigatorias.length) * 100}%` }} /></div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {questionario.perguntas.map((p, i) => {
          const marcadas = escolhas[p.id] ?? [];
          const multipla = p.tipo === "multipla";
          const ajuda =
            p.tipo === "escala" ? "Dê uma nota de 1 a 5"
            : multipla ? (p.maxSelecoes ? `Escolha até ${p.maxSelecoes} opções` : "Você pode escolher mais de uma opção")
            : "Escolha uma opção";
          const base = "cursor-pointer rounded-xl border text-sm transition focus-within:ring-4 focus-within:ring-blue-100";
          const on = "border-brand bg-blue-50 font-bold text-brand";
          const off = "border-slate-200 text-slate-600 hover:border-blue-200";
          return (
            <fieldset key={p.id} className="card p-5 md:p-6">
              <legend className="sr-only">{p.texto}</legend>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>PERGUNTA {i + 1} DE {questionario.perguntas.length}</span>
                <span className={p.obrigatoria ? "text-rose-500" : ""}>{p.obrigatoria ? "Obrigatória" : "Opcional"}</span>
              </div>
              <h2 className="mt-1 font-bold text-ink">{p.texto}</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">{ajuda}</p>

              {p.tipo === "escala" ? (
                <div className="mt-4">
                  <div className="grid grid-cols-5 gap-2">
                    {p.opcoes.map((o, idx) => {
                      const marcada = marcadas.includes(o.id);
                      return (
                        <label key={o.id} className={`${base} flex flex-col items-center py-3 font-bold ${marcada ? "border-brand bg-brand text-white" : off}`}>
                          <input type="radio" name={`p-${p.id}`} className="sr-only" checked={marcada} onChange={() => escolher(p, o.id)} />
                          {idx + 1}
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>Muito ruim</span><span>Excelente</span></div>
                </div>
              ) : p.tipo === "sim_nao" ? (
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {p.opcoes.map((o) => {
                    const marcada = marcadas.includes(o.id);
                    return (
                      <label key={o.id} className={`${base} px-4 py-3.5 text-center font-bold ${marcada ? on : off}`}>
                        <input type="radio" name={`p-${p.id}`} className="sr-only" checked={marcada} onChange={() => escolher(p, o.id)} />
                        {o.texto}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {p.opcoes.map((o) => {
                    const marcada = marcadas.includes(o.id);
                    return (
                      <label key={o.id} className={`${base} flex items-center gap-3 px-4 py-3 ${marcada ? on : off}`}>
                        <input type={multipla ? "checkbox" : "radio"} name={`p-${p.id}`} checked={marcada} onChange={() => escolher(p, o.id)} className="h-4 w-4 accent-[#3157D5]" />
                        {o.texto}
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {submitError && <div className="mt-5"><Alert>{submitError}</Alert></div>}
      <button onClick={enviar} disabled={faltando.length > 0 || busy} className={`${btnPrimary} mt-6 w-full py-3.5`}>
        {busy ? <Spinner /> : <Send size={15} />}{" "}
        {faltando.length === 0 ? "Enviar respostas e ganhar pontos" : `Faltam ${faltando.length} ${faltando.length === 1 ? "pergunta obrigatória" : "perguntas obrigatórias"}`}
      </button>
      <p className="mt-3 text-center text-[11px] text-slate-400">Suas respostas são anônimas: não pedimos nome, e-mail ou telefone.</p>
    </div>
  );
}
