import axios from 'axios';
    import { config, validateConfig } from './config.js';

    // Create axios instance for WhatsApp API
    const whatsappApi = axios.create({
      baseURL: `${config.apiUrl}/${config.apiVersion}`,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Wrapper for API calls with error handling
    export const callWhatsAppApi = async (method, endpoint, data = null) => {
      const configStatus = validateConfig();
      if (!configStatus.valid) {
        throw new Error(configStatus.message);
      }

      try {
        const response = await whatsappApi({
          method,
          url: endpoint,
          data: method !== 'get' ? data : undefined,
          params: method === 'get' ? data : undefined
        });
        
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`WhatsApp API Error: ${errorMessage}`);
      }
    };

    // Helper to format phone numbers
    export const formatPhoneNumber = (phoneNumber) => {
      // Remove any non-digit characters
      const cleaned = phoneNumber.replace(/\D/g, '');
      
      // Ensure it has a country code
      if (!cleaned.startsWith('1') && !cleaned.startsWith('+')) {
        return `+${cleaned}`;
      }
      
      return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    };
