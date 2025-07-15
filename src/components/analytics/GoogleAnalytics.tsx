'use client';

import Script from 'next/script';
import { ANALYTICS_CONFIG } from '@/config/analytics';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
            debug_mode: ${ANALYTICS_CONFIG.GA4_CONFIG.debug_mode},
            anonymize_ip: ${ANALYTICS_CONFIG.GA4_CONFIG.anonymize_ip},
            cookie_flags: '${ANALYTICS_CONFIG.GA4_CONFIG.cookie_flags}',
          });
        `}
      </Script>
    </>
  );
} 