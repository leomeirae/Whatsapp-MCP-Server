import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const phoneNumberResources = {
      // Phone numbers resource
      phoneNumbers: {
        template: "whatsapp://phone-numbers",
        handler: async (uri) => {
          try {
            const result = await callWhatsAppApi('get', `/${config.businessAccountId}/phone_numbers`);
            
            let phoneText = "# WhatsApp Phone Numbers\n\n";
            
            if (result.data.length === 0) {
              phoneText += "No phone numbers found.\n";
            } else {
              result.data.forEach(phone => {
                phoneText += `## ${phone.display_phone_number}\n\n`;
                phoneText += `- ID: ${phone.id}\n`;
                phoneText += `- Status: ${phone.status}\n`;
                phoneText += `- Quality Rating: ${phone.quality_rating || 'N/A'}\n`;
                phoneText += `- Name: ${phone.name || 'N/A'}\n`;
                phoneText += `- Verified: ${phone.verified_name || 'N/A'}\n\n`;
                
                if (phone.code_verification_status) {
                  phoneText += `- Verification Status: ${phone.code_verification_status}\n\n`;
                }
                
                phoneText += "---\n\n";
              });
            }
            
            return {
              contents: [{
                uri: uri.href,
                text: phoneText
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving phone numbers: ${error.message}`
              }]
            };
          }
        }
      },
      
      // Phone number details resource
      phoneNumberDetails: {
        template: "whatsapp://phone-number/{id}",
        handler: async (uri, { id }) => {
          try {
            const result = await callWhatsAppApi('get', `/${id}`);
            
            let phoneText = `# Phone Number: ${result.display_phone_number}\n\n`;
            
            for (const [key, value] of Object.entries(result)) {
              if (typeof value !== 'object') {
                phoneText += `## ${key}\n`;
                phoneText += `${value}\n\n`;
              }
            }
            
            return {
              contents: [{
                uri: uri.href,
                text: phoneText
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving phone number details: ${error.message}`
              }]
            };
          }
        }
      }
    };
