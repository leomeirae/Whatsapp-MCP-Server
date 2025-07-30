#!/bin/bash

# Script de Teste Local para WhatsApp MCP Server
# Use este script para testar o servidor localmente

set -e

# Colors para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}WhatsApp MCP Server - Teste Local${NC}"
echo "======================================"

# Verificar se o servidor está rodando
check_server() {
    echo -e "${YELLOW}Verificando se o servidor está rodando...${NC}"
    
    if curl -s http://localhost:45679/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Servidor está rodando!${NC}"
        return 0
    else
        echo -e "${RED}❌ Servidor não está rodando${NC}"
        echo -e "${YELLOW}Inicie o servidor com: npm start${NC}"
        return 1
    fi
}

# Testar endpoints básicos
test_basic_endpoints() {
    echo -e "\n${YELLOW}Testando endpoints básicos...${NC}"
    
    # Teste root
    echo -n "Testando / ... "
    if curl -s http://localhost:45679/ | grep -q "WhatsApp MCP HTTP Server"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Teste health
    echo -n "Testando /health ... "
    if curl -s http://localhost:45679/health | grep -q "healthy"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Teste status
    echo -n "Testando /status ... "
    if curl -s http://localhost:45679/status | grep -q "running"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
    
    # Teste test
    echo -n "Testando /test ... "
    if curl -s http://localhost:45679/test | grep -q "success"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
}

# Testar MCP endpoint
test_mcp_endpoint() {
    echo -e "\n${YELLOW}Testando endpoint MCP...${NC}"
    
    # Teste listar ferramentas
    echo -n "Testando tools/list ... "
    response=$(curl -s -X POST http://localhost:45679/mcp \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}')
    
    if echo "$response" | grep -q "sendTextMessage"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
        echo "Resposta: $response"
    fi
}

# Testar envio de mensagem (se credenciais estiverem configuradas)
test_send_message() {
    echo -e "\n${YELLOW}Testando envio de mensagem...${NC}"
    
    # Verificar se as credenciais estão configuradas
    health_response=$(curl -s http://localhost:45679/health)
    
    if echo "$health_response" | grep -q '"hasToken":true'; then
        echo -e "${GREEN}✅ Credenciais configuradas${NC}"
        
        read -p "Digite o número de telefone para teste (ex: 5581997498268): " phone_number
        
        if [ -n "$phone_number" ]; then
            echo -n "Enviando mensagem de teste... "
            
            response=$(curl -s -X POST http://localhost:45679/mcp \
                -H "Content-Type: application/json" \
                -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"sendTextMessage\",\"arguments\":{\"to\":\"$phone_number\",\"message\":\"Teste local do WhatsApp MCP Server! 🚀\"}}}")
            
            if echo "$response" | grep -q "Message sent successfully"; then
                echo -e "${GREEN}✅ Mensagem enviada com sucesso!${NC}"
            else
                echo -e "${RED}❌ Erro ao enviar mensagem${NC}"
                echo "Resposta: $response"
            fi
        else
            echo -e "${YELLOW}⚠️ Número não fornecido, pulando teste de envio${NC}"
        fi
    else
        echo -e "${RED}❌ Credenciais não configuradas${NC}"
        echo -e "${YELLOW}Configure suas credenciais no arquivo .env${NC}"
    fi
}

# Função principal
main() {
    if check_server; then
        test_basic_endpoints
        test_mcp_endpoint
        test_send_message
        
        echo -e "\n${GREEN}🎉 Testes concluídos!${NC}"
    else
        echo -e "\n${RED}❌ Não foi possível executar os testes${NC}"
        exit 1
    fi
}

# Executar função principal
main 