require('dotenv').config();
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

// Health Check Endpoint
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

// Root Endpoint
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

// Status Endpoint
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

// Test Endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint requested');
  res.json({
    message: 'WhatsApp MCP Server test endpoint',
    timestamp: new Date().toISOString(),
    test: 'success'
  });
});

// MCP Endpoint Principal
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

// Função de Processamento MCP
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

// Handlers de Ferramentas
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`WhatsApp MCP HTTP Server running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`Status: http://0.0.0.0:${PORT}/status`);
  console.log(`MCP endpoint: http://0.0.0.0:${PORT}/mcp`);
}); 