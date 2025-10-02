// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import Header from '@/components/layout/Header';
import MobileNavigation from '@/components/layout/MobileNavigation';
import { Loader } from '@/components/ui/Loader';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { PublicationProvider } from '@/contexts/PublicationContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { ANALYTICS_CONFIG } from '@/config/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
// import { Providers } from '@/components/providers/Providers';
// import { Analytics } from '@/components/analytics/Analytics';

// gtag interface is declared in useGoogleAnalytics.ts

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuscAdis - Encuentra las mejores oportunidades',
  description: 'Plataforma premium de avisos clasificados. Conectamos a quienes buscan con quienes ofrecen oportunidades de calidad.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#14b8a6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BuscAdis" />
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/icon-16x16.png" />
        <link rel="mask-icon" href="/images/safari-pinned-tab.svg" color="#14b8a6" />
        <meta name="msapplication-TileColor" content="#14b8a6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/images/placeholder-buscadis.jpg" as="image" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//randomuser.me" />
        
        {/* Service Worker registration script - TEMPORARILY DISABLED */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        /> */}
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Google Analytics - TEMPORARILY DISABLED */}
        {/* <GoogleAnalytics measurementId={ANALYTICS_CONFIG.GOOGLE_ANALYTICS_ID} />
        <PageViewTracker /> */}
        
        <ThemeProvider>
          <SearchProvider>
            <PublicationProvider>
              <div className="flex min-h-screen flex-col bg-background text-foreground">
                <Suspense fallback={<Loader />}>
                  <Header />
                  <main className="flex-grow relative">
                    <div className="min-h-full pb-20 md:pb-0">
                      {children}
                    </div>
                  </main>
                  <div className="hidden md:block">
                    <Footer />
                  </div>
                  <MobileNavigation />
                </Suspense>
              </div>
              <Toaster />
            </PublicationProvider>
          </SearchProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}