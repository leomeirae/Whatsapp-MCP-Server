import { templateResources } from './templates.js';
    import { businessProfileResources } from './business-profile.js';
    import { phoneNumberResources } from './phone-numbers.js';
    import { documentationResources } from './documentation.js';

    // Combine all resources into a single export
    export const whatsappResources = {
      ...templateResources,
      ...businessProfileResources,
      ...phoneNumberResources,
      ...documentationResources
    };
