import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const businessProfileResources = {
      // Business profile resource
      businessProfile: {
        template: "whatsapp://business-profile",
        handler: async (uri) => {
          try {
            const result = await callWhatsAppApi('get', `/${config.phoneNumberId}/whatsapp_business_profile`);
            
            const profileData = result.data[0];
            let profileText = "# WhatsApp Business Profile\n\n";
            
            for (const [key, value] of Object.entries(profileData)) {
              if (key !== 'id') {
                if (Array.isArray(value)) {
                  profileText += `## ${key}\n`;
                  value.forEach(item => {
                    profileText += `- ${item}\n`;
                  });
                  profileText += "\n";
                } else if (key === 'profile_picture_url' && value) {
                  profileText += `## ${key}\n`;
                  profileText += `![Business Profile Picture](${value})\n\n`;
                } else {
                  profileText += `## ${key}\n`;
                  profileText += `${value}\n\n`;
                }
              }
            }
            
            return {
              contents: [{
                uri: uri.href,
                text: profileText
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving business profile: ${error.message}`
              }]
            };
          }
        }
      }
    };
