import { z } from 'zod';
    import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const templateTools = {
      // Get message templates
      getMessageTemplates: {
        schema: {
          limit: z.number().optional().describe("Number of templates to retrieve (default: 20)"),
          category: z.enum(["AUTHENTICATION", "MARKETING", "UTILITY"]).optional().describe("Filter by template category")
        },
        handler: async ({ limit = 20, category }) => {
          const params = {
            limit
          };
          
          if (category) {
            params.category = category;
          }
          
          try {
            const result = await callWhatsAppApi('get', `/${config.businessAccountId}/message_templates`, params);
            
            const templateList = result.data.map(template => {
              return `- ${template.name} (${template.category}): ${template.status}`;
            }).join('\n');
            
            return {
              content: [{ 
                type: "text", 
                text: `Message Templates:\n${templateList}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Get a list of message templates for the business account"
      },
      
      // Create message template
      createMessageTemplate: {
        schema: {
          name: z.string().describe("Name of the template"),
          category: z.enum(["AUTHENTICATION", "MARKETING", "UTILITY"]).describe("Template category"),
          language: z.string().describe("Language code (e.g., en_US)"),
          components: z.array(
            z.object({
              type: z.enum(["HEADER", "BODY", "FOOTER", "BUTTONS"]),
              text: z.string().optional(),
              format: z.enum(["TEXT", "IMAGE", "VIDEO", "DOCUMENT", "LOCATION"]).optional(),
              buttons: z.array(
                z.object({
                  type: z.enum(["PHONE_NUMBER", "URL", "QUICK_REPLY"]),
                  text: z.string(),
                  phone_number: z.string().optional(),
                  url: z.string().optional()
                })
              ).optional()
            })
          ).describe("Template components")
        },
        handler: async ({ name, category, language, components }) => {
          const data = {
            name,
            category,
            language,
            components
          };
          
          try {
            const result = await callWhatsAppApi('post', `/${config.businessAccountId}/message_templates`, data);
            return {
              content: [{ 
                type: "text", 
                text: `Template created successfully. Template ID: ${result.id}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Create a new message template"
      }
    };
