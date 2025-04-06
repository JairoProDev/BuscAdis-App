// layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/ThemeProvider'; // Asegúrate de que la ruta sea correcta
import Navigation from '@/components/layout/Navigation';
import MobileNavigation from '@/components/layout/MobileNavigation';
import { Loader } from '@/components/ui/Loader';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { PublicationProvider } from '@/contexts/PublicationContext';
import { ReactNode } from 'react';
import { ToastProvider } from '@/providers/ToastProvider';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuscAdis - Encuentra las mejores oportunidades',
  description: 'Plataforma premium de avisos clasificados. Conectamos a quienes buscan con quienes ofrecen oportunidades de calidad.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <ThemeProvider>
            <PublicationProvider>
              <div className="flex min-h-screen flex-col bg-background text-foreground">
                <Suspense fallback={<Loader />}>
                  <Navigation />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                  <MobileNavigation />
                </Suspense>
              </div>
              <Toaster />
            </PublicationProvider>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}