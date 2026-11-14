import { ReactNode } from "react";
import { BarChart3, ClipboardList, ShieldCheck, Sparkles } from "lucide-react";

const bullets = [
  { icon: ClipboardList, text: "Pesquisas rápidas com visitantes, em troca de pontos" },
  { icon: BarChart3, text: "Segmentos e oportunidades de venda cruzada com IA" },
  { icon: ShieldCheck, text: "Dados anônimos e agregados, em conformidade com a LGPD" },
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#273b87] via-[#3157D5] to-[#7658D6] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[48px] border-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Sparkles size={22} /></div>
          <div className="font-[Manrope] text-xl font-extrabold">VitrineIA</div>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-[Manrope] text-3xl font-extrabold leading-tight">Entenda quem passa pela sua vitrine.</h2>
          <p className="mt-3 text-sm leading-relaxed text-blue-100/80">Transforme respostas dos visitantes em campanhas que vendem mais, junto com as lojas ao redor.</p>
          <ul className="mt-8 space-y-4">
            {bullets.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-blue-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon size={17} /></span>{text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-[11px] text-blue-100/60">© 2026 VitrineIA</div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"><Sparkles size={20} /></div>
            <div className="font-[Manrope] text-xl font-extrabold">Vitrine<span className="text-brand">IA</span></div>
          </div>
          <h1 className="font-[Manrope] text-2xl font-extrabold text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </div>
  );
}
