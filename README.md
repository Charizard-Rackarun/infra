

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

* **Git** (`git --version`)
* **Docker** (`docker --version`)
* **Docker Compose** (`docker compose version`)

> *Nota: Se estiver utilizando Windows ou macOS, recomenda-se a instalação do **Docker Desktop**. No Linux (Ubuntu/Debian), certifique-se de que o serviço do Docker está ativo (`sudo systemctl start docker`) e que seu usuário tem permissão para executá-lo sem `sudo`.*

## 🚀 Passo a Passo para Instalação e Execução

Siga as etapas abaixo no seu terminal para baixar o projeto, configurar o ambiente e subir os containers:

### 1. Clonar o repositório

Baixe o código-fonte do repositório `infra` e acesse a pasta raiz do projeto:

```bash
git clone [https://github.com/seu-usuario/infra.git](https://github.com/seu-usuario/infra.git)
cd infra
```

*(Substitua `seu-usuario` pelo nome do usuário ou organização proprietária do repositório no GitHub).*

### 2. Configurar as variáveis de ambiente (`.env`)

O projeto possui arquivos de exemplo de configuração tanto para o **backend** quanto para o **frontend**. Crie os arquivos `.env` reais a partir dos modelos:

**No Linux / macOS / Git Bash:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**No Windows (PowerShell / CMD):**

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

> **Importante:** Abra os arquivos `backend/.env` e `frontend/.env` e preencha as credenciais necessárias (como URL do banco de dados, chaves secretas e URLs da API) antes de subir os containers.

### 3. Construir e subir os containers com Docker Compose

Na pasta raiz do projeto (`infra/`), execute o comando abaixo para construir as imagens e iniciar todos os serviços em segundo plano:

```bash
docker compose up -d --build
```

* O parâmetro `--build` garante que as imagens do `backend` e `frontend` sejam construídas com as dependências mais recentes.
* O parâmetro `-d` (*detached mode*) roda os containers em segundo plano, liberando o seu terminal.

### 4. Executar as migrações do banco de dados (Alembic)

Caso o banco de dados precise ser inicializado ou atualizado pela primeira vez, execute as migrações dentro do container do backend:

```bash
docker compose exec backend alembic upgrade head
```

### 5. Acessar a aplicação

Após os containers estarem rodando, você poderá acessar os serviços nos seguintes endços locais (verifique as portas exatas no seu `docker-compose.yml`):

* **Frontend (Aplicação Web):** `http://localhost:3000`
* **Backend (API / Documentação Swagger):** `http://localhost:8000/docs`

## 🛠️ Comandos Úteis do Docker

Gerencie o ciclo de vida dos containers utilizando os comandos abaixo na raiz do projeto:

* **Verificar o status dos containers em execução:**
  
```bash
  docker compose ps
  
```

* **Visualizar os logs em tempo real (todos os serviços):**
  
```bash
  docker compose logs -f
  
```

* **Visualizar logs de um serviço específico (ex: `backend` ou `frontend`):**
  
```bash
  docker compose logs -f backend
  
```

* **Parar os containers sem remover os dados:**
  
```bash
  docker compose stop
  
```

* **Parar e remover os containers e redes criados:**
  
```bash
  docker compose down
  
```
  *(Adicione `-v` ao final — `docker compose down -v` — caso deseje apagar também os volumes/dados do banco).*

## 📂 Estrutura do Repositório

```text
infra/
├── backend/                 # Código-fonte da API, Alembic e Dockerfile do Backend
│   ├── alembic/             # Migrações de banco de dados
│   ├── app/                 # Lógica da aplicação
│   ├── .env.example         # Modelo de variáveis de ambiente do Backend
│   ├── Dockerfile           # Instruções de build da imagem do Backend
│   └── requirements.txt     # Dependências Python
├── frontend/                # Código-fonte Next.js e Dockerfile do Frontend
│   ├── src/                 # Páginas, componentes e hooks
│   ├── .env.example         # Modelo de variáveis de ambiente do Frontend
│   ├── Dockerfile           # Instruções de build da imagem do Frontend
│   └── package.json         # Dependências Node.js
├── .gitignore               # Arquivos ignorados pelo Git (.env, .venv, node_modules)
├── docker-compose.yml       # Orquestração dos serviços (Backend, Frontend, Banco)
└── README.md                # Documentação do projeto
```
