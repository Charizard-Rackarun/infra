"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, session, UNAUTH_EVENT } from "@/lib/api";
import type { Estabelecimento, RegistroInput } from "@/types";

type AuthContextValue = {
  user: Estabelecimento | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (dados: RegistroInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Estabelecimento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTH_EVENT, onUnauthorized);

    if (!session.getToken()) {
      setLoading(false);
    } else {
      api.me()
        .then((u) => alive && setUser(u))
        .catch(() => { /* 401 já limpa o token; erro de rede mantém o token e cai no login */ })
        .finally(() => alive && setLoading(false));
    }
    return () => {
      alive = false;
      window.removeEventListener(UNAUTH_EVENT, onUnauthorized);
    };
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    await api.login(email, senha);
    setUser(await api.me());
  }, []);

  const register = useCallback(async (dados: RegistroInput) => {
    await api.register(dados);
    await login(dados.email, dados.senha);
  }, [login]);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
