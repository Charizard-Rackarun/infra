export type SalesPoint = { month: string; revenue: number; orders: number };
export type CategoryPoint = { name: string; value: number; color: string };
export type Activity = { id: string; title: string; description: string; time: string; type: "coupon" | "sale" | "consumer" | "campaign" };
export type DashboardData = {
  revenue: number; revenueChange: number; orders: number; ordersChange: number;
  averageTicket: number; averageTicketChange: number; activeConsumers: number; consumerChange: number;
  salesSeries: SalesPoint[]; categorySeries: CategoryPoint[]; recentActivity: Activity[];
};
export type ConsumerSegment = { id: string; name: string; count: number; percentage: number; trend: number; color: string; interests: string[] };
export type Opportunity = { id: string; title: string; description: string; stores: string[]; potential: string; confidence: number; category: string; priority: "Alta" | "Média" | "Baixa" };
export type Campaign = { id: string; name: string; store: string; type: string; status: "Ativa" | "Agendada" | "Encerrada"; reach: number; redemptions: number; startDate: string; endDate: string; discount: string };
// costPoints sempre vem da API (rota /rewards); fica opcional só para não quebrar os dados de exemplo (src/mocks)
export type Reward = { id: string; title: string; store: string; description: string; discount: string; category: string; expires: string; code: string; costPoints?: number };
export type RewardSummary = { points: number; level: string; nextLevelPoints: number; coupons: Reward[] };

/* ---------- Autenticação ---------- */
export type Estabelecimento = { id: number; nome: string; segmento: string; email: string };
export type RegistroInput = { nome: string; segmento: string; email: string; senha: string };

/* ---------- Questionários ---------- */
export type TipoPergunta = "unica" | "multipla" | "escala" | "sim_nao";
export type Dimensao = "categoria" | "frequencia";

export type QuestionarioResumo = { id: number; titulo: string; ativo: boolean; pontos: number; totalRespostas: number };

// leitura (visitante)
export type OpcaoQuestionario = { id: number; texto: string; exclusiva: boolean };
export type PerguntaQuestionario = {
  id: number; texto: string; tipo: TipoPergunta; dimensao: Dimensao | null;
  obrigatoria: boolean; maxSelecoes: number | null; opcoes: OpcaoQuestionario[];
};
export type Opcao = OpcaoQuestionario; // nomes antigos, mantidos por compatibilidade
export type Pergunta = PerguntaQuestionario;
export type Questionario = {
  id: number; titulo: string; descricao: string | null; ativo: boolean; pontos: number;
  loja?: string; // só vem na rota pública
  perguntas: PerguntaQuestionario[];
};

// criação (lojista). Em "escala" e "sim_nao" mande opcoes: [] — o servidor gera as opções.
export type QuestionarioInput = {
  titulo: string;
  descricao?: string | null;
  pontos: number;
  perguntas: {
    texto: string; tipo: TipoPergunta; dimensao: Dimensao | null;
    obrigatoria: boolean; maxSelecoes: number | null;
    opcoes: { texto: string; exclusiva: boolean }[];
  }[];
};

// lista "ganhe mais pontos" (pesquisas de todas as lojas)
export type QuestionarioPublicoResumo = {
  id: number; titulo: string; descricao: string | null; loja: string; segmento: string;
  pontos: number; pontosHoje: number; totalPerguntas: number; segundosEstimados: number; respondido: boolean;
};

export type RespostaInput = { respostas: { perguntaId: number; opcaoIds: number[] }[] };
export type RespostaResultado = { pontosGanhos: number; pontosTotal: number; bonusSexta13: boolean; visitanteToken: string | null };

// resultados (lojista): os números agora vêm sempre; amostraPequena só dispara um aviso
export type OpcaoResultado = { opcaoId: number; texto: string; total: number; percentual: number };
export type PerguntaResultado = {
  perguntaId: number; texto: string; tipo: TipoPergunta;
  respondentes: number; media: number | null; opcoes: OpcaoResultado[];
};
export type ResultadosQuestionario = {
  questionarioId: number; totalRespostas: number; amostraPequena: boolean; minimoRecomendado: number;
  perguntas: PerguntaResultado[];
};

/* ---------- Gestão (lojista) ---------- */
export type CampanhaInput = { nome: string; tipo: string; desconto: string; dataInicio: string; dataFim: string; alcance: number };

export type Cupom = {
  id: number; titulo: string; descricao: string; desconto: string; categoria: string; codigo: string;
  custoPontos: number; estoque: number | null; validade: string; ativo: boolean; exclusivoSexta13: boolean;
};
export type CupomInput = {
  titulo: string; descricao: string; desconto: string; categoria: string; custoPontos: number;
  estoque: number | null; validade: string; exclusivoSexta13: boolean; campanhaId: number | null;
};

export type ResgateResposta = { success: boolean; message: string; resgateCodigo: string | null; pontosRestantes: number | null };
export type ResgateValidado = { success: boolean; message: string };

export type VendaInput = { data: string; produto: string; categoria: string | null; quantidade: number; valor_total: number };
export type Venda = { id: number; data: string; produto: string; categoria: string | null; quantidade: number; valor_total: string | number };

export type EventoSexta13 = { ativo: boolean; nome: string; mensagem: string; proximaData: string; multiplicadorPontos: number };