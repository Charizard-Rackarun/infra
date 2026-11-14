"use client";

import { FormEvent, useState } from "react";
import { Lock, Plus, QrCode, Ticket } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, useFetch } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, EmptyState, Field, PageSkeleton, Spinner, btnGhost, btnPrimary, inputCls } from "@/components/form";

const CATEGORIAS = ["Moda", "Beleza", "Alimentação", "Tecnologia", "Casa e decoração", "Serviços"];
const hojeISO = () => new Date().toISOString().slice(0, 10);
const dataBR = (iso: string) => iso.split("-").reverse().join("/");

const formInicial = {
  titulo: "", descricao: "", desconto: "", categoria: "", custoPontos: 50, estoque: "", validade: "", exclusivoSexta13: false, campanhaId: "",
};

export default function CuponsPage() {
  const cupons = useFetch(() => api.listCupons());
  const campanhas = useFetch(() => api.getCampaigns());

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [codigo, setCodigo] = useState("");
  const [validando, setValidando] = useState(false);
  const [validacao, setValidacao] = useState<{ ok: boolean; msg: string } | null>(null);

  const set = <K extends keyof typeof formInicial>(k: K, v: (typeof formInicial)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function criar(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.createCupom({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        desconto: form.desconto.trim(),
        categoria: form.categoria.trim(),
        custoPontos: Number(form.custoPontos),
        estoque: form.estoque === "" ? null : Number(form.estoque),
        validade: form.validade,
        exclusivoSexta13: form.exclusivoSexta13,
        campanhaId: form.campanhaId === "" ? null : Number(form.campanhaId),
      });
      setForm(formInicial);
      setMostrarForm(false);
      cupons.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function validar(e: FormEvent) {
    e.preventDefault();
    setValidacao(null);
    setValidando(true);
    try {
      const r = await api.validarResgate(codigo.trim());
      setValidacao({ ok: r.success, msg: r.message });
      setCodigo("");
      cupons.reload();
    } catch (err) {
      setValidacao({ ok: false, msg: errorMessage(err) });
    } finally {
      setValidando(false);
    }
  }

  const campanhasReais = (campanhas.data ?? []).filter((c) => /^\d+$/.test(c.id)); // ignora a campanha automática "sexta-13"

  return (
    <>
      <PageHeading
        eyebrow="ENGAJAMENTO"
        title="Cupons"
        description="Crie benefícios que os visitantes trocam por pontos e valide o código no balcão."
        action={<button onClick={() => setMostrarForm((v) => !v)} className={btnPrimary}><Plus size={15} /> {mostrarForm ? "Fechar" : "Novo cupom"}</button>}
      />

      <section className="card mb-6 p-5">
        <h2 className="flex items-center gap-2 font-bold text-ink"><QrCode size={17} className="text-brand" /> Validar resgate no balcão</h2>
        <p className="mt-1 text-xs text-slate-400">Digite o código que o visitante apresentou (ex.: LOOK15-A1B2C3).</p>
        <form onSubmit={validar} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input className={`${inputCls} font-mono uppercase sm:max-w-xs`} required minLength={3} maxLength={40} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="CÓDIGO DO RESGATE" />
          <button type="submit" disabled={validando} className={btnPrimary}>{validando ? <Spinner /> : null} Validar código</button>
        </form>
        {validacao && <div className="mt-4"><Alert kind={validacao.ok ? "success" : "error"}>{validacao.msg}</Alert></div>}
      </section>

      {mostrarForm && (
        <form onSubmit={criar} className="card mb-6 space-y-4 p-5 md:p-6">
          <h2 className="font-bold text-ink">Novo cupom</h2>
          {error && <Alert>{error}</Alert>}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título"><input className={inputCls} required minLength={3} maxLength={120} value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex.: Seu próximo look" /></Field>
            <Field label="Desconto"><input className={inputCls} required maxLength={40} value={form.desconto} onChange={(e) => set("desconto", e.target.value)} placeholder="Ex.: 15% OFF" /></Field>
          </div>
          <Field label="Descrição"><input className={inputCls} required minLength={3} maxLength={200} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Ex.: Em compras acima de R$ 120" /></Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Categoria">
              <input className={inputCls} list="categorias-cupom" required minLength={2} maxLength={40} value={form.categoria} onChange={(e) => set("categoria", e.target.value)} />
              <datalist id="categorias-cupom">{CATEGORIAS.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Custo em pontos"><input className={inputCls} type="number" required min={1} max={100000} value={form.custoPontos} onChange={(e) => set("custoPontos", Number(e.target.value))} /></Field>
            <Field label="Estoque" hint="Vazio = ilimitado"><input className={inputCls} type="number" min={1} value={form.estoque} onChange={(e) => set("estoque", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Válido até"><input className={inputCls} type="date" required min={hojeISO()} value={form.validade} onChange={(e) => set("validade", e.target.value)} /></Field>
            <Field label="Campanha (opcional)">
              <select className={inputCls} value={form.campanhaId} onChange={(e) => set("campanhaId", e.target.value)}>
                <option value="">Sem campanha</option>
                {campanhasReais.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4 text-xs text-violet-900">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-violet-600" checked={form.exclusivoSexta13} onChange={(e) => set("exclusivoSexta13", e.target.checked)} />
            <span><strong>Oferta secreta de Sexta 13.</strong> Só aparece e só pode ser resgatada nas sextas-feiras 13.</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <Spinner /> : null} Criar cupom</button>
            <button type="button" onClick={() => setMostrarForm(false)} className={btnGhost}>Cancelar</button>
          </div>
        </form>
      )}

      {cupons.error && <Alert>{cupons.error}</Alert>}
      {cupons.loading && !cupons.data && <PageSkeleton />}
      {cupons.data && cupons.data.length === 0 && (
        <EmptyState icon={<Ticket size={22} />} title="Nenhum cupom criado" action={<button onClick={() => setMostrarForm(true)} className={btnPrimary}><Plus size={15} /> Criar primeiro cupom</button>}>
          Cupons são trocados por pontos que o visitante ganha respondendo questionários.
        </EmptyState>
      )}
      {cupons.data && cupons.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cupons.data.map((c) => (
            <article key={c.id} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="pill bg-slate-100 text-slate-500">{c.categoria}</span>
                <div className="flex items-center gap-1.5">
                  {c.exclusivoSexta13 && <span className="pill bg-violet-50 text-violet-700"><Lock size={10} className="mr-1 inline" />Sexta 13</span>}
                  <span className={`pill ${c.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{c.ativo ? "Ativo" : "Inativo"}</span>
                </div>
              </div>
              <h3 className="mt-3 font-bold text-ink">{c.titulo}</h3>
              <div className="mt-1 text-xs text-slate-400">{c.descricao}</div>
              <div className="my-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-3 text-center text-2xl font-extrabold text-brand">{c.desconto}</div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
                <div><div className="text-sm font-bold text-slate-700">{c.custoPontos}</div>pontos</div>
                <div><div className="text-sm font-bold text-slate-700">{c.estoque ?? "∞"}</div>em estoque</div>
                <div><div className="text-sm font-bold text-slate-700">{dataBR(c.validade)}</div>validade</div>
              </div>
              <div className="mt-4 text-center font-mono text-xs font-bold text-slate-500">{c.codigo}</div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
