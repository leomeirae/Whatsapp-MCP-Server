# WhatsApp MCP Server - Deploy no Coolify

Este repositório contém os arquivos necessários para fazer o deploy do WhatsApp MCP Server no Coolify usando Docker, configurado para **envio de mensagens e templates via WhatsApp Business API**.

## O que é o WhatsApp MCP Server?

O WhatsApp MCP Server permite conectar a WhatsApp Business API a assistentes de IA como Cursor, Claude, Windsurf e outros através do Model Context Protocol (MCP). Ele oferece ferramentas para:

- **Envio de Mensagens**: Texto, templates, imagens
- **Gestão de Templates**: Mensagens estruturadas
- **Confirmação de Leitura**: Tracking de entrega
- **Integração com IA**: Via protocolo MCP

## Pré-requisitos

1. **Coolify Self-Hosted**: Uma instância do Coolify funcionando
2. **Conta no GitHub**: Para armazenar este repositório
3. **WhatsApp Business API**: Credenciais da API oficial

## Como Obter as Credenciais WhatsApp

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um app ou use um existente
3. Configure a WhatsApp Business API
4. Obtenha:
   - API Token
   - Phone Number ID
   - Business Account ID

## Deploy no Coolify

### Passo 1: Preparar o Repositório

1. Faça fork ou clone este repositório
2. Envie para seu GitHub (pode ser privado)

### Passo 2: Configurar no Coolify

1. No dashboard do Coolify, vá para **Create New Resource**
2. Selecione **"Deploy from a Git Repository"**
3. Conecte sua conta do GitHub e selecione este repositório
4. Dê um nome ao serviço, como "WhatsApp MCP Server"

### Passo 3: Configurar Variáveis de Ambiente

Na aba **Environment Variables** do Coolify, configure:

#### Variáveis Obrigatórias:
- `WHATSAPP_API_TOKEN`: Seu token da WhatsApp Business API
  - **IMPORTANTE**: Marque como "Build-time variable" e "Is secret"
- `WHATSAPP_PHONE_NUMBER_ID`: ID do número de telefone
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: ID da conta de negócio

#### Variáveis Opcionais:
- `WHATSAPP_API_VERSION`: v18.0 (padrão)
- `PORT`: 45679 (padrão)

### Passo 4: Fazer o Deploy

1. Clique em **Deploy**
2. Acompanhe os logs na aba **Logs**
3. Aguarde a inicialização completa

## Funcionalidades Disponíveis

### 📱 Envio de Mensagens
- **sendTextMessage**: Envia mensagem de texto
- **sendTemplateMessage**: Envia template estruturado
- **sendImageMessage**: Envia imagem com legenda
- **markMessageAsRead**: Marca mensagem como lida

### 🔧 Integração MCP
- **Protocolo MCP**: Compatível com clientes de IA
- **HTTP Interface**: Endpoint REST para integração
- **Error Handling**: Tratamento robusto de erros

## Configuração de Segurança

### ⚠️ Avisos Importantes:

1. **API Token**: Mantenha o token seguro e não o exponha
2. **Rate Limiting**: Respeite os limites da API WhatsApp
3. **Monitoramento**: Monitore os logs regularmente
4. **Templates**: Configure templates aprovados no WhatsApp
5. **Testes**: Teste em ambiente de desenvolvimento primeiro

## Uso com Serena SDR

Este servidor é projetado para integrar com o agente Serena SDR:

1. **Respostas da IA**: Envio automático de respostas da Sílvia
2. **Templates**: Mensagens estruturadas para qualificação
3. **Confirmação**: Tracking de entrega de mensagens
4. **Integração Kestra**: Via HTTP requests no workflow

## Endpoints Disponíveis

- `GET /health`: Health check
- `GET /status`: Status do servidor
- `GET /`: Informações gerais
- `POST /mcp`: Endpoint principal MCP
- `GET /test`: Endpoint de teste

## Desenvolvimento Local

### Instalação

```bash
npm install
```

### Configuração

1. Copie `env.example` para `.env`
2. Configure suas credenciais WhatsApp

### Execução

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### Docker

```bash
# Build da imagem
docker build -t whatsapp-mcp .

# Execução
docker run -p 45679:45679 --env-file .env whatsapp-mcp

# Docker Compose
docker-compose up -d
```

## Testes

### Health Check
```bash
curl http://localhost:45679/health
```

### Listar Ferramentas MCP
```bash
curl -X POST http://localhost:45679/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Enviar Mensagem de Teste
```bash
curl -X POST http://localhost:45679/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "sendTextMessage",
      "arguments": {
        "to": "5511999999999",
        "message": "Teste do MCP Server"
      }
    }
  }'
```

## Licença

MIT 