"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/hooks";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, Field, Spinner, btnPrimary, inputCls } from "@/components/form";

function safeNext(next: string | null) {
  // só caminhos internos, para evitar redirecionamento aberto
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) router.replace(next); }, [user, next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), senha);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Field label="E-mail">
        <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@loja.com.br" />
      </Field>
      <Field label="Senha">
        <input className={inputCls} type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" />
      </Field>
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
        {busy ? <Spinner /> : <LogIn size={15} />} Entrar
      </button>
      <p className="pt-2 text-center text-xs text-slate-400">
        Ainda não tem conta? <Link href="/registro" className="font-bold text-brand">Cadastre sua loja</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre para acompanhar suas vendas e oportunidades.">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-white" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
