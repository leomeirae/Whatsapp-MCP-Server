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
2. Configure o `env.example` com as variáveis necessárias
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

## Estrutura Final do Projeto

```
whatsapp-mcp-server/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
├── env.example
├── .gitignore
├── README.md
├── instrucoes.md
└── whatsapp-mcp-server-implementation-guide.md
```

## Funcionalidades Implementadas

### Endpoints HTTP
- `GET /health` - Health check do servidor
- `GET /status` - Status detalhado do servidor
- `GET /` - Informações gerais
- `POST /mcp` - Endpoint principal MCP
- `GET /test` - Endpoint de teste

### Ferramentas MCP
- `sendTextMessage` - Envio de mensagens de texto
- `sendTemplateMessage` - Envio de templates estruturados
- `sendImageMessage` - Envio de imagens com legenda
- `markMessageAsRead` - Confirmação de leitura

### Integração WhatsApp
- API oficial com autenticação Bearer
- Suporte a templates estruturados
- Tratamento robusto de erros
- Logging detalhado de todas as operações

## Configuração de Segurança

### Variáveis de Ambiente
- `WHATSAPP_API_TOKEN`: Token de acesso da API (OBRIGATÓRIO)
- `WHATSAPP_PHONE_NUMBER_ID`: ID do número de telefone (OBRIGATÓRIO)
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: ID da conta de negócio (OBRIGATÓRIO)
- `WHATSAPP_API_VERSION`: Versão da API (padrão: v18.0)
- `PORT`: Porta do servidor (padrão: 45679)
- `NODE_ENV`: Ambiente de execução (padrão: production)

### Boas Práticas
1. **Nunca exponha o API Token** em logs ou código
2. **Use variáveis de ambiente** para todas as credenciais
3. **Configure rate limiting** para respeitar os limites da API
4. **Monitore os logs** regularmente
5. **Teste em ambiente de desenvolvimento** antes de produção

## Deploy no Coolify

### Configuração do Repositório
1. **Crie um repositório** no GitHub
2. **Adicione todos os arquivos** do projeto
3. **Configure o .gitignore** para excluir arquivos sensíveis
4. **Faça push** para o repositório

### Configuração no Coolify
1. **Acesse o dashboard** do Coolify
2. **Crie um novo recurso** do tipo "Deploy from Git Repository"
3. **Conecte sua conta GitHub** e selecione o repositório
4. **Configure as variáveis de ambiente** necessárias
5. **Faça o deploy** e acompanhe os logs

### Verificação do Deploy
1. **Acesse o endpoint `/health`** para verificar se está funcionando
2. **Teste o endpoint `/mcp`** com uma requisição de listagem de ferramentas
3. **Verifique os logs** para identificar possíveis erros
4. **Configure alertas** para monitoramento contínuo

Com essas instruções, você terá um WhatsApp MCP Server funcional e integrado ao projeto Serena SDR. 