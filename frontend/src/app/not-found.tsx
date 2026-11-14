import Link from "next/link";
export default function NotFound(){return <div className="card mx-auto max-w-lg p-10 text-center"><h1 className="text-3xl font-extrabold">Página não encontrada</h1><p className="my-3 text-sm text-slate-500">A página que você procura não existe.</p><Link href="/" className="text-sm font-bold text-brand">Voltar ao painel</Link></div>}
