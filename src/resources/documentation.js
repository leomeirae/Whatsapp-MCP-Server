export const documentationResources = {
      // API documentation resource
      apiDocumentation: {
        template: "whatsapp://docs",
        list: {
          template: "whatsapp://docs",
          uriBuilder: () => [
            "whatsapp://docs/messaging",
            "whatsapp://docs/templates",
            "whatsapp://docs/media",
            "whatsapp://docs/business-profile",
            "whatsapp://docs/phone-numbers",
            "whatsapp://docs/webhooks"
          ]
        },
        handler: async (uri) => {
          const docsText = `# WhatsApp Business API Documentation

## Overview

The WhatsApp Business API allows businesses to communicate with their customers at scale. This MCP server provides tools and resources to interact with the WhatsApp Business API.

## Available Documentation

- [Messaging](whatsapp://docs/messaging) - Send and receive messages
- [Templates](whatsapp://docs/templates) - Create and manage message templates
- [Media](whatsapp://docs/media) - Upload and manage media files
- [Business Profile](whatsapp://docs/business-profile) - Manage your business profile
- [Phone Numbers](whatsapp://docs/phone-numbers) - Manage phone numbers
- [Webhooks](whatsapp://docs/webhooks) - Configure webhooks for notifications

## Getting Started

1. Set up your environment variables in the .env file
2. Use the tools and resources provided by this MCP server to interact with the WhatsApp Business API

## Official Documentation

For more detailed information, visit the [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/api/reference).
`;
          
          return {
            contents: [{
              uri: uri.href,
              text: docsText
            }]
          };
        }
      },
      
      // Messaging documentation
      messagingDocs: {
        template: "whatsapp://docs/messaging",
        handler: async (uri) => {
          const docsText = `# WhatsApp Messaging API

## Overview

The Messaging API allows you to send various types of messages to WhatsApp users.

## Available Message Types

- Text Messages
- Template Messages
- Media Messages (Image, Video, Document, Audio)
- Location Messages
- Contact Messages
- Interactive Messages (Buttons, Lists)

## Tools

- \`sendTextMessage\` - Send a simple text message
- \`sendTemplateMessage\` - Send a message using a template
- \`sendImageMessage\` - Send an image
- \`sendDocumentMessage\` - Send a document
- \`sendVideoMessage\` - Send a video
- \`sendLocationMessage\` - Send a location
- \`sendContactMessage\` - Send contact information
- \`sendInteractiveMessage\` - Send interactive messages with buttons or lists
- \`markMessageAsRead\` - Mark a message as read

## Example: Sending a Text Message

\`\`\`javascript
{
  "to": "+1234567890",
  "message": "Hello from WhatsApp Business API!",
  "previewUrl": true
}
\`\`\`

## Example: Sending a Template Message

\`\`\`javascript
{
  "to": "+1234567890",
  "templateName": "sample_template",
  "languageCode": "en_US",
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "John Doe"
        }
      ]
    }
  ]
}
\`\`\`

For more information, see the [official documentation](https://developers.facebook.com/docs/whatsapp/api/messages).
`;
          
          return {
            contents: [{
              uri: uri.href,
              text: docsText
            }]
          };
        }
      },
      
      // Templates documentation
      templatesDocs: {
        template: "whatsapp://docs/templates",
        handler: async (uri) => {
          const docsText = `# WhatsApp Message Templates

## Overview

Message templates are pre-approved message formats that can be used to send messages to customers outside the 24-hour customer service window.

## Template Categories

- **Authentication**: For sending verification codes or authentication messages
- **Marketing**: For promotional content
- **Utility**: For utility notifications like appointment reminders, order updates, etc.

## Template Components

- **Header**: Optional. Can be text, image, document, or video
- **Body**: Required. The main content of the message
- **Footer**: Optional. Additional information at the bottom of the message
- **Buttons**: Optional. Up to 3 buttons (Call-to-Action, Quick Reply)

## Tools

- \`getMessageTemplates\` - Get a list of message templates
- \`createMessageTemplate\` - Create a new message template

## Resources

- \`whatsapp://templates\` - List all templates by category
- \`whatsapp://templates/{category}\` - List templates by specific category
- \`whatsapp://template/{name}\` - Get details for a specific template

## Example: Creating a Template

\`\`\`javascript
{
  "name": "appointment_reminder",
  "category": "UTILITY",
  "language": "en_US",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Appointment Reminder"
    },
    {
      "type": "BODY",
      "text": "Hello {{1}}, this is a reminder that you have an appointment scheduled for {{2}}."
    },
    {
      "type": "FOOTER",
      "text": "Reply CONFIRM to confirm your appointment"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "QUICK_REPLY",
          "text": "CONFIRM"
        },
        {
          "type": "QUICK_REPLY",
          "text": "RESCHEDULE"
        }
      ]
    }
  ]
}
\`\`\`

For more information, see the [official documentation](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates).
`;
          
          return {
            contents: [{
              uri: uri.href,
              text: docsText
            }]
          };
        }
      },
      
      // Media documentation
      mediaDocs: {
        template: "whatsapp://docs/media",
        handler: async (uri) => {
          const docsText = `# WhatsApp Media API

## Overview

The Media API allows you to upload, retrieve, and delete media files for use in WhatsApp messages.

## Supported Media Types

- Images (JPEG, PNG)
- Documents (PDF, Office documents)
- Audio (AAC, MP3, OGG)
- Video (MP4, 3GPP)
- Stickers (WebP)

## Media Size Limits

- Image: 5MB
- Document: 100MB
- Audio: 16MB
- Video: 16MB
- Sticker: 100KB

## Tools

- \`uploadMedia\` - Upload media to WhatsApp servers
- \`getMediaUrl\` - Get the URL for a media file by ID
- \`deleteMedia\` - Delete media from WhatsApp servers

## Example: Uploading Media

\`\`\`javascript
{
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}
\`\`\`

## Example: Sending a Message with Media

After uploading media, you can use the media ID in a message:

\`\`\`javascript
{
  "to": "+1234567890",
  "type": "image",
  "image": {
    "id": "media-id-from-upload"
  }
}
\`\`\`

For more information, see the [official documentation](https://developers.facebook.com/docs/whatsapp/api/media).
`;
          
          return {
            contents: [{
              uri: uri.href,
              text: docsText
            }]
          };
        }
      },
      
      // Business Profile documentation
      businessProfileDocs: {
        template: "whatsapp://docs/business-profile",
        handler: async (uri) => {
          const docsText = `# WhatsApp Business Profile API

## Overview

The Business Profile API allows you to manage your WhatsApp Business profile information.

## Profile Fields

- **about**: A short description of your business
- **address**: Your business address
- **description**: A longer description of your business
- **email**: Your business email
- **websites**: Your business websites
- **profile_picture_url**: URL of your profile picture
- **vertical**: Your business category

## Tools

- \`getBusinessProfile\` - Get the business profile information
- \`updateBusinessProfile\` - Update the business profile information

## Resources

- \`whatsapp://business-profile\` - View your business profile information

## Example: Updating Business Profile

\`\`\`javascript
{
  "about": "We provide excellent customer service",
  "address": "123 Main St, Anytown, USA",
  "description": "A company dedicated to customer satisfaction",
  "email": "contact@example.com",
  "vertical": "RETAIL",
  "websites": ["https://example.com"]
}
\`\`\`

For more information, see the [official documentation](https://developers.facebook.com/docs/whatsapp/api/settings/business-profile).
`;
          
          return {
            contents: [{
              uri: uri.href,
              text: docsText
            }]
          };
        }
      },
      
      // Phone Numbers documentation
      phoneNumbersDocs: {
        template: "whatsapp://docs/phone-numbers",
        handler: async (uri) => {
          const docsText = `# WhatsApp Phone Numbers API

## Overview

The Phone Numbers API allows you to manage and verify phone numbers associated with your WhatsApp Business account.

## Tools

- \`getPhoneNumbers\` - Get a list of phone numbers for the business account
- \`getPhoneNumberById\` - Get details for a specific phone number by ID
- \`requestVerificationCode\` - Request a verification code for a phone number
- \`verifyCode\` - Verify a phone number with a received code

## Resources

- \`whatsapp://phone-numbers\` - List all phone numbers
- \`whatsapp://phone-number/{id}\` - Get details for a specific phone number

## Example: Requesting a Verification Code

\`\`\`javascript
{
  "codeMethod": "SMS",
  "language": "en_US"
}
\`\`\`

## Example: Verifying a Code

\`\`\`javascript
{
  "code": "123456"
}
\`\`\`

For more information, see the [official documentation](https://developers.facebook.com/docs/whatsapp/api/settings/phone-numbers).
`;
          
          return {
            contents: [{
              uri: uri.href,
              text: docsText
            }]
          };
        }
      },
      
      // Webhooks documentation
      webhooksDocs: {
        template: "whatsapp://docs/webhooks",
        handler: async (uri) => {
          const docsText = `# WhatsApp Webhooks API

## Overview

Webhooks allow you to receive real-time notifications about messages, message status updates, and other events.

## Webhook Events

- **messages**: Incoming messages from customers
- **message_status**: Status updates for sent messages (delivered, read)
- **message_template_status**: Status updates for message templates

## Tools

- \`getWebhookInfo\` - Get information about configured webhooks
- \`subscribeWebhook\` - Subscribe to webhook notifications
- \`deleteWebhookSubscription\` - Delete a webhook subscription

## Example: Subscribing to Webhooks

\`\`\`javascript
{
  "appId": "your-app-id",
  "callbackUrl": "https://example.com/webhook",
  "verifyToken": "your-verify-token"
}
\`\`\`

## Handling Webhook Events

When a webhook event is received, your server should:

1. Verify the request by checking the signature
2. Process the event data
3. Return a 200 OK response

For more information, see the [official documentation](https://developers.facebook.com/docs/whatsapp/api/webhooks).
`;
          
          return {
            contents: [{
              uri: uri.href,
              text: docsText
            }]
          };
        }
      }
    };
