# WhatsApp MCP Server - Guia de Implementação

Este documento fornece todas as etapas necessárias para criar um MCP server do WhatsApp Business API, seguindo o mesmo padrão do servidor Supabase MCP existente. O objetivo é criar um servidor HTTP wrapper que permita integração com o agente Serena SDR via Kestra.

## 📋 Visão Geral

O WhatsApp MCP Server será um servidor Node.js que:
- Expõe uma interface HTTP para comunicação MCP
- Integra com a WhatsApp Business API oficial
- Segue o mesmo padrão do servidor Supabase MCP existente
- Permite envio de mensagens, templates e gerenciamento de mídia

## 🏗️ Estrutura do Projeto

```
whatsapp-mcp-server/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
├── .env.example
├── .gitignore
├── README.md
└── instrucoes.md
```

## 📦 Dependências (package.json)

```json
{
  "name": "whatsapp-mcp-http-server",
  "version": "1.0.0",
  "description": "HTTP wrapper for WhatsApp Business API MCP Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["mcp", "whatsapp", "http", "server", "business-api"],
  "author": "",
  "license": "MIT"
}
```

## 🔧 Configuração (.env.example)

```env
# WhatsApp Business API Credentials
WHATSAPP_API_TOKEN=your_whatsapp_api_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_API_VERSION=v18.0

# Server Configuration
PORT=45679
NODE_ENV=production

# Optional: Webhook Configuration
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

## 🚀 Servidor Principal (server.js)

### Estrutura Base

```javascript
const { spawn } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 45679;

// Middleware
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')}`);
  next();
});
```

### Endpoints Essenciais

#### 1. Health Check
```javascript
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: {
      hasToken: !!process.env.WHATSAPP_API_TOKEN,
      hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasBusinessAccountId: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    }
  });
});
```

#### 2. Root Endpoint
```javascript
app.get('/', (req, res) => {
  console.log('Root endpoint requested');
  res.json({ 
    message: 'WhatsApp MCP HTTP Server is running!',
    endpoints: {
      health: '/health',
      mcp: '/mcp (POST)',
      status: '/status',
      test: '/test'
    },
    timestamp: new Date().toISOString()
  });
});
```

#### 3. Status Endpoint
```javascript
app.get('/status', (req, res) => {
  console.log('Status endpoint requested');
  res.json({
    server: 'running',
    port: PORT,
    environment: {
      WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN ? '***SET***' : 'NOT SET',
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || 'NOT SET',
      WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'NOT SET'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### MCP Endpoint Principal

```javascript
app.post('/mcp', async (req, res) => {
  console.log('MCP endpoint requested');
  try {
    const mcpData = req.body;
    
    // Validate required environment variables
    if (!process.env.WHATSAPP_API_TOKEN) {
      console.log('Error: WHATSAPP_API_TOKEN not set');
      return res.status(500).json({ error: 'WHATSAPP_API_TOKEN not set' });
    }
    
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log('Error: WHATSAPP_PHONE_NUMBER_ID not set');
      return res.status(500).json({ error: 'WHATSAPP_PHONE_NUMBER_ID not set' });
    }
    
    // Process MCP request
    const result = await processMCPRequest(mcpData);
    res.json(result);
    
  } catch (err) {
    console.log('Error in MCP endpoint:', err);
    res.status(500).json({ error: err.message });
  }
});
```

### Função de Processamento MCP

```javascript
async function processMCPRequest(mcpData) {
  const { method, params } = mcpData;
  
  switch (method) {
    case 'tools/list':
      return {
        jsonrpc: "2.0",
        id: mcpData.id,
        result: {
          tools: [
            {
              name: "sendTextMessage",
              description: "Send a text message via WhatsApp",
              inputSchema: {
                type: "object",
                properties: {
                  to: { type: "string", description: "Phone number to send message to" },
                  message: { type: "string", description: "Text message content" }
                },
                required: ["to", "message"]
              }
            },
            {
              name: "sendTemplateMessage",
              description: "Send a template message via WhatsApp",
              inputSchema: {
                type: "object",
                properties: {
                  to: { type: "string", description: "Phone number to send message to" },
                  templateName: { type: "string", description: "Template name" },
                  language: { type: "string", description: "Template language code" },
                  components: { type: "array", description: "Template components" }
                },
                required: ["to", "templateName", "language"]
              }
            },
            {
              name: "sendImageMessage",
              description: "Send an image message via WhatsApp",
              inputSchema: {
                type: "object",
                properties: {
                  to: { type: "string", description: "Phone number to send message to" },
                  imageUrl: { type: "string", description: "URL of the image" },
                  caption: { type: "string", description: "Image caption" }
                },
                required: ["to", "imageUrl"]
              }
            },
            {
              name: "markMessageAsRead",
              description: "Mark a message as read",
              inputSchema: {
                type: "object",
                properties: {
                  messageId: { type: "string", description: "Message ID to mark as read" }
                },
                required: ["messageId"]
              }
            }
          ]
        }
      };
      
    case 'tools/call':
      return await handleToolCall(params);
      
    default:
      throw new Error(`Unknown method: ${method}`);
  }
}
```

### Handlers de Ferramentas

```javascript
async function handleToolCall(params) {
  const { name, arguments: args } = params;
  
  switch (name) {
    case 'sendTextMessage':
      return await sendTextMessage(args);
      
    case 'sendTemplateMessage':
      return await sendTemplateMessage(args);
      
    case 'sendImageMessage':
      return await sendImageMessage(args);
      
    case 'markMessageAsRead':
      return await markMessageAsRead(args);
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function sendTextMessage({ to, message }) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v${process.env.WHATSAPP_API_VERSION || '18.0'}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      jsonrpc: "2.0",
      id: 1,
      result: {
        content: [
          {
            type: "text",
            text: `Message sent successfully to ${to}. Message ID: ${response.data.messages[0].id}`
          }
        ]
      }
    };
  } catch (error) {
    throw new Error(`Failed to send message: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function sendTemplateMessage({ to, templateName, language, components = [] }) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v${process.env.WHATSAPP_API_VERSION || '18.0'}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: language
          },
          components: components
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      jsonrpc: "2.0",
      id: 1,
      result: {
        content: [
          {
            type: "text",
            text: `Template message sent successfully to ${to}. Message ID: ${response.data.messages[0].id}`
          }
        ]
      }
    };
  } catch (error) {
    throw new Error(`Failed to send template message: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function sendImageMessage({ to, imageUrl, caption }) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v${process.env.WHATSAPP_API_VERSION || '18.0'}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "image",
        image: {
          link: imageUrl,
          caption: caption
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      jsonrpc: "2.0",
      id: 1,
      result: {
        content: [
          {
            type: "text",
            text: `Image message sent successfully to ${to}. Message ID: ${response.data.messages[0].id}`
          }
        ]
      }
    };
  } catch (error) {
    throw new Error(`Failed to send image message: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function markMessageAsRead({ messageId }) {
  try {
    await axios.post(
      `https://graph.facebook.com/v${process.env.WHATSAPP_API_VERSION || '18.0'}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      jsonrpc: "2.0",
      id: 1,
      result: {
        content: [
          {
            type: "text",
            text: `Message ${messageId} marked as read successfully`
          }
        ]
      }
    };
  } catch (error) {
    throw new Error(`Failed to mark message as read: ${error.response?.data?.error?.message || error.message}`);
  }
}
```

## 🐳 Dockerfile

```dockerfile
# Use uma imagem base oficial do Node.js
FROM node:20-alpine

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
```

## 🐙 Docker Compose

```yaml
version: '3.8'
services:
  whatsapp-mcp:
    build: .
    restart: unless-stopped
    ports:
      - "45679:45679"
    environment:
      - PORT=45679
      - NODE_ENV=production
    env_file:
      - .env
```

## 📝 .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

## 📚 README.md

```markdown
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

## Licença

MIT
```

## 🔧 Instruções de Implementação (instrucoes.md)

```markdown
# Instruções Detalhadas - WhatsApp MCP Server

## Passo a Passo: Deploy do WhatsApp MCP Server no Coolify

### Pré-requisitos

1. **Coolify Self-Hosted**: Uma instância do Coolify funcionando
2. **Conta no GitHub**: Um repositório para armazenar os arquivos
3. **WhatsApp Business API**: Credenciais da API oficial

### Passo 1: Criar a Estrutura do Projeto

1. Crie um novo diretório: `whatsapp-mcp-server`
2. Inicialize o projeto Node.js:
   ```bash
   npm init -y
   ```
3. Instale as dependências:
   ```bash
   npm install express body-parser axios
   npm install --save-dev nodemon
   ```

### Passo 2: Configurar o Servidor

1. Crie o arquivo `server.js` com o código fornecido
2. Configure o `.env.example` com as variáveis necessárias
3. Crie o `.gitignore` para excluir arquivos sensíveis

### Passo 3: Configurar Docker

1. Crie o `Dockerfile` para containerização
2. Configure o `docker-compose.yml` para orquestração
3. Teste localmente:
   ```bash
   docker build -t whatsapp-mcp .
   docker run -p 45679:45679 --env-file .env whatsapp-mcp
   ```

### Passo 4: Deploy no Coolify

1. **Envie para o GitHub**:
   - Crie um repositório no GitHub
   - Adicione todos os arquivos e faça push

2. **Configure no Coolify**:
   - Vá para **Create New Resource**
   - Selecione **"Deploy from a Git Repository"**
   - Conecte sua conta GitHub e selecione o repositório

3. **Configure Variáveis de Ambiente**:
   - `WHATSAPP_API_TOKEN`: Token da API (marcar como secret)
   - `WHATSAPP_PHONE_NUMBER_ID`: ID do número
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`: ID da conta

4. **Faça o Deploy**:
   - Clique em **Deploy**
   - Acompanhe os logs
   - Verifique se o servidor está rodando

### Passo 5: Teste a Integração

1. **Health Check**:
   ```bash
   curl http://localhost:45679/health
   ```

2. **Teste MCP**:
   ```bash
   curl -X POST http://localhost:45679/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/list"
     }'
   ```

3. **Teste Envio de Mensagem**:
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

### Passo 6: Integração com Serena SDR

1. **No Workflow Kestra**:
   - Adicione uma task HTTP Request após a resposta da IA
   - Configure para chamar o endpoint `/mcp`
   - Use o payload MCP para enviar mensagens

2. **Exemplo de Integração**:
   ```yaml
   - id: send_whatsapp_response
     type: io.kestra.plugin.http.Request
     uri: http://localhost:45679/mcp
     method: POST
     headers:
       Content-Type: application/json
     body: |
       {
         "jsonrpc": "2.0",
         "id": 1,
         "method": "tools/call",
         "params": {
           "name": "sendTextMessage",
           "arguments": {
             "to": "{{ inputs.phone_number }}",
             "message": "{{ outputs.ai_response }}"
           }
         }
       }
   ```

### Troubleshooting

1. **Erro de Token**: Verifique se o `WHATSAPP_API_TOKEN` está correto
2. **Erro de Phone Number ID**: Confirme se o ID está correto
3. **Rate Limiting**: Aguarde entre as requisições
4. **Templates**: Certifique-se de que os templates estão aprovados

### Monitoramento

1. **Logs**: Monitore os logs do Coolify
2. **Health Check**: Configure alertas para o endpoint `/health`
3. **Métricas**: Acompanhe o uso da API WhatsApp
4. **Erros**: Configure alertas para erros de envio

Com essas instruções, você terá um WhatsApp MCP Server funcional e integrado ao projeto Serena SDR.
```

## 🎯 Resumo das Etapas para IA de Codificação

1. **Criar estrutura de diretórios** conforme especificado
2. **Implementar server.js** com todos os endpoints e handlers
3. **Configurar package.json** com dependências corretas
4. **Criar Dockerfile** para containerização
5. **Configurar docker-compose.yml** para deploy
6. **Implementar .env.example** com todas as variáveis
7. **Criar .gitignore** para segurança
8. **Documentar README.md** com instruções completas
9. **Criar instrucoes.md** com passo a passo detalhado
10. **Testar integração** com endpoints de exemplo

Este guia fornece tudo necessário para que a IA de codificação crie um WhatsApp MCP Server funcional e compatível com o projeto Serena SDR. 