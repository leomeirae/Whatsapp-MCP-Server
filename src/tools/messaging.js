import { z } from 'zod';
    import { callWhatsAppApi, formatPhoneNumber } from '../api.js';
    import { config } from '../config.js';

    export const messagingTools = {
      // Send a text message
      sendTextMessage: {
        schema: {
          to: z.string().describe("Recipient's phone number with country code"),
          message: z.string().describe("Text message to send"),
          previewUrl: z.boolean().optional().describe("Enable URL preview")
        },
        handler: async ({ to, message, previewUrl = false }) => {
          const formattedTo = formatPhoneNumber(to);
          
          const data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedTo,
            type: "text",
            text: {
              body: message,
              preview_url: previewUrl
            }
          };
          
          try {
            const result = await callWhatsAppApi('post', `/${config.phoneNumberId}/messages`, data);
            return {
              content: [{ 
                type: "text", 
                text: `Message sent successfully. Message ID: ${result.messages[0].id}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Send a text message to a WhatsApp user"
      },
      
      // Send a template message
      sendTemplateMessage: {
        schema: {
          to: z.string().describe("Recipient's phone number with country code"),
          templateName: z.string().describe("Name of the template to use"),
          languageCode: z.string().default("en_US").describe("Language code for the template"),
          components: z.array(
            z.object({
              type: z.enum(["header", "body", "button"]),
              parameters: z.array(
                z.object({
                  type: z.enum(["text", "currency", "date_time", "image", "document", "video"]),
                  text: z.string().optional(),
                  currency: z.object({
                    code: z.string(),
                    amount: z.number()
                  }).optional(),
                  date_time: z.object({
                    fallback_value: z.string()
                  }).optional(),
                  image: z.object({
                    link: z.string()
                  }).optional(),
                  document: z.object({
                    link: z.string()
                  }).optional(),
                  video: z.object({
                    link: z.string()
                  }).optional()
                })
              )
            })
          ).optional().describe("Template components with parameters")
        },
        handler: async ({ to, templateName, languageCode, components = [] }) => {
          const formattedTo = formatPhoneNumber(to);
          
          const data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedTo,
            type: "template",
            template: {
              name: templateName,
              language: {
                code: languageCode
              }
            }
          };
          
          if (components.length > 0) {
            data.template.components = components;
          }
          
          try {
            const result = await callWhatsAppApi('post', `/${config.phoneNumberId}/messages`, data);
            return {
              content: [{ 
                type: "text", 
                text: `Template message sent successfully. Message ID: ${result.messages[0].id}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Send a template message to a WhatsApp user"
      },
      
      // Mark a message as read
      markMessageAsRead: {
        schema: {
          messageId: z.string().describe("ID of the message to mark as read")
        },
        handler: async ({ messageId }) => {
          const data = {
            messaging_product: "whatsapp",
            status: "read",
            message_id: messageId
          };
          
          try {
            await callWhatsAppApi('post', `/${config.phoneNumberId}/messages`, data);
            return {
              content: [{ 
                type: "text", 
                text: `Message ${messageId} marked as read successfully.` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Mark a message as read"
      }
    };
