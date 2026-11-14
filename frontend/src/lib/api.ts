import type {
  Campaign, CampanhaInput, ConsumerSegment, Cupom, CupomInput, DashboardData, Estabelecimento, EventoSexta13,
  Opportunity, Questionario, QuestionarioInput, QuestionarioPublicoResumo, QuestionarioResumo, RegistroInput,
  ResgateResposta, ResgateValidado, RespostaInput, RespostaResultado, ResultadosQuestionario, RewardSummary,
  Venda, VendaInput,
} from "@/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
export const UNAUTH_EVENT = "vitrineia:unauthorized";

const TOKEN_KEY = "vitrineia.token"; // JWT do lojista
const VISITOR_KEY = "vitrineia.visitante"; // token anônimo do visitante

const isBrowser = typeof window !== "undefined";
function read(key: string): string | null {
  if (!isBrowser) return null;
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null) {
  if (!isBrowser) return;
  try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* ignora */ }
}

export const session = {
  getToken: () => read(TOKEN_KEY),
  setToken: (t: string | null) => write(TOKEN_KEY, t),
  getVisitor: () => read(VISITOR_KEY),
  setVisitor: (t: string | null) => write(VISITOR_KEY, t),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function detailMessage(body: any, fallback: string): string {
  const d = body?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    const msgs = d.map((e) => String(e?.msg ?? "").replace(/^Value error, /, "")).filter(Boolean);
    if (msgs.length) return msgs.join("; ");
  }
  return fallback;
}

type Auth = "lojista" | "visitante" | "none";
type Options = { method?: string; body?: unknown; form?: Record<string, string>; auth?: Auth };

async function request<T>(path: string, { method = "GET", body, form, auth = "none" }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  if (auth === "lojista") {
    const token = session.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  if (auth === "visitante") {
    const visitor = session.getVisitor();
    if (visitor) headers["X-Visitante-Token"] = visitor;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, cache: "no-store" });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique se a API está no ar.");
  }

  if (!res.ok) {
    let data: unknown = null;
    try { data = await res.json(); } catch { /* corpo vazio */ }
    if (res.status === 401 && auth === "lojista") {
      session.setToken(null);
      if (isBrowser) window.dispatchEvent(new Event(UNAUTH_EVENT));
    }
    throw new ApiError(res.status, detailMessage(data, `Erro ${res.status} ao falar com o servidor`));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  /* ---------- autenticação ---------- */
  async login(email: string, senha: string) {
    const { access_token } = await request<{ access_token: string }>("/auth/login", {
      method: "POST",
      form: { username: email, password: senha },
    });
    session.setToken(access_token);
  },
  register: (dados: RegistroInput) => request<Estabelecimento>("/auth/registro", { method: "POST", body: dados }),
  me: () => request<Estabelecimento>("/auth/me", { auth: "lojista" }),
  logout: () => session.setToken(null),

  /* ---------- painel do lojista ---------- */
  getDashboard: () => request<DashboardData>("/dashboard", { auth: "lojista" }),
  getConsumerSegments: () => request<ConsumerSegment[]>("/consumers/segments", { auth: "lojista" }),
  getOpportunities: () => request<Opportunity[]>("/opportunities", { auth: "lojista" }),
  generateOpportunities: () => request<Opportunity[]>("/opportunities/gerar", { method: "POST", auth: "lojista" }),
  getCampaigns: () => request<Campaign[]>("/campaigns", { auth: "lojista" }),
  createCampaign: (dados: CampanhaInput) => request<Campaign>("/campaigns", { method: "POST", body: dados, auth: "lojista" }),
  listCupons: () => request<Cupom[]>("/cupons", { auth: "lojista" }),
  createCupom: (dados: CupomInput) => request<Cupom>("/cupons", { method: "POST", body: dados, auth: "lojista" }),
  validarResgate: (codigo: string) =>
    request<ResgateValidado>("/resgates/validar", { method: "POST", body: { codigo }, auth: "lojista" }),
  registrarVenda: (dados: VendaInput) => request<Venda>("/vendas", { method: "POST", body: dados, auth: "lojista" }),

  /* ---------- questionários (lojista) ---------- */
  listQuestionarios: () => request<QuestionarioResumo[]>("/questionarios", { auth: "lojista" }),
  createQuestionario: (dados: QuestionarioInput) =>
    request<Questionario>("/questionarios", { method: "POST", body: dados, auth: "lojista" }),
  setQuestionarioAtivo: (id: number, ativo: boolean) =>
    request<{ ativo: boolean }>(`/questionarios/${id}`, { method: "PATCH", body: { ativo }, auth: "lojista" }),
  getResultados: (id: number) => request<ResultadosQuestionario>(`/questionarios/${id}/resultados`, { auth: "lojista" }),

  /* ---------- visitante (público) ---------- */
  listQuestionariosPublicos: () =>
    request<QuestionarioPublicoResumo[]>("/public/questionarios", { auth: "visitante" }),
  getQuestionarioPublico: (id: number) => request<Questionario>(`/public/questionarios/${id}`),
  async responder(id: number, dados: RespostaInput) {
    const resultado = await request<RespostaResultado>(`/public/questionarios/${id}/respostas`, {
      method: "POST",
      body: dados,
      auth: "visitante",
    });
    if (resultado.visitanteToken) session.setVisitor(resultado.visitanteToken);
    return resultado;
  },
  getRewards: () => request<RewardSummary>("/rewards", { auth: "visitante" }),
  redeemCoupon: (code: string) =>
    request<ResgateResposta>("/coupons/redeem", { method: "POST", body: { code }, auth: "visitante" }),
  getSexta13: () => request<EventoSexta13>("/eventos/sexta-13"),
};
