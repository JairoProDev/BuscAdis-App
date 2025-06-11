// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider'; // Asegúrate de que la ruta sea correcta
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
import ConditionalSearchBar from '@/components/search/ConditionalSearchBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuscAdis - Encuentra las mejores oportunidades',
  description: 'Plataforma premium de avisos clasificados. Conectamos a quienes buscan con quienes ofrecen oportunidades de calidad.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SearchProvider>
            <PublicationProvider>
              <div className="flex min-h-screen flex-col bg-background text-foreground">
                <Suspense fallback={<Loader />}>
                  <Header />
                  <ConditionalSearchBar />
                  <main className="flex-grow">{children}</main>
                  <Footer />
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