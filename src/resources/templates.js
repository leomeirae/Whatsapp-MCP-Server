import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const templateResources = {
      // Templates resource
      templates: {
        template: "whatsapp://templates/{category}",
        list: {
          template: "whatsapp://templates",
          uriBuilder: () => ["whatsapp://templates/AUTHENTICATION", "whatsapp://templates/MARKETING", "whatsapp://templates/UTILITY"]
        },
        handler: async (uri, { category }) => {
          try {
            const params = {
              limit: 50
            };
            
            if (category && category !== "ALL") {
              params.category = category;
            }
            
            const result = await callWhatsAppApi('get', `/${config.businessAccountId}/message_templates`, params);
            
            let templateText = `# WhatsApp Message Templates${category ? ` - ${category}` : ''}\n\n`;
            
            if (result.data.length === 0) {
              templateText += "No templates found.\n";
            } else {
              result.data.forEach(template => {
                templateText += `## ${template.name}\n`;
                templateText += `- Category: ${template.category}\n`;
                templateText += `- Status: ${template.status}\n`;
                templateText += `- Language: ${template.language}\n\n`;
                
                if (template.components) {
                  templateText += "### Components:\n";
                  template.components.forEach(component => {
                    templateText += `- Type: ${component.type}\n`;
                    if (component.text) {
                      templateText += `  Text: ${component.text}\n`;
                    }
                    if (component.format) {
                      templateText += `  Format: ${component.format}\n`;
                    }
                    if (component.buttons && component.buttons.length > 0) {
                      templateText += "  Buttons:\n";
                      component.buttons.forEach(button => {
                        templateText += `    - ${button.type}: ${button.text}\n`;
                      });
                    }
                    templateText += "\n";
                  });
                }
                
                templateText += "---\n\n";
              });
            }
            
            return {
              contents: [{
                uri: uri.href,
                text: templateText
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving templates: ${error.message}`
              }]
            };
          }
        }
      },
      
      // Template details resource
      templateDetails: {
        template: "whatsapp://template/{name}",
        handler: async (uri, { name }) => {
          try {
            const result = await callWhatsAppApi('get', `/${config.businessAccountId}/message_templates`, { 
              name: name 
            });
            
            if (result.data.length === 0) {
              return {
                contents: [{
                  uri: uri.href,
                  text: `Template '${name}' not found.`
                }]
              };
            }
            
            const template = result.data[0];
            let templateText = `# Template: ${template.name}\n\n`;
            templateText += `- Category: ${template.category}\n`;
            templateText += `- Status: ${template.status}\n`;
            templateText += `- Language: ${template.language}\n\n`;
            
            if (template.components) {
              templateText += "## Components:\n\n";
              template.components.forEach(component => {
                templateText += `### ${component.type}\n`;
                if (component.text) {
                  templateText += `Text: ${component.text}\n\n`;
                }
                if (component.format) {
                  templateText += `Format: ${component.format}\n\n`;
                }
                if (component.buttons && component.buttons.length > 0) {
                  templateText += "Buttons:\n";
                  component.buttons.forEach(button => {
                    templateText += `- ${button.type}: ${button.text}\n`;
                    if (button.url) {
                      templateText += `  URL: ${button.url}\n`;
                    }
                    if (button.phone_number) {
                      templateText += `  Phone: ${button.phone_number}\n`;
                    }
                  });
                  templateText += "\n";
                }
              });
            }
            
            return {
              contents: [{
                uri: uri.href,
                text: templateText
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving template details: ${error.message}`
              }]
            };
          }
        }
      }
    };
