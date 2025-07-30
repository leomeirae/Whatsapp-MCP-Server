# Coolify-specific Dockerfile for WhatsApp MCP Server
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Set default environment variables
ENV PORT=45679
ENV NODE_ENV=production
ENV WHATSAPP_API_VERSION=v18.0

# Expose port
EXPOSE 45679

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:45679/health || exit 1

# Start the application
CMD ["node", "server.js"] 