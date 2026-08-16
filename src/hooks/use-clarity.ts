'use client';

import { useCallback } from 'react';
import { clarityUtils } from '@/lib/clarity';

export const useClarity = () => {
  // Track page views
  const trackPageView = useCallback((pageName: string) => {
    clarityUtils.event(`page_view_${pageName}`);
  }, []);

  // Track button clicks
  const trackButtonClick = useCallback((buttonName: string, context?: string) => {
    clarityUtils.event(`button_click_${buttonName}`);
    if (context) {
      clarityUtils.setTag({ key: 'button_context', value: context });
    }
  }, []);

  // Track link clicks
  const trackLinkClick = useCallback((linkName: string, url?: string) => {
    clarityUtils.event(`link_click_${linkName}`);
    if (url) {
      clarityUtils.setTag({ key: 'link_url', value: url });
    }
  }, []);

  // Track form interactions
  const trackFormInteraction = useCallback((formName: string, action: 'start' | 'submit' | 'abandon') => {
    clarityUtils.event(`form_${action}_${formName}`);
  }, []);

  // Track section views
  const trackSectionView = useCallback((sectionName: string) => {
    clarityUtils.event(`section_view_${sectionName}`);
  }, []);

  // Track user identification
  const trackUser = useCallback((userId: string, friendlyName?: string) => {
    clarityUtils.identify({
      customId: userId,
      friendlyName,
    });
  }, []);

  // Track custom events
  const trackEvent = useCallback((eventName: string, tags?: Record<string, string | string[]>) => {
    clarityUtils.event(eventName);
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        clarityUtils.setTag({ key, value });
      });
    }
  }, []);

  // Set custom tags
  const setTag = useCallback((key: string, value: string | string[]) => {
    clarityUtils.setTag({ key, value });
  }, []);

  // Upgrade session
  const upgradeSession = useCallback((reason: string) => {
    clarityUtils.upgrade(reason);
  }, []);

  // Set consent
  const setConsent = useCallback((consent: boolean) => {
    clarityUtils.consent(consent);
  }, []);

  return {
    trackPageView,
    trackButtonClick,
    trackLinkClick,
    trackFormInteraction,
    trackSectionView,
    trackUser,
    trackEvent,
    setTag,
    upgradeSession,
    setConsent,
  };
};
