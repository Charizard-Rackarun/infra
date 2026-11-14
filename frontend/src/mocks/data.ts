import { DashboardData, ConsumerSegment, Opportunity, Campaign, RewardSummary } from "@/types";

export const dashboardMock: DashboardData = {
  revenue: 128450, revenueChange: 12.8, orders: 1842, ordersChange: 8.4,
  averageTicket: 69.74, averageTicketChange: 3.2, activeConsumers: 6240, consumerChange: 14.6,
  salesSeries: [
    { month: "Mai", revenue: 78000, orders: 1120 }, { month: "Jun", revenue: 84000, orders: 1210 },
    { month: "Jul", revenue: 81000, orders: 1180 }, { month: "Ago", revenue: 96000, orders: 1390 },
    { month: "Set", revenue: 103000, orders: 1510 }, { month: "Out", revenue: 114000, orders: 1640 },
    { month: "Nov", revenue: 128450, orders: 1842 }
  ],
  categorySeries: [
    { name: "Moda", value: 35, color: "#3157D5" }, { name: "Beleza", value: 25, color: "#8B6CE8" },
    { name: "Alimentação", value: 20, color: "#21A67A" }, { name: "Eletrônicos", value: 12, color: "#F0A34A" },
    { name: "Outros", value: 8, color: "#AAB4C5" }
  ],
  recentActivity: [
    { id: "1", title: "Cupom utilizado", description: "Loja Fashion · LOOK15", time: "Há 8 min", type: "coupon" },
    { id: "2", title: "Nova campanha publicada", description: "Festival de Beleza · Perfumaria Aura", time: "Há 32 min", type: "campaign" },
    { id: "3", title: "Venda registrada", description: "Eletrônicos Central · R$ 489,90", time: "Há 1 h", type: "sale" },
    { id: "4", title: "Novo consumidor cadastrado", description: "Interesses: moda e beleza", time: "Há 2 h", type: "consumer" }
  ]
};

export const consumerSegmentsMock: ConsumerSegment[] = [
  { id: "1", name: "Moda e acessórios", count: 2180, percentage: 35, trend: 12, color: "#3157D5", interests: ["Moda casual", "Calçados", "Acessórios"] },
  { id: "2", name: "Beleza e perfumaria", count: 1560, percentage: 25, trend: 18, color: "#8B6CE8", interests: ["Perfumes", "Skincare", "Maquiagem"] },
  { id: "3", name: "Alimentação", count: 1248, percentage: 20, trend: 7, color: "#21A67A", interests: ["Restaurantes", "Cafeterias", "Lanches"] },
  { id: "4", name: "Tecnologia", count: 749, percentage: 12, trend: -2, color: "#F0A34A", interests: ["Smartphones", "Acessórios", "Games"] },
  { id: "5", name: "Casa e decoração", count: 503, percentage: 8, trend: 5, color: "#AAB4C5", interests: ["Decoração", "Organização", "Utilidades"] }
];

export const opportunitiesMock: Opportunity[] = [
  { id: "1", title: "Moda + Perfumaria", description: "Consumidores que demonstram interesse em moda também apresentam alta intenção declarada de compra em beleza. Sugestão: campanha combinada de look e fragrância.", stores: ["Loja Fashion", "Perfumaria Aura"], potential: "Alto potencial", confidence: 87, category: "Venda cruzada", priority: "Alta" },
  { id: "2", title: "Alimentação no horário noturno", description: "A procura por alimentação cresce nos períodos próximos às sessões de cinema. Sugestão: cupom de combo para visitantes do período.", stores: ["Café Central", "Cine Plaza"], potential: "Oportunidade sazonal", confidence: 79, category: "Campanha contextual", priority: "Média" },
  { id: "3", title: "Tecnologia para público jovem", description: "Pesquisas voluntárias indicam interesse em acessórios mobile. Sugestão: campanha de acessórios com benefício progressivo.", stores: ["Tech Store", "Game House"], potential: "Potencial de conversão", confidence: 72, category: "Segmentação", priority: "Média" }
];

export const campaignsMock: Campaign[] = [
  { id: "1", name: "Festival de Beleza", store: "Perfumaria Aura", type: "Desconto", status: "Ativa", reach: 1840, redemptions: 216, startDate: "10/11/2026", endDate: "20/11/2026", discount: "20%" },
  { id: "2", name: "Look de Verão", store: "Loja Fashion", type: "Cupom", status: "Ativa", reach: 2350, redemptions: 318, startDate: "08/11/2026", endDate: "18/11/2026", discount: "15%" },
  { id: "3", name: "Sexta 13 — Ofertas Secretas", store: "Todas as participantes", type: "Evento especial", status: "Agendada", reach: 0, redemptions: 0, startDate: "13/11/2026", endDate: "13/11/2026", discount: "Até 50%" },
  { id: "4", name: "Tech Week", store: "Tech Store", type: "Desconto", status: "Encerrada", reach: 980, redemptions: 104, startDate: "01/11/2026", endDate: "07/11/2026", discount: "10%" }
];

export const rewardsMock: RewardSummary = {
  points: 680, level: "Caçador de ofertas", nextLevelPoints: 1000,
  coupons: [
    { id: "1", title: "Seu próximo look", store: "Loja Fashion", description: "Em compras acima de R$ 120", discount: "15% OFF", category: "Moda", expires: "20 nov, 2026", code: "LOOK15" },
    { id: "2", title: "Momento perfumado", store: "Perfumaria Aura", description: "Em produtos selecionados", discount: "20% OFF", category: "Beleza", expires: "18 nov, 2026", code: "AURA20" },
    { id: "3", title: "Pausa para um café", store: "Café Central", description: "Na compra de uma bebida + salgado", discount: "R$ 8 OFF", category: "Alimentação", expires: "22 nov, 2026", code: "CAFE8" }
  ]
};
