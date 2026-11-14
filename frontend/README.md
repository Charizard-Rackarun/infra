# VitrineIA — Frontend Next.js

Frontend demonstrativo da VitrineIA, preparado para integração com um backend Python.

## Requisitos
- Node.js 20.9+
- npm

## Executar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse http://localhost:3000.

## O que está implementado
- Dashboard com indicadores, gráfico de vendas e atividade recente.
- Visão de consumidores e preferências agregadas.
- Oportunidades comerciais entre segmentos.
- Gestão visual de campanhas e cupons.
- Área VitrineIA Rewards para consumidores.
- Campanha temática Sexta 13 (estado demonstrativo).
- Camada de serviços desacoplada da interface (`src/lib/api.ts`).
- Tipos TypeScript para contratos de dados (`src/types/index.ts`).
- Dados fictícios centralizados (`src/mocks/data.ts`).

## Integração com backend Python

Configure `NEXT_PUBLIC_API_URL` no `.env.local`, por exemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCKS=true
```

A camada `src/lib/api.ts` tenta consultar os endpoints abaixo. Se a API estiver indisponível e `NEXT_PUBLIC_USE_MOCKS=true`, retorna os dados fictícios.

| Método | Endpoint | Retorno esperado |
|---|---|---|
| GET | `/dashboard` | `DashboardData` |
| GET | `/consumers/segments` | `ConsumerSegment[]` |
| GET | `/opportunities` | `Opportunity[]` |
| GET | `/campaigns` | `Campaign[]` |
| GET | `/rewards` | `RewardSummary` |
| POST | `/coupons/redeem` | `{ success: boolean, message: string }` |

### Exemplo de resposta para `GET /dashboard`

```json
{
  "revenue": 128450,
  "revenueChange": 12.8,
  "orders": 1842,
  "ordersChange": 8.4,
  "averageTicket": 69.74,
  "averageTicketChange": 3.2,
  "activeConsumers": 6240,
  "consumerChange": 14.6,
  "salesSeries": [
    { "month": "Jan", "revenue": 72000, "orders": 980 }
  ],
  "categorySeries": [
    { "name": "Moda", "value": 35, "color": "#3157D5" }
  ],
  "recentActivity": [
    { "id": "a1", "title": "Cupom utilizado", "description": "Loja Fashion · LOOK15", "time": "Há 8 min", "type": "coupon" }
  ]
}
```

O backend pode ser feito em FastAPI, Flask ou Django REST Framework. Recomenda-se habilitar CORS para `http://localhost:3000`.

### Exemplo mínimo em FastAPI

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/dashboard")
def dashboard():
    return {
        "revenue": 128450,
        "revenueChange": 12.8,
        "orders": 1842,
        "ordersChange": 8.4,
        "averageTicket": 69.74,
        "averageTicketChange": 3.2,
        "activeConsumers": 6240,
        "consumerChange": 14.6,
        "salesSeries": [{"month": "Jan", "revenue": 72000, "orders": 980}],
        "categorySeries": [{"name": "Moda", "value": 35, "color": "#3157D5"}],
        "recentActivity": []
    }
```

## Observações
- Os números e nomes exibidos são inteiramente fictícios, para demonstração.
- O evento Sexta 13 está em modo de demonstração. A ativação real deve ser controlada pelo backend e pelas datas/condições das campanhas.
- Não use dados pessoais reais no protótipo. Para produção, implemente autenticação, autorização, política de privacidade, retenção e controles LGPD.
