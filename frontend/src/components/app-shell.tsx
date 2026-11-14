"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import {
  BarChart3, Bell, ChevronDown, CircleHelp, ClipboardList, Gift, Lightbulb, LogOut, Megaphone, Receipt,
  Search, Settings, ShoppingBag, Sparkles, Ticket, Users, Zap,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";

const workspaceNav = [
  { label: "Visão geral", href: "/", icon: BarChart3 },
  { label: "Consumidores", href: "/consumidores", icon: Users },
  { label: "Oportunidades", href: "/oportunidades", icon: Lightbulb },
  { label: "Campanhas", href: "/campanhas", icon: Megaphone },
  { label: "Questionários", href: "/questionarios", icon: ClipboardList },
  { label: "Cupons", href: "/cupons", icon: Ticket },
  { label: "Vendas", href: "/vendas", icon: Receipt },
];
const engagementNav = [{ label: "Rewards", href: "/rewards", icon: Gift }];
const allNav = [...workspaceNav, ...engagementNav];

// Telas sem o shell do lojista
const BARE_PATHS = ["/login", "/registro"];
// Telas do visitante: abertas, sem login
const PUBLIC_PATHS = ["/responder", "/rewards"];

const matches = (pathname: string, base: string) => pathname === base || pathname.startsWith(base + "/");
const initials = (nome: string) =>
  nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "VI";

function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-blue-200"><Sparkles size={21} /></div>
      <div>
        <div className="font-[Manrope] text-[19px] font-extrabold tracking-tight">Vitrine<span className="text-brand">IA</span></div>
        <div className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Inteligência comercial</div>
      </div>
    </Link>
  );
}

function PublicFrame({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-4xl items-center justify-between px-5">
          <Brand href={user ? "/" : "/rewards"} />
          {user ? (
            <Link href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Voltar ao painel</Link>
          ) : (
            <Link href="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Área do lojista</Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8 md:py-10">{children}</main>
      <footer className="mx-auto max-w-4xl px-5 pb-8 text-[11px] text-slate-400">© 2026 VitrineIA · Suas respostas são anônimas e usadas apenas de forma agregada.</footer>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const bare = BARE_PATHS.some((p) => pathname === p);
  const isPublic = PUBLIC_PATHS.some((p) => matches(pathname, p));

  useEffect(() => {
    if (!loading && !user && !bare && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, bare, isPublic, pathname, router]);

  if (bare) return <>{children}</>;
  if (isPublic) return <PublicFrame>{children}</PublicFrame>;
  if (loading || !user) return <div className="min-h-screen bg-canvas" />;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : matches(pathname, href));

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <aside className="hidden lg:flex w-[252px] shrink-0 flex-col border-r border-slate-100 bg-white px-5 py-6">
        <div className="mb-10"><Brand /></div>
        <div className="mb-3 px-3 text-[10px] font-bold tracking-[.16em] text-slate-400">WORKSPACE</div>
        <nav className="space-y-1">
          {workspaceNav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}><Icon size={17} />{item.label}</Link>; })}
        </nav>
        <div className="mb-3 mt-8 px-3 text-[10px] font-bold tracking-[.16em] text-slate-400">ENGAJAMENTO</div>
        <nav className="space-y-1">
          {engagementNav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}><Icon size={17} />{item.label}<span className="ml-auto rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-bold text-violet-600">BETA</span></Link>; })}
        </nav>
        <div className="mt-auto space-y-1 border-t border-slate-100 pt-5">
          <a className="sidebar-link" href="#"><Settings size={17} /> Configurações</a>
          <a className="sidebar-link" href="#"><CircleHelp size={17} /> Central de ajuda</a>
          <button onClick={logout} className="sidebar-link w-full text-left"><LogOut size={17} /> Sair</button>
          <div className="mt-4 rounded-2xl bg-[#f4f6ff] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-brand"><Zap size={14} /> VitrineIA Insights</div>
            <p className="text-[11px] leading-relaxed text-slate-500">Transforme dados em decisões mais inteligentes.</p>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white/90 px-5 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400"><ShoppingBag size={16} /><span className="hidden truncate sm:inline">{user.nome}</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-700">Painel comercial</span></div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-400 md:flex"><Search size={14} /> Buscar... <kbd className="ml-8 rounded bg-white px-1.5 py-0.5 text-[10px]">⌘ K</kbd></div>
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Notificações"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" /></button>
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-brand">{initials(user.nome)}</div>
              <div className="hidden sm:block"><div className="max-w-[160px] truncate text-xs font-bold text-slate-700">{user.nome}</div><div className="max-w-[160px] truncate text-[10px] text-slate-400">{user.segmento}</div></div>
              <ChevronDown size={14} className="text-slate-400" />
              <button onClick={logout} className="ml-1 rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden" aria-label="Sair"><LogOut size={17} /></button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {allNav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${isActive(item.href) ? "bg-brand text-white" : "bg-white text-slate-500"}`}><Icon size={15} />{item.label}</Link>; })}
          </div>
          {children}
          <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-slate-200/70 pt-5 text-[11px] text-slate-400 sm:flex-row"><span>© 2026 VitrineIA</span><span>Dados agregados e anônimos · LGPD</span></footer>
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Frame>{children}</Frame>
    </AuthProvider>
  );
}
