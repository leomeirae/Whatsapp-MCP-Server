# WhatsApp Business API MCP Server

    A comprehensive Model Context Protocol (MCP) server for interacting with the WhatsApp Business API.

    ## Features

    - Send various types of messages (text, template, media, interactive)
    - Manage message templates
    - Upload and manage media files
    - Update business profile information
    - Manage phone numbers
    - Configure webhooks

    ## Prerequisites

    - Node.js 16 or higher
    - WhatsApp Business API credentials:
      - API Token
      - Phone Number ID
      - Business Account ID

    ## Installation

    ```bash
    npm install whatsapp-business-mcp-server
    ```

    Or run directly with npx:

    ```bash
    npx whatsapp-business-mcp-server
    ```

    ## Configuration

    Create a `.env` file with your WhatsApp Business API credentials:

    ```
    WHATSAPP_API_TOKEN=your_api_token_here
    WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
    WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
    WHATSAPP_API_VERSION=v18.0
    ```

    ## Usage

    ### Starting the Server

    ```bash
    npm start
    ```

    ### Development Mode

    ```bash
    npm run dev
    ```

    ### Using with MCP Inspector

    ```bash
    npm run inspect
    ```

    ## Available Tools

    ### Messaging

    - `sendTextMessage` - Send a text message
    - `sendTemplateMessage` - Send a template message
    - `sendImageMessage` - Send an image
    - `sendDocumentMessage` - Send a document
    - `sendVideoMessage` - Send a video
    - `sendLocationMessage` - Send a location
    - `sendContactMessage` - Send contact information
    - `sendInteractiveMessage` - Send interactive messages
    - `markMessageAsRead` - Mark a message as read

    ### Media

    - `uploadMedia` - Upload media to WhatsApp servers
    - `getMediaUrl` - Get the URL for a media file
    - `deleteMedia` - Delete media from WhatsApp servers

    ### Templates

    - `getMessageTemplates` - Get message templates
    - `createMessageTemplate` - Create a message template

    ### Business Profile

    - `getBusinessProfile` - Get business profile information
    - `updateBusinessProfile` - Update business profile

    ### Phone Numbers

    - `getPhoneNumbers` - Get phone numbers
    - `getPhoneNumberById` - Get phone number details
    - `requestVerificationCode` - Request verification code
    - `verifyCode` - Verify a phone number

    ### Webhooks

    - `getWebhookInfo` - Get webhook information
    - `subscribeWebhook` - Subscribe to webhooks
    - `deleteWebhookSubscription` - Delete webhook subscription

    ## Available Resources

    - `whatsapp://templates` - List all templates
    - `whatsapp://templates/{category}` - List templates by category
    - `whatsapp://template/{name}` - Get template details
    - `whatsapp://business-profile` - View business profile
    - `whatsapp://phone-numbers` - List phone numbers
    - `whatsapp://phone-number/{id}` - Get phone number details
    - `whatsapp://docs` - API documentation

    ## License

    MIT
