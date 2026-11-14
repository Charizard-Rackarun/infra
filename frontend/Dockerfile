FROM node:18-alpine

WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json* ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código do frontend
COPY . .

# Executa o build de produção do Next.js
RUN npm run build

EXPOSE 3000

# Comando para iniciar o servidor Next.js
CMD ["npm", "run", "start"]