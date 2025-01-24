import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import Navigation from '@/components/layout/Navigation'
import MobileNavigation from '@/components/layout/MobileNavigation'
import { Loader } from '@/components/ui/Loader'
import Footer from '@/components/layout/Footer'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'BuscAdis - Encuentra las mejores oportunidades',
  description: 'Plataforma premium de avisos clasificados. Conectamos a quienes buscan con quienes ofrecen oportunidades de calidad.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Suspense fallback={<Loader />}>
              <Navigation />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <MobileNavigation />
            </Suspense>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
