import { z } from 'zod';
    import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const businessProfileTools = {
      // Get business profile
      getBusinessProfile: {
        schema: {
          fields: z.array(
            z.enum([
              "about", "address", "description", "email", 
              "profile_picture_url", "websites", "vertical"
            ])
          ).optional().describe("Fields to retrieve (default: all)")
        },
        handler: async ({ fields }) => {
          const params = {};
          
          if (fields && fields.length > 0) {
            params.fields = fields.join(',');
          }
          
          try {
            const result = await callWhatsAppApi('get', `/${config.phoneNumberId}/whatsapp_business_profile`, params);
            
            const profileData = result.data[0];
            let profileText = "Business Profile:\n";
            
            for (const [key, value] of Object.entries(profileData)) {
              if (key !== 'id') {
                if (Array.isArray(value)) {
                  profileText += `${key}: ${value.join(', ')}\n`;
                } else {
                  profileText += `${key}: ${value}\n`;
                }
              }
            }
            
            return {
              content: [{ type: "text", text: profileText }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Get the business profile information"
      },
      
      // Update business profile
      updateBusinessProfile: {
        schema: {
          about: z.string().optional().describe("About text"),
          address: z.string().optional().describe("Business address"),
          description: z.string().optional().describe("Business description"),
          email: z.string().email().optional().describe("Business email"),
          vertical: z.enum([
            "UNDEFINED", "OTHER", "AUTO", "BEAUTY", "APPAREL", "EDU", 
            "ENTERTAIN", "EVENT_PLAN", "FINANCE", "GROCERY", "GOVT", 
            "HOTEL", "HEALTH", "NONPROFIT", "PROF_SERVICES", 
            "RETAIL", "TRAVEL", "RESTAURANT", "NOT_A_BIZ"
          ]).optional().describe("Business category"),
          websites: z.array(z.string().url()).optional().describe("Business websites")
        },
        handler: async (profileData) => {
          // Remove undefined fields
          Object.keys(profileData).forEach(key => {
            if (profileData[key] === undefined) {
              delete profileData[key];
            }
          });
          
          if (Object.keys(profileData).length === 0) {
            return {
              content: [{ 
                type: "text", 
                text: "No profile data provided for update." 
              }],
              isError: true
            };
          }
          
          try {
            await callWhatsAppApi('post', `/${config.phoneNumberId}/whatsapp_business_profile`, profileData);
            return {
              content: [{ 
                type: "text", 
                text: "Business profile updated successfully." 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Update the business profile information"
      }
    };
