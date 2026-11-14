"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/hooks";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, Field, Spinner, btnPrimary, inputCls } from "@/components/form";

const SEGMENTOS = ["Moda e acessórios", "Beleza e perfumaria", "Alimentação", "Tecnologia", "Casa e decoração", "Serviços"];

export default function RegistroPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const [form, setForm] = useState({ nome: "", segmento: "", email: "", senha: "", confirmar: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) router.replace("/"); }, [user, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.senha.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (form.senha !== form.confirmar) return setError("As senhas não conferem.");
    setBusy(true);
    try {
      await register({ nome: form.nome.trim(), segmento: form.segmento.trim(), email: form.email.trim(), senha: form.senha });
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Cadastre sua loja" subtitle="Crie o acesso do seu estabelecimento em menos de um minuto.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Nome do estabelecimento">
          <input className={inputCls} required minLength={2} maxLength={120} value={form.nome} onChange={set("nome")} placeholder="Ex.: Perfumaria Aura" />
        </Field>
        <Field label="Segmento" hint="Usado para sugerir lojas parceiras nas oportunidades.">
          <input className={inputCls} list="segmentos" required minLength={2} maxLength={60} value={form.segmento} onChange={set("segmento")} placeholder="Ex.: Beleza e perfumaria" />
          <datalist id="segmentos">{SEGMENTOS.map((s) => <option key={s} value={s} />)}</datalist>
        </Field>
        <Field label="E-mail">
          <input className={inputCls} type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder="voce@loja.com.br" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Senha" hint="Mínimo de 8 caracteres.">
            <input className={inputCls} type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={form.senha} onChange={set("senha")} />
          </Field>
          <Field label="Confirmar senha">
            <input className={inputCls} type="password" autoComplete="new-password" required value={form.confirmar} onChange={set("confirmar")} />
          </Field>
        </div>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {busy ? <Spinner /> : <UserPlus size={15} />} Criar conta
        </button>
        <p className="pt-2 text-center text-xs text-slate-400">
          Já tem conta? <Link href="/login" className="font-bold text-brand">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
