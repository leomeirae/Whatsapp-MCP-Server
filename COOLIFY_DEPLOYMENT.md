# Coolify Deployment Guide for WhatsApp MCP Server

## Overview
This guide helps resolve common deployment issues when mounting the WhatsApp MCP Server repository in Coolify.

## Prerequisites
- Coolify instance running
- WhatsApp Business API credentials
- Git repository access

## Common Issues and Solutions

### 1. Environment Variables Configuration

**Issue**: Missing environment variables causing startup failures
**Solution**: Configure these environment variables in Coolify:

```bash
# Required WhatsApp API Credentials
WHATSAPP_API_TOKEN=your_whatsapp_api_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here

# Server Configuration
PORT=45679
NODE_ENV=production
WHATSAPP_API_VERSION=v18.0

# Optional Webhook Configuration
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### 2. Port Configuration

**Issue**: Port conflicts or incorrect port mapping
**Solution**: 
- Ensure port 45679 is available and properly mapped
- Check that the internal and external ports match in Coolify configuration

### 3. Health Check Failures

**Issue**: Health checks failing causing deployment to be marked as unhealthy
**Solution**: 
- The application includes built-in health checks at `/health` endpoint
- Health check interval: 30s, timeout: 10s, retries: 3
- Start period: 40s to allow for initial startup

### 4. Build Failures

**Issue**: Docker build failing during deployment
**Solution**:
- Ensure all files are properly committed to the repository
- Check that `package.json` and `package-lock.json` are present
- Verify Node.js version compatibility (uses Node.js 20)

## Deployment Steps

### Step 1: Repository Setup
1. Ensure your repository contains all necessary files
2. Verify `.gitignore` excludes `node_modules/` and `.env`
3. Commit all changes

### Step 2: Coolify Configuration
1. Create new application in Coolify
2. Select "Docker Compose" as deployment method
3. Point to your repository
4. Use the `.coolify/docker-compose.yml` file

### Step 3: Environment Variables
1. Add all required environment variables in Coolify dashboard
2. Ensure WhatsApp API credentials are properly set
3. Set `PORT=45679` and `NODE_ENV=production`

### Step 4: Network Configuration
1. Ensure the `coolify-network` exists or create it
2. Verify port 45679 is accessible
3. Configure any necessary firewall rules

### Step 5: Deploy
1. Trigger deployment in Coolify
2. Monitor logs for any errors
3. Verify health check endpoint responds correctly

## Troubleshooting

### Check Application Logs
```bash
# In Coolify dashboard, check application logs for:
- Environment variable errors
- Port binding issues
- WhatsApp API connection problems
- Health check failures
```

### Verify Health Endpoint
```bash
curl http://your-domain:45679/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "port": 45679,
  "env": {
    "hasToken": true,
    "hasPhoneNumberId": true,
    "hasBusinessAccountId": true
  }
}
```

### Common Error Messages

1. **"WHATSAPP_API_TOKEN not set"**
   - Solution: Add `WHATSAPP_API_TOKEN` environment variable in Coolify

2. **"Port already in use"**
   - Solution: Change port mapping or stop conflicting service

3. **"Health check failed"**
   - Solution: Check if application is starting properly, increase start period

4. **"Build failed"**
   - Solution: Check repository structure and Dockerfile syntax

## Monitoring

### Health Check Endpoints
- `/health` - Basic health status
- `/status` - Detailed server status
- `/test` - Simple test endpoint

### Log Monitoring
Monitor these log patterns:
- `WhatsApp MCP HTTP Server running on port 45679`
- `Health check requested`
- Any error messages related to environment variables

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to repository
2. **API Tokens**: Use Coolify's secure environment variable storage
3. **Network Access**: Restrict access to necessary ports only
4. **Logs**: Monitor logs for sensitive information exposure

## Support

If issues persist:
1. Check Coolify documentation
2. Verify WhatsApp Business API credentials
3. Review application logs for specific error messages
4. Ensure all environment variables are properly configured 