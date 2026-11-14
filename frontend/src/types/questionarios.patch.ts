/**
 * SUBSTITUA em src/types (index.ts) as definições existentes com estes nomes
 * e ADICIONE as novas (QuestionarioPublicoResumo, OpcaoQuestionario, PerguntaQuestionario).
 */

export type TipoPergunta = "unica" | "multipla" | "escala" | "sim_nao";
export type Dimensao = "categoria" | "frequencia";

/* ---------- criação (lojista) ---------- */
export type OpcaoInput = { texto: string; exclusiva: boolean };
export type PerguntaInput = {
  texto: string;
  tipo: TipoPergunta;
  dimensao: Dimensao | null;
  obrigatoria: boolean;
  maxSelecoes: number | null;
  opcoes: OpcaoInput[]; // vazio para "escala" e "sim_nao": o servidor gera as opções
};
export type QuestionarioInput = {
  titulo: string;
  descricao: string | null;
  pontos: number;
  perguntas: PerguntaInput[];
};

/* ---------- leitura (visitante) ---------- */
export type OpcaoQuestionario = { id: number; texto: string; exclusiva: boolean };
export type PerguntaQuestionario = {
  id: number;
  texto: string;
  tipo: TipoPergunta;
  dimensao: Dimensao | null;
  obrigatoria: boolean;
  maxSelecoes: number | null;
  opcoes: OpcaoQuestionario[];
};
export type Questionario = {
  id: number;
  titulo: string;
  descricao: string | null;
  ativo: boolean;
  pontos: number;
  loja?: string; // só vem na rota pública
  perguntas: PerguntaQuestionario[];
};

/* ---------- lista "ganhe mais pontos" ---------- */
export type QuestionarioPublicoResumo = {
  id: number;
  titulo: string;
  descricao: string | null;
  loja: string;
  segmento: string;
  pontos: number;
  pontosHoje: number;
  totalPerguntas: number;
  segundosEstimados: number;
  respondido: boolean;
};

/* ---------- resultados (lojista) ---------- */
export type OpcaoResultado = { opcaoId: number; texto: string; total: number; percentual: number };
export type PerguntaResultado = {
  perguntaId: number;
  texto: string;
  tipo: TipoPergunta;
  respondentes: number;
  media: number | null;
  opcoes: OpcaoResultado[];
};
export type ResultadosQuestionario = {
  questionarioId: number;
  totalRespostas: number;
  amostraPequena: boolean;
  minimoRecomendado: number;
  perguntas: PerguntaResultado[];
};

/* ---------- Reward: costPoints passa a vir sempre ---------- */
// no tipo Reward existente, troque `costPoints?: number` por `costPoints: number`
