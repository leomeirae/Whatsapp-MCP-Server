import { z } from 'zod';
    import { callWhatsAppApi } from '../api.js';
    import { config } from '../config.js';

    export const mediaTools = {
      // Upload media
      uploadMedia: {
        schema: {
          mediaUrl: z.string().url().describe("URL of the media to upload"),
          mediaType: z.enum(["image", "document", "audio", "video", "sticker"]).describe("Type of media")
        },
        handler: async ({ mediaUrl, mediaType }) => {
          const data = {
            messaging_product: "whatsapp",
            url: mediaUrl,
            type: mediaType
          };
          
          try {
            const result = await callWhatsAppApi('post', `/${config.phoneNumberId}/media`, data);
            return {
              content: [{ 
                type: "text", 
                text: `Media uploaded successfully. Media ID: ${result.id}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Upload media to WhatsApp servers"
      },
      
      // Get media URL
      getMediaUrl: {
        schema: {
          mediaId: z.string().describe("ID of the media to retrieve")
        },
        handler: async ({ mediaId }) => {
          try {
            const result = await callWhatsAppApi('get', `/${mediaId}`);
            return {
              content: [{ 
                type: "text", 
                text: `Media URL: ${result.url}
Media type: ${result.mime_type}
File size: ${result.file_size} bytes` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Get the URL for a media file by ID"
      },
      
      // Delete media
      deleteMedia: {
        schema: {
          mediaId: z.string().describe("ID of the media to delete")
        },
        handler: async ({ mediaId }) => {
          try {
            await callWhatsAppApi('delete', `/${mediaId}`);
            return {
              content: [{ 
                type: "text", 
                text: `Media ${mediaId} deleted successfully.` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: error.message }],
              isError: true
            };
          }
        },
        description: "Delete media from WhatsApp servers"
      }
    };
