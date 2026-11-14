"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ArrowUpRightFromSquare, CalendarDays, Download, ShoppingCart, Sparkles, Ticket, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { PageHeading, SectionTitle, StatCard } from "@/components/ui";
import { Alert } from "@/components/form";
import Link from "next/link";

const hoje = () => new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase();
const money = (v:number) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});

export default function DashboardPage() {
  const [data,setData] = useState<DashboardData | null>(null);
  const [error,setError] = useState("");
  useEffect(() => { api.getDashboard().then(setData).catch(e=>setError(e instanceof Error?e.message:"Erro ao carregar o painel")); }, []);
  if (error) return <Alert>{error}</Alert>;
  if (!data) return <div className="animate-pulse space-y-5"><div className="h-12 w-64 rounded-xl bg-slate-200"/><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map(x=><div key={x} className="h-36 rounded-2xl bg-white"/> )}</div></div>;
  return <>
    <PageHeading eyebrow={hoje()} title="Visão geral" description="Acompanhe a saúde comercial e descubra novas oportunidades." action={<button onClick={()=>window.print()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"><Download size={15}/> Exportar relatório</button>}/>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Faturamento total" value={money(data.revenue)} change={data.revenueChange} icon={<ShoppingCart size={18}/>} accent="blue"/>
      <StatCard label="Vendas realizadas" value={data.orders.toLocaleString("pt-BR")} change={data.ordersChange} icon={<Ticket size={18}/>} accent="violet"/>
      <StatCard label="Ticket médio" value={data.averageTicket.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} change={data.averageTicketChange} icon={<ArrowUpRight size={18}/>} accent="green"/>
      <StatCard label="Consumidores ativos" value={data.activeConsumers.toLocaleString("pt-BR")} change={data.consumerChange} icon={<Users size={18}/>} accent="amber"/>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
      <section className="card p-5 md:p-6"><SectionTitle title="Desempenho de vendas" subtitle="Evolução do faturamento mês a mês" action={<span className="rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500">Últimos 7 meses</span>}/><div className="mt-5 h-[270px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.salesSeries}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3157D5" stopOpacity={.2}/><stop offset="95%" stopColor="#3157D5" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eef1f6" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#98a2b3"}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#98a2b3"}} tickFormatter={v=>`${v/1000}k`}/><Tooltip formatter={(v:any)=>money(Number(v))} contentStyle={{borderRadius:12,border:"1px solid #edf0f5",fontSize:12}}/><Area type="monotone" dataKey="revenue" stroke="#3157D5" strokeWidth={3} fill="url(#salesFill)" activeDot={{r:5}}/></AreaChart></ResponsiveContainer></div></section>
      <section className="card p-5 md:p-6"><SectionTitle title="Vendas por segmento" subtitle="Distribuição do faturamento"/>{data.categorySeries.length===0 ? <p className="py-16 text-center text-xs text-slate-400">Registre vendas com categoria para ver a distribuição.</p> : <><div className="relative h-[210px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.categorySeries} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none">{data.categorySeries.map((entry,index)=><Cell key={index} fill={entry.color}/>)}</Pie><Tooltip formatter={(v:any)=>`${v}%`}/></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="font-[Manrope] text-2xl font-extrabold">100%</strong><span className="text-[10px] text-slate-400">Segmentos</span></div></div><div className="mt-2 space-y-2">{data.categorySeries.map(c=><div key={c.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-slate-500"><i className="h-2 w-2 rounded-full" style={{background:c.color}}/>{c.name}</span><strong className="text-slate-700">{c.value}%</strong></div>)}</div></>}</section>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <section className="card p-5"><SectionTitle title="Atividade recente" subtitle="Últimas movimentações da plataforma" action={<button className="text-xs font-bold text-brand">Ver tudo</button>}/>{data.recentActivity.length===0 && <p className="py-10 text-center text-xs text-slate-400">Sem movimentações ainda. Registre uma venda ou publique um questionário.</p>}<div className="divide-y divide-slate-50">{data.recentActivity.map((a)=><div key={a.id} className="flex items-center gap-3 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand"><ActivityIcon type={a.type}/></div><div className="min-w-0 flex-1"><div className="text-xs font-bold text-slate-700">{a.title}</div><div className="mt-0.5 truncate text-[11px] text-slate-400">{a.description}</div></div><span className="shrink-0 text-[10px] text-slate-400">{a.time}</span></div>)}</div></section>
      <section className="relative overflow-hidden rounded-[18px] bg-[#1d2850] p-6 text-white shadow-soft"><div className="absolute -right-10 -top-12 h-48 w-48 rounded-full border-[30px] border-white/5"/><div className="relative"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Sparkles size={20}/></div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-200">VitrineIA Insights</span><h3 className="mt-2 max-w-sm text-xl font-extrabold leading-snug">Uma oportunidade esperando para ser descoberta.</h3><p className="mt-2 max-w-sm text-xs leading-relaxed text-blue-100/70">A IA cruza os interesses dos visitantes e sugere campanhas conjuntas entre lojas. Gere uma nova análise quando houver respostas novas.</p><Link href="/oportunidades" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#263b78]">Ver oportunidade <ArrowUpRightFromSquare size={14}/></Link></div></section>
    </div>
  </>;
}
function ActivityIcon({type}:{type:string}) { if(type==="coupon") return <Ticket size={16}/>; if(type==="sale") return <ShoppingCart size={16}/>; if(type==="consumer") return <Users size={16}/>; return <CalendarDays size={16}/>; }
