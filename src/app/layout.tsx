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

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuscAdis - Encuentra las mejores oportunidades',
  description: 'Plataforma premium de avisos clasificados. Conectamos a quienes buscan con quienes ofrecen oportunidades de calidad.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* Google Analytics */}
        <GoogleAnalytics measurementId={ANALYTICS_CONFIG.GOOGLE_ANALYTICS_ID} />
        <PageViewTracker />
        
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
      </body>
    </html>
  );
}