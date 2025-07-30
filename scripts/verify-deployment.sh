#!/bin/bash

# WhatsApp MCP Server Deployment Verification Script
# Use this script to verify your deployment is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}WhatsApp MCP Server Deployment Verification${NC}"
echo "=================================================="

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <your-server-url>${NC}"
    echo "Example: $0 http://localhost:45679"
    exit 1
fi

BASE_URL=$1

echo -e "${YELLOW}Testing server at: ${BASE_URL}${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=$3
    
    echo -n "Testing ${description}... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "${BASE_URL}${endpoint}")
    status_code=${response: -3}
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        if [ -s /tmp/response.json ]; then
            echo "  Response: $(cat /tmp/response.json | head -c 100)..."
        fi
    else
        echo -e "${RED}✗ FAIL (Status: $status_code)${NC}"
        if [ -s /tmp/response.json ]; then
            echo "  Error: $(cat /tmp/response.json)"
        fi
    fi
    echo ""
}

# Test basic connectivity
echo -e "${YELLOW}1. Basic Connectivity Tests${NC}"
test_endpoint "/" "Root endpoint" "200"
test_endpoint "/health" "Health check" "200"
test_endpoint "/status" "Status endpoint" "200"
test_endpoint "/test" "Test endpoint" "200"

# Test MCP endpoint (should return 400 for invalid request)
echo -e "${YELLOW}2. MCP Endpoint Test${NC}"
echo -n "Testing MCP endpoint with invalid request... "
response=$(curl -s -w "%{http_code}" -o /tmp/mcp_response.json -X POST -H "Content-Type: application/json" -d '{"invalid": "request"}' "${BASE_URL}/mcp")
status_code=${response: -3}

if [ "$status_code" = "500" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ PASS (Expected error for invalid request)${NC}"
else
    echo -e "${RED}✗ FAIL (Unexpected status: $status_code)${NC}"
fi
echo ""

# Environment check
echo -e "${YELLOW}3. Environment Check${NC}"
health_response=$(curl -s "${BASE_URL}/health")
if echo "$health_response" | grep -q '"hasToken":true'; then
    echo -e "${GREEN}✓ WhatsApp API Token is configured${NC}"
else
    echo -e "${RED}✗ WhatsApp API Token is NOT configured${NC}"
fi

if echo "$health_response" | grep -q '"hasPhoneNumberId":true'; then
    echo -e "${GREEN}✓ Phone Number ID is configured${NC}"
else
    echo -e "${RED}✗ Phone Number ID is NOT configured${NC}"
fi

if echo "$health_response" | grep -q '"hasBusinessAccountId":true'; then
    echo -e "${GREEN}✓ Business Account ID is configured${NC}"
else
    echo -e "${RED}✗ Business Account ID is NOT configured${NC}"
fi
echo ""

# Performance test
echo -e "${YELLOW}4. Performance Test${NC}"
echo -n "Testing response time... "
start_time=$(date +%s%N)
curl -s "${BASE_URL}/health" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))
echo -e "${GREEN}${response_time}ms${NC}"
echo ""

# Summary
echo -e "${YELLOW}Deployment Verification Complete${NC}"
echo "======================================"
echo -e "${GREEN}If all tests passed, your deployment is working correctly!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure your WhatsApp API credentials in Coolify"
echo "2. Test sending messages via the MCP endpoint"
echo "3. Monitor logs for any issues"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "• View logs: docker logs <container-name>"
echo "• Check container status: docker ps"
echo "• Test MCP endpoint: curl -X POST ${BASE_URL}/mcp -H 'Content-Type: application/json' -d '{\"method\":\"tools/list\"}'" 