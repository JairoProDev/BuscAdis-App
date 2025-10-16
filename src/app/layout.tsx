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
// import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
// import PageViewTracker from '@/components/analytics/PageViewTracker';
// import { ANALYTICS_CONFIG } from '@/config/analytics';
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
        <link rel="preload" href="/images/hero-cusco-background.webp" as="image" type="image/webp" />
        
        {/* DNS prefetch and preconnect for external domains */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//randomuser.me" />
        
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* Critical CSS Inline - Eliminates render-blocking */}
        <style dangerouslySetInnerHTML={{__html: `
          /* Critical above-the-fold styles */
          *{box-sizing:border-box;margin:0;padding:0}
          html{line-height:1.15;-webkit-text-size-adjust:100%}
          body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}
          
          /* Hero section critical styles */
          .hero-section{position:relative;text-align:center;color:#fff;overflow:hidden}
          .hero-bg{position:absolute;inset:0;width:100%;height:100%}
          .hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center}
          .hero-overlay{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.45) 50%,rgba(0,0,0,.6) 100%)}
          .hero-content{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:480px;padding:3rem 1rem}
          .hero-title{font-size:clamp(1.5rem,4vw,3.75rem);font-weight:800;margin-bottom:1rem;color:#fff;line-height:1.1;letter-spacing:-.02em;text-shadow:0 4px 20px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.3)}
          .hero-subtitle{font-size:clamp(1.125rem,2.5vw,1.875rem);margin-bottom:2rem;color:rgba(255,255,255,.95);font-weight:500;text-shadow:0 2px 12px rgba(0,0,0,.4)}
          .hero-search{max-width:42rem;margin:0 auto;padding:0 1rem}
          .hero-search-container{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-radius:1rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);padding:.75rem;border:1px solid rgba(255,255,255,.2)}
          
          /* Header critical styles */
          .header{position:relative;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.1)}
          .header-container{display:flex;align-items:center;justify-content:space-between;max-width:80rem;margin:0 auto;padding:0 1rem;height:4rem}
          .header-logo{display:flex;align-items:center;font-size:1.5rem;font-weight:800;color:#0ea5e9;text-decoration:none}
          
          /* Layout critical styles */
          .min-h-screen{min-height:100vh}
          .bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}
          .from-gray-50{--tw-gradient-from:#f9fafb;--tw-gradient-to:rgba(249,250,251,0);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}
          .via-blue-50\/30{--tw-gradient-to:rgba(239,246,255,.3);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}
          .to-purple-50\/30{--tw-gradient-to:rgba(250,245,255,.3)}
          .text-white{color:#fff}
          .relative{position:relative}
          .absolute{position:absolute}
          .inset-0{inset:0}
          .w-full{width:100%}
          .h-full{height:100%}
          .object-cover{object-fit:cover}
          .object-center{object-position:center}
          .overflow-hidden{overflow:hidden}
          .flex{display:flex}
          .flex-col{flex-direction:column}
          .items-center{align-items:center}
          .justify-center{justify-content:center}
          .mx-auto{margin-left:auto;margin-right:auto}
          .max-w-4xl{max-width:56rem}
          .text-center{text-align:center}
          .px-4{padding-left:1rem;padding-right:1rem}
          .py-12{padding-top:3rem;padding-bottom:3rem}
          
          /* Utility classes for immediate rendering */
          .hidden{display:none}
          .block{display:block}
          .inline-flex{display:inline-flex}
          .gap-3{gap:.75rem}
          .gap-4{gap:1rem}
          .space-y-10 > * + *{margin-top:2.5rem}
          .mb-4{margin-bottom:1rem}
          .mb-6{margin-bottom:1.5rem}
          .mb-8{margin-bottom:2rem}
          .mt-8{margin-top:2rem}
          .rounded-2xl{border-radius:1rem}
          .shadow-2xl{box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}
          .border{border-width:1px}
          .border-white\/20{border-color:rgba(255,255,255,.2)}
          
          /* Animation base */
          .transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:150ms}
          .duration-200{transition-duration:200ms}
          .ease-out{transition-timing-function:cubic-bezier(0,0,.2,1)}
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .dark\\:from-gray-900{--tw-gradient-from:#111827}
            .dark\\:via-gray-900{--tw-gradient-to:rgba(17,24,39,0)}
            .dark\\:to-gray-800{--tw-gradient-to:#1f2937}
            .dark\\:bg-gray-900\/95{background-color:rgba(17,24,39,.95)}
          }
          
          /* Responsive breakpoints */
          @media (min-width: 640px) {
            .sm\\:text-3xl{font-size:1.875rem;line-height:2.25rem}
            .sm\\:text-xl{font-size:1.25rem;line-height:1.75rem}
            .sm\\:mb-6{margin-bottom:1.5rem}
            .sm\\:py-16{padding-top:4rem;padding-bottom:4rem}
          }
          @media (min-width: 768px) {
            .md\\:text-4xl{font-size:2.25rem;line-height:2.5rem}
            .md\\:text-2xl{font-size:1.5rem;line-height:2rem}
            .md\\:min-h-\\[560px\\]{min-height:560px}
          }
          @media (min-width: 1024px) {
            .lg\\:text-5xl{font-size:3rem;line-height:1}
            .lg\\:text-3xl{font-size:1.875rem;line-height:2.25rem}
            .lg\\:py-24{padding-top:6rem;padding-bottom:6rem}
          }
          @media (min-width: 1280px) {
            .xl\\:text-6xl{font-size:3.75rem;line-height:1}
          }
        `}} />
        
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