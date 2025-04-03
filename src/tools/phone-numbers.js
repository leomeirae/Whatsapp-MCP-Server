import { z } from 'zod';
    import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const phoneNumberTools = {
      // Get phone numbers
      getPhoneNumbers: {
        schema: {},
        handler: async () => {
          try {
            const result = await callWhatsAppApi('get', `/${config.businessAccountId}/phone_numbers`);
            
            const phoneList = result.data.map(phone => {
              return `- ${phone.display_phone_number} (ID: ${phone.id}): ${phone.status}`;
            }).join('\n');
            
            return {
              content: [{ 
                type: "text", 
                text: `Phone Numbers:\n${phoneList}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Get a list of phone numbers for the business account"
      },
      
      // Get phone number by ID
      getPhoneNumberById: {
        schema: {
          phoneNumberId: z.string().describe("ID of the phone number to retrieve")
        },
        handler: async ({ phoneNumberId }) => {
          try {
            const result = await callWhatsAppApi('get', `/${phoneNumberId}`);
            
            let phoneText = "Phone Number Details:\n";
            for (const [key, value] of Object.entries(result)) {
              if (typeof value !== 'object') {
                phoneText += `${key}: ${value}\n`;
              }
            }
            
            return {
              content: [{ type: "text", text: phoneText }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Get details for a specific phone number by ID"
      },
      
      // Request verification code
      requestVerificationCode: {
        schema: {
          codeMethod: z.enum(["SMS", "VOICE"]).describe("Method to receive verification code"),
          language: z.string().default("en_US").describe("Language for the verification message")
        },
        handler: async ({ codeMethod, language }) => {
          const data = {
            code_method: codeMethod,
            language
          };
          
          try {
            await callWhatsAppApi('post', `/${config.phoneNumberId}/request_code`, data);
            return {
              content: [{ 
                type: "text", 
                text: `Verification code requested successfully via ${codeMethod}.` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Request a verification code for a phone number"
      },
      
      // Verify code
      verifyCode: {
        schema: {
          code: z.string().describe("Verification code received")
        },
        handler: async ({ code }) => {
          const data = {
            code
          };
          
          try {
            await callWhatsAppApi('post', `/${config.phoneNumberId}/verify_code`, data);
            return {
              content: [{ 
                type: "text", 
                text: "Phone number verified successfully." 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Verify a phone number with a received code"
      }
    };
