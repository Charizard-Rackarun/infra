"use client";

import { FormEvent, useState } from "react";
import { Receipt, Save } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/hooks";
import { PageHeading } from "@/components/ui";
import { Alert, Field, Spinner, btnPrimary, inputCls } from "@/components/form";
import type { Venda } from "@/types";

const CATEGORIAS = ["Moda", "Beleza", "Alimentação", "Eletrônicos", "Casa e decoração", "Outros"];
const hojeISO = () => new Date().toISOString().slice(0, 10);
const brl = (v: number | string) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function VendasPage() {
  const [form, setForm] = useState({ data: hojeISO(), produto: "", categoria: "", quantidade: 1, valor: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [registradas, setRegistradas] = useState<Venda[]>([]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const valor = Number(form.valor.replace(",", "."));
    if (!Number.isFinite(valor) || valor <= 0) return setError("Informe um valor total maior que zero.");
    setBusy(true);
    try {
      const venda = await api.registrarVenda({
        data: form.data,
        produto: form.produto.trim(),
        categoria: form.categoria.trim() || null,
        quantidade: Number(form.quantidade),
        valor_total: Math.round(valor * 100) / 100,
      });
      setRegistradas((v) => [venda, ...v].slice(0, 8));
      setForm((f) => ({ ...f, produto: "", quantidade: 1, valor: "" }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeading eyebrow="OPERAÇÃO" title="Registrar vendas" description="Cada venda registrada atualiza faturamento, ticket médio e vendas por segmento na visão geral." />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <form onSubmit={onSubmit} className="card space-y-4 p-5 md:p-6">
          {error && <Alert>{error}</Alert>}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Produto"><input className={inputCls} required maxLength={120} value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })} placeholder="Ex.: Perfume 50ml" /></Field>
            <Field label="Categoria">
              <input className={inputCls} list="categorias-venda" maxLength={40} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex.: Beleza" />
              <datalist id="categorias-venda">{CATEGORIAS.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Data"><input className={inputCls} type="date" required max={hojeISO()} value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></Field>
            <Field label="Quantidade"><input className={inputCls} type="number" required min={1} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} /></Field>
            <Field label="Valor total (R$)"><input className={inputCls} inputMode="decimal" required value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" /></Field>
          </div>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <Spinner /> : <Save size={15} />} Registrar venda</button>
        </form>

        <section className="card p-5 md:p-6">
          <h2 className="flex items-center gap-2 font-bold text-ink"><Receipt size={17} className="text-brand" /> Registradas nesta sessão</h2>
          {registradas.length === 0 ? (
            <p className="mt-4 text-xs text-slate-400">As vendas que você registrar agora aparecem aqui.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-50">
              {registradas.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                  <div className="min-w-0"><div className="truncate font-bold text-slate-700">{v.produto}</div><div className="text-[11px] text-slate-400">{v.quantidade}x · {v.categoria ?? "Sem categoria"} · {v.data.split("-").reverse().join("/")}</div></div>
                  <strong className="shrink-0 text-slate-700">{brl(v.valor_total)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
