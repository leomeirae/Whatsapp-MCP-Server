import { messagingTools } from './messaging.js';
    import { mediaTools } from './media.js';
    import { templateTools } from './templates.js';
    import { businessProfileTools } from './business-profile.js';
    import { phoneNumberTools } from './phone-numbers.js';
    import { webhookTools } from './webhooks.js';

    // Combine all tools into a single export
    export const whatsappTools = {
      ...messagingTools,
      ...mediaTools,
      ...templateTools,
      ...businessProfileTools,
      ...phoneNumberTools,
      ...webhookTools
    };
