export const config = {
      apiToken: process.env.WHATSAPP_API_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
      apiUrl: 'https://graph.facebook.com'
    };

    export const validateConfig = () => {
      const missingVars = [];
      
      if (!config.apiToken) missingVars.push('WHATSAPP_API_TOKEN');
      if (!config.phoneNumberId) missingVars.push('WHATSAPP_PHONE_NUMBER_ID');
      if (!config.businessAccountId) missingVars.push('WHATSAPP_BUSINESS_ACCOUNT_ID');
      
      if (missingVars.length > 0) {
        return {
          valid: false,
          message: `Missing required environment variables: ${missingVars.join(', ')}. Please set them in .env file.`
        };
      }
      
      return { valid: true };
    };
