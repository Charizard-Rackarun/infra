"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, Megaphone, Plus, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, useFetch } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, EmptyState, Field, PageSkeleton, Spinner, btnGhost, btnPrimary, inputCls } from "@/components/form";
import type { Campaign } from "@/types";

const TIPOS = ["Desconto", "Cupom", "Brinde", "Combo", "Evento especial"];
const hojeISO = () => new Date().toISOString().slice(0, 10);
const statusStyle: Record<Campaign["status"], string> = {
  Ativa: "bg-emerald-50 text-emerald-700",
  Agendada: "bg-amber-50 text-amber-700",
  Encerrada: "bg-slate-100 text-slate-500",
};

export default function CampanhasPage() {
  const { data, error, loading, reload } = useFetch(() => api.getCampaigns());
  const [aberto, setAberto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ nome: "", tipo: "Desconto", desconto: "", dataInicio: hojeISO(), dataFim: "", alcance: 0 });

  async function criar(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (form.dataFim < form.dataInicio) return setFormError("A data final não pode ser anterior à data inicial.");
    setBusy(true);
    try {
      await api.createCampaign({ ...form, nome: form.nome.trim(), desconto: form.desconto.trim(), alcance: Number(form.alcance) });
      setForm({ nome: "", tipo: "Desconto", desconto: "", dataInicio: hojeISO(), dataFim: "", alcance: 0 });
      setAberto(false);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="MARKETING"
        title="Campanhas"
        description="Acompanhe o alcance e os resgates de cada ação comercial."
        action={<button onClick={() => setAberto((v) => !v)} className={btnPrimary}><Plus size={15} /> {aberto ? "Fechar" : "Nova campanha"}</button>}
      />

      {aberto && (
        <form onSubmit={criar} className="card mb-6 space-y-4 p-5 md:p-6">
          <h2 className="font-bold text-ink">Nova campanha</h2>
          {formError && <Alert>{formError}</Alert>}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1"><Field label="Nome"><input className={inputCls} required minLength={3} maxLength={120} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Festival de Beleza" /></Field></div>
            <Field label="Tipo"><select className={inputCls} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Desconto / benefício"><input className={inputCls} required maxLength={40} value={form.desconto} onChange={(e) => setForm({ ...form, desconto: e.target.value })} placeholder="Ex.: 20%" /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Início"><input className={inputCls} type="date" required value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} /></Field>
            <Field label="Fim"><input className={inputCls} type="date" required min={form.dataInicio} value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} /></Field>
            <Field label="Alcance estimado"><input className={inputCls} type="number" min={0} value={form.alcance} onChange={(e) => setForm({ ...form, alcance: Number(e.target.value) })} /></Field>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <Spinner /> : null} Criar campanha</button>
            <button type="button" onClick={() => setAberto(false)} className={btnGhost}>Cancelar</button>
          </div>
        </form>
      )}

      {error && <Alert>{error}</Alert>}
      {loading && !data && <PageSkeleton />}
      {data && data.length === 0 && <EmptyState icon={<Megaphone size={22} />} title="Nenhuma campanha" />}
      {data && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <article key={c.id} className="card p-5">
              <div className="flex items-center justify-between">
                <span className={`pill ${statusStyle[c.status]}`}>{c.status}</span>
                <span className="pill bg-slate-50 text-slate-500">{c.type}</span>
              </div>
              <h3 className="mt-3 flex items-center gap-1.5 font-bold text-ink">{c.id === "sexta-13" && <Sparkles size={15} className="text-violet-500" />}{c.name}</h3>
              <div className="mt-0.5 text-xs text-slate-400">{c.store}</div>
              <div className="my-4 rounded-xl bg-blue-50/60 p-3 text-center text-xl font-extrabold text-brand">{c.discount}</div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3"><div className="text-lg font-extrabold text-ink">{c.reach.toLocaleString("pt-BR")}</div><div className="text-[10px] text-slate-400">alcance</div></div>
                <div className="rounded-xl bg-slate-50 p-3"><div className="text-lg font-extrabold text-ink">{c.redemptions.toLocaleString("pt-BR")}</div><div className="text-[10px] text-slate-400">resgates</div></div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400"><CalendarDays size={13} /> {c.startDate}{c.endDate !== c.startDate ? ` – ${c.endDate}` : ""}</div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
