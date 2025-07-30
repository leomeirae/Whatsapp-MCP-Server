import { z } from 'zod';
    import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const webhookTools = {
      // Get webhook info
      getWebhookInfo: {
        schema: {
          appId: z.string().describe("Facebook App ID")
        },
        handler: async ({ appId }) => {
          try {
            const result = await callWhatsAppApi('get', `/${appId}/subscriptions`);
            
            let webhookText = "Webhook Information:\n";
            for (const [key, value] of Object.entries(result)) {
              if (typeof value !== 'object') {
                webhookText += `${key}: ${value}\n`;
              } else if (Array.isArray(value)) {
                webhookText += `${key}: ${JSON.stringify(value)}\n`;
              }
            }
            
            return {
              content: [{ type: "text", text: webhookText }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Get information about configured webhooks"
      },
      
      // Subscribe to webhook
      subscribeWebhook: {
        schema: {
          appId: z.string().describe("Facebook App ID"),
          callbackUrl: z.string().url().describe("Webhook callback URL"),
          verifyToken: z.string().describe("Verification token for the webhook")
        },
        handler: async ({ appId, callbackUrl, verifyToken }) => {
          const data = {
            object: "whatsapp_business_account",
            callback_url: callbackUrl,
            verify_token: verifyToken,
            fields: [
              "messages",
              "message_status",
              "message_template_status"
            ]
          };
          
          try {
            await callWhatsAppApi('post', `/${appId}/subscriptions`, data);
            return {
              content: [{ 
                type: "text", 
                text: "Webhook subscription created successfully." 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Subscribe to webhook notifications"
      },
      
      // Delete webhook subscription
      deleteWebhookSubscription: {
        schema: {
          appId: z.string().describe("Facebook App ID")
        },
        handler: async ({ appId }) => {
          try {
            await callWhatsAppApi('delete', `/${appId}/subscriptions`);
            return {
              content: [{ 
                type: "text", 
                text: "Webhook subscription deleted successfully." 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Delete a webhook subscription"
      }
    };
