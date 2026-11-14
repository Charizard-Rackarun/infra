"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Plus, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, Field, Spinner, btnGhost, btnPrimary, inputCls } from "@/components/form";
import type { Dimensao, TipoPergunta } from "@/types";

type OpcaoForm = { texto: string; exclusiva: boolean };
type PerguntaForm = { texto: string; tipo: TipoPergunta; dimensao: Dimensao | ""; obrigatoria: boolean; maxSelecoes: number | ""; opcoes: OpcaoForm[] };
type Modelo = { id: string; nome: string; resumo: string; titulo: string; descricao: string; pontos: number; perguntas: PerguntaForm[] };

const LIMITES = { perguntas: 15, opcoesMin: 2, opcoesMax: 12, segundosPorPergunta: 15 };
const TIPOS: { value: TipoPergunta; label: string; ajuda: string }[] = [
  { value: "unica", label: "Escolha única", ajuda: "O visitante marca uma opção." },
  { value: "multipla", label: "Múltipla escolha", ajuda: "O visitante pode marcar várias opções, com limite opcional." },
  { value: "escala", label: "Escala de 1 a 5", ajuda: "Nota de 1 (muito ruim) a 5 (excelente). O resultado mostra a média." },
  { value: "sim_nao", label: "Sim ou não", ajuda: "Pergunta direta com duas respostas." },
];

const iconBtn = "rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-brand disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";
const escolha = (...textos: string[]): OpcaoForm[] => textos.map((texto) => ({ texto, exclusiva: false }));
const vazia = (): PerguntaForm => ({ texto: "", tipo: "unica", dimensao: "", obrigatoria: true, maxSelecoes: "", opcoes: escolha("", "") });
const pergunta = (p: Partial<PerguntaForm> & { texto: string }): PerguntaForm => ({ ...vazia(), ...p });
const ehFixo = (t: TipoPergunta) => t === "escala" || t === "sim_nao";
const clonar = (q: PerguntaForm): PerguntaForm => ({ ...q, opcoes: q.opcoes.map((o) => ({ ...o })) });
const preenchidas = (q: PerguntaForm) => q.opcoes.filter((o) => o.texto.trim() !== "");

// As perguntas com uso "Interesses" alimentam as telas de Consumidores e Oportunidades de todos os parceiros
const MODELOS: Modelo[] = [
  {
    id: "interesses", nome: "Interesses e frequência", resumo: "Alimenta Consumidores e Oportunidades de venda cruzada.",
    titulo: "O que você procura hoje?", descricao: "Responda em 30 segundos e ganhe pontos para trocar por cupons.", pontos: 10,
    perguntas: [
      pergunta({
        texto: "Quais categorias mais interessam você?", tipo: "multipla", dimensao: "categoria", maxSelecoes: 3,
        opcoes: [...escolha("Moda", "Beleza", "Alimentação", "Tecnologia", "Casa e decoração", "Serviços"), { texto: "Nenhuma das anteriores", exclusiva: true }],
      }),
      pergunta({ texto: "Com que frequência você visita o shopping?", dimensao: "frequencia", opcoes: escolha("Todo dia", "Toda semana", "Todo mês", "Raramente") }),
    ],
  },
  {
    id: "perfil", nome: "Perfil da visita", resumo: "Motivo, permanência, gasto previsto e como conheceu o shopping.",
    titulo: "Conte como é a sua visita", descricao: "Quatro perguntas rápidas para as lojas atenderem melhor você.", pontos: 15,
    perguntas: [
      pergunta({ texto: "Qual o principal motivo da sua visita hoje?", opcoes: escolha("Compras planejadas", "Passeio e lazer", "Alimentação", "Serviços", "Acompanhando alguém") }),
      pergunta({ texto: "Quanto tempo você costuma ficar no shopping?", opcoes: escolha("Até 1 hora", "De 1 a 2 horas", "De 2 a 4 horas", "Mais de 4 horas") }),
      pergunta({ texto: "Quanto você pretende gastar hoje?", opcoes: escolha("Até R$ 50", "De R$ 50 a R$ 150", "De R$ 150 a R$ 300", "Acima de R$ 300", "Prefiro não informar") }),
      pergunta({ texto: "Como você conheceu este shopping?", obrigatoria: false, opcoes: escolha("Indicação de amigos", "Redes sociais", "Passei pelo local", "Anúncios", "Outro") }),
    ],
  },
  {
    id: "satisfacao", nome: "Satisfação", resumo: "Notas de 1 a 5 para atendimento, variedade e preços, mais recomendação.",
    titulo: "Como foi a sua experiência?", descricao: "Sua opinião ajuda as lojas a melhorar.", pontos: 10,
    perguntas: [
      pergunta({ texto: "Como você avalia o atendimento nas lojas?", tipo: "escala", opcoes: [] }),
      pergunta({ texto: "Como você avalia a variedade de produtos?", tipo: "escala", opcoes: [] }),
      pergunta({ texto: "Como você avalia os preços?", tipo: "escala", obrigatoria: false, opcoes: [] }),
      pergunta({ texto: "Você recomendaria o shopping a um amigo?", tipo: "sim_nao", opcoes: [] }),
    ],
  },
];

export default function NovoQuestionarioPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pontos, setPontos] = useState(10);
  const [perguntas, setPerguntas] = useState<PerguntaForm[]>([vazia()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const patch = (i: number, p: Partial<PerguntaForm>) =>
    setPerguntas((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...p } : q)));
  const setOpcao = (i: number, j: number, p: Partial<OpcaoForm>) =>
    setPerguntas((qs) => qs.map((q, idx) => (idx === i ? { ...q, opcoes: q.opcoes.map((o, k) => (k === j ? { ...o, ...p } : o)) } : q)));

  function mudarTipo(i: number, tipo: TipoPergunta) {
    setPerguntas((qs) => qs.map((q, idx): PerguntaForm => {
      if (idx !== i) return q;
      if (ehFixo(tipo)) return { ...q, tipo, dimensao: "", maxSelecoes: "" }; // opções geradas pelo servidor
      if (tipo === "unica") return { ...q, tipo, maxSelecoes: "", opcoes: q.opcoes.map((o) => ({ ...o, exclusiva: false })) };
      return { ...q, tipo };
    }));
  }

  function mover(i: number, delta: -1 | 1) {
    setPerguntas((qs) => {
      const j = i + delta;
      if (j < 0 || j >= qs.length) return qs;
      const copia = [...qs];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  function duplicar(i: number) {
    setPerguntas((qs) => (qs.length >= LIMITES.perguntas ? qs : [...qs.slice(0, i + 1), clonar(qs[i]), ...qs.slice(i + 1)]));
  }

  function usarModelo(m: Modelo) {
    const preenchido = titulo.trim() !== "" || perguntas.some((q) => q.texto.trim() !== "");
    if (preenchido && !window.confirm("Isso substitui o que você já preencheu. Continuar?")) return;
    setTitulo(m.titulo);
    setDescricao(m.descricao);
    setPontos(m.pontos);
    setPerguntas(m.perguntas.map(clonar));
    setError("");
  }

  function validar(): string | null {
    if (titulo.trim().length < 3) return "Dê um título ao questionário (mínimo 3 caracteres).";
    if (!Number.isInteger(pontos) || pontos < 1 || pontos > 100) return "Os pontos por resposta devem ficar entre 1 e 100.";
    if (!perguntas.some((q) => q.obrigatoria)) return "Deixe pelo menos uma pergunta obrigatória.";
    for (const [i, q] of perguntas.entries()) {
      const n = i + 1;
      if (q.texto.trim().length < 3) return `Escreva o texto da pergunta ${n}.`;
      if (ehFixo(q.tipo)) continue;
      const opcoes = preenchidas(q).map((o) => o.texto.trim());
      if (opcoes.length < LIMITES.opcoesMin) return `A pergunta ${n} precisa de pelo menos ${LIMITES.opcoesMin} opções preenchidas.`;
      if (new Set(opcoes.map((o) => o.toLowerCase())).size !== opcoes.length) return `A pergunta ${n} tem opções repetidas.`;
      if (q.tipo === "multipla") {
        const exclusivas = preenchidas(q).filter((o) => o.exclusiva).length;
        if (exclusivas > 1) return `A pergunta ${n} pode ter só uma opção exclusiva.`;
        const livres = opcoes.length - exclusivas;
        if (q.maxSelecoes !== "" && (q.maxSelecoes < 2 || q.maxSelecoes > livres)) return `O limite de seleções da pergunta ${n} deve ficar entre 2 e ${livres}.`;
      }
    }
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problema = validar();
    if (problema) return setError(problema);
    setError("");
    setBusy(true);
    try {
      await api.createQuestionario({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        pontos,
        perguntas: perguntas.map((q) => ({
          texto: q.texto.trim(),
          tipo: q.tipo,
          dimensao: q.dimensao || null,
          obrigatoria: q.obrigatoria,
          maxSelecoes: q.tipo === "multipla" && q.maxSelecoes !== "" ? Number(q.maxSelecoes) : null,
          opcoes: ehFixo(q.tipo) ? [] : preenchidas(q).map((o) => ({ texto: o.texto.trim(), exclusiva: q.tipo === "multipla" && o.exclusiva })),
        })),
      });
      router.push("/questionarios");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const temCategoria = perguntas.some((q) => q.dimensao === "categoria");
  const segundos = Math.max(10, perguntas.length * LIMITES.segundosPorPergunta);

  return (
    <>
      <Link href="/questionarios" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand"><ArrowLeft size={14} /> Voltar</Link>
      <PageHeading eyebrow="PESQUISAS" title="Novo questionário" description="Monte as perguntas que os visitantes vão responder. Os dados coletados ajudam você e as outras lojas parceiras." />
      <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
        {error && <Alert>{error}</Alert>}

        <section className="card p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-600"><Wand2 size={14} className="text-brand" /> Comece por um modelo pronto</div>
          <div className="grid gap-3 md:grid-cols-3">
            {MODELOS.map((m) => (
              <button key={m.id} type="button" onClick={() => usarModelo(m)} className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand hover:bg-blue-50/40">
                <div className="text-sm font-bold text-ink">{m.nome}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-slate-400">{m.resumo}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="card space-y-4 p-5 md:p-6">
          <Field label="Título">
            <input className={inputCls} maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: O que você procura hoje?" />
          </Field>
          <Field label="Descrição (opcional)">
            <input className={inputCls} maxLength={300} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Uma frase para convidar o visitante" />
          </Field>
          <Field label="Pontos por resposta" hint="Quanto o visitante ganha ao concluir (de 1 a 100). Em Sexta 13 vale em dobro.">
            <input className={`${inputCls} max-w-[140px]`} type="number" min={1} max={100} value={pontos} onChange={(e) => setPontos(Number(e.target.value))} />
          </Field>
        </section>

        {perguntas.map((q, i) => {
          const fixo = ehFixo(q.tipo);
          const livres = preenchidas(q).filter((o) => !o.exclusiva).length;
          const temExclusiva = q.opcoes.some((o) => o.exclusiva);
          return (
            <section key={i} className="card space-y-4 p-5 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="pill bg-blue-50 text-brand">Pergunta {i + 1}</span>
                  <span className={`pill ${q.obrigatoria ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"}`}>{q.obrigatoria ? "Obrigatória" : "Opcional"}</span>
                </div>
                <div className="flex items-center">
                  <button type="button" aria-label="Mover para cima" title="Mover para cima" disabled={i === 0} onClick={() => mover(i, -1)} className={iconBtn}><ArrowUp size={15} /></button>
                  <button type="button" aria-label="Mover para baixo" title="Mover para baixo" disabled={i === perguntas.length - 1} onClick={() => mover(i, 1)} className={iconBtn}><ArrowDown size={15} /></button>
                  <button type="button" aria-label="Duplicar pergunta" title="Duplicar pergunta" disabled={perguntas.length >= LIMITES.perguntas} onClick={() => duplicar(i)} className={iconBtn}><Copy size={15} /></button>
                  {perguntas.length > 1 && (
                    <button type="button" aria-label="Remover pergunta" title="Remover pergunta" onClick={() => setPerguntas((qs) => qs.filter((_, idx) => idx !== i))} className={`${iconBtn} hover:!bg-rose-50 hover:!text-rose-600`}><Trash2 size={15} /></button>
                  )}
                </div>
              </div>

              <Field label="Texto da pergunta">
                <input className={inputCls} maxLength={200} value={q.texto} onChange={(e) => patch(i, { texto: e.target.value })} placeholder="Ex.: Quais categorias mais interessam você?" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Tipo de resposta" hint={TIPOS.find((t) => t.value === q.tipo)?.ajuda}>
                  <select className={inputCls} value={q.tipo} onChange={(e) => mudarTipo(i, e.target.value as TipoPergunta)}>
                    {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Uso na análise" hint={fixo ? "Escalas e sim/não ficam só nos resultados." : undefined}>
                  <select className={inputCls} value={q.dimensao} disabled={fixo} onChange={(e) => patch(i, { dimensao: e.target.value as Dimensao | "" })}>
                    <option value="">Só coletar</option>
                    {!fixo && <option value="categoria">Interesses (gera segmentos)</option>}
                    {!fixo && <option value="frequencia">Frequência de visita</option>}
                  </select>
                </Field>
                <Field label="Resposta">
                  <select className={inputCls} value={q.obrigatoria ? "sim" : "nao"} onChange={(e) => patch(i, { obrigatoria: e.target.value === "sim" })}>
                    <option value="sim">Obrigatória</option>
                    <option value="nao">Opcional</option>
                  </select>
                </Field>
              </div>

              {q.tipo === "escala" && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="grid max-w-xs grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((n) => <div key={n} className="rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-bold text-slate-500">{n}</div>)}</div>
                  <div className="mt-2 flex max-w-xs justify-between text-[11px] text-slate-400"><span>Muito ruim</span><span>Excelente</span></div>
                </div>
              )}
              {q.tipo === "sim_nao" && (
                <div className="flex max-w-xs gap-2 rounded-xl bg-slate-50 p-4">{["Sim", "Não"].map((t) => <div key={t} className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-bold text-slate-500">{t}</div>)}</div>
              )}

              {!fixo && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-600">Opções</div>
                    {q.tipo === "multipla" && (
                      <label className="flex items-center gap-2 text-[11px] text-slate-500">
                        Limite de seleções
                        <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]" value={q.maxSelecoes} onChange={(e) => patch(i, { maxSelecoes: e.target.value === "" ? "" : Number(e.target.value) })}>
                          <option value="">Sem limite</option>
                          {Array.from({ length: Math.max(0, livres - 1) }, (_, k) => k + 2).map((n) => <option key={n} value={n}>Até {n}</option>)}
                          {q.maxSelecoes !== "" && q.maxSelecoes > livres && <option value={q.maxSelecoes}>Até {q.maxSelecoes} (revise)</option>}
                        </select>
                      </label>
                    )}
                  </div>
                  <div className="space-y-2">
                    {q.opcoes.map((o, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <input className={inputCls} maxLength={80} value={o.texto} onChange={(e) => setOpcao(i, j, { texto: e.target.value })} placeholder={o.exclusiva ? "Ex.: Nenhuma das anteriores" : `Opção ${j + 1}`} />
                        {q.tipo === "multipla" && (
                          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] text-slate-500" title="Exclusiva: não pode ser marcada junto com outras opções">
                            <input type="checkbox" className="h-3.5 w-3.5 accent-[#3157D5]" checked={o.exclusiva} onChange={(e) => setOpcao(i, j, { exclusiva: e.target.checked })} /> Exclusiva
                          </label>
                        )}
                        {q.opcoes.length > LIMITES.opcoesMin && (
                          <button type="button" aria-label="Remover opção" onClick={() => patch(i, { opcoes: q.opcoes.filter((_, k) => k !== j) })} className="rounded-xl px-3 py-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {q.opcoes.length < LIMITES.opcoesMax && (
                      <button type="button" onClick={() => patch(i, { opcoes: [...q.opcoes, { texto: "", exclusiva: false }] })} className="flex items-center gap-1 text-xs font-bold text-brand"><Plus size={14} /> Adicionar opção</button>
                    )}
                    {q.tipo === "multipla" && !temExclusiva && q.opcoes.length < LIMITES.opcoesMax && (
                      <button type="button" onClick={() => patch(i, { opcoes: [...q.opcoes, { texto: "Nenhuma das anteriores", exclusiva: true }] })} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand"><Plus size={14} /> Adicionar “Nenhuma das anteriores”</button>
                    )}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {perguntas.length < LIMITES.perguntas && (
          <button type="button" onClick={() => setPerguntas((qs) => [...qs, vazia()])} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-4 text-xs font-bold text-slate-500 hover:border-brand hover:text-brand"><Plus size={15} /> Adicionar pergunta</button>
        )}

        {!temCategoria && (
          <Alert kind="info">
            <span className="flex items-center gap-1.5"><Sparkles size={13} /> Dica:</span> marque ao menos uma pergunta como “Interesses (gera segmentos)”. Só essas respostas alimentam as telas de Consumidores e Oportunidades.
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <Spinner /> : <Save size={15} />} Publicar questionário</button>
          <Link href="/questionarios" className={btnGhost}>Cancelar</Link>
          <span className="text-[11px] text-slate-400">{perguntas.length} {perguntas.length === 1 ? "pergunta" : "perguntas"}, cerca de {segundos < 60 ? `${segundos} s` : `${Math.round(segundos / 60)} min`} para responder</span>
        </div>
      </form>
    </>
  );
}
