import Clarity from '@microsoft/clarity';

// Type definitions for better TypeScript support
export interface ClarityIdentifyParams {
  customId: string;
  customSessionId?: string;
  customPageId?: string;
  friendlyName?: string;
}

export interface ClarityTagParams {
  key: string;
  value: string | string[];
}

// Wrapper functions with error handling
export const clarityUtils = {
  // Identify API
  identify: (params: ClarityIdentifyParams) => {
    try {
      const { customId, customSessionId, customPageId, friendlyName } = params;
      Clarity.identify(customId, customSessionId, customPageId, friendlyName);
    } catch (error) {
      console.error('Clarity identify error:', error);
    }
  },

  // Custom tags API
  setTag: (params: ClarityTagParams) => {
    try {
      const { key, value } = params;
      Clarity.setTag(key, value);
    } catch (error) {
      console.error('Clarity setTag error:', error);
    }
  },

  // Custom events API
  event: (eventName: string) => {
    try {
      Clarity.event(eventName);
    } catch (error) {
      console.error('Clarity event error:', error);
    }
  },

  // Cookie consent API
  consent: (consent: boolean = true) => {
    try {
      Clarity.consent(consent);
    } catch (error) {
      console.error('Clarity consent error:', error);
    }
  },

  // Upgrade session API
  upgrade: (reason: string) => {
    try {
      Clarity.upgrade(reason);
    } catch (error) {
      console.error('Clarity upgrade error:', error);
    }
  },
};

// Export the original Clarity object for direct access if needed
export { Clarity };
