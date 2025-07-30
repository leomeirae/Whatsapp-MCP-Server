# Use uma imagem base oficial do Node.js
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o código da aplicação
COPY . .

# Define variáveis de ambiente padrão
ENV PORT=45679
ENV NODE_ENV=production
ENV WHATSAPP_API_VERSION=v18.0

# Expõe a porta
EXPOSE 45679

# Comando para iniciar o servidor
CMD ["node", "server.js"] 