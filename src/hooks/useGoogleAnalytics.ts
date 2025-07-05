'use client';

import { useCallback } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }, []);

  const trackPageView = useCallback((url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-4N4QVEB03T', {
        page_path: url,
      });
    }
  }, []);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    trackEvent('search', 'engagement', searchTerm, resultsCount);
  }, [trackEvent]);

  const trackPublication = useCallback((category: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    trackEvent(action, 'publication', category);
  }, [trackEvent]);

  const trackUserAction = useCallback((action: string, category: string, label?: string) => {
    trackEvent(action, category, label);
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackSearch,
    trackPublication,
    trackUserAction,
  };
}; 