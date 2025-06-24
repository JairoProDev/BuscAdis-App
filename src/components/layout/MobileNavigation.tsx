// src/components/layout/MobileNavigation.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useScroll } from 'framer-motion'
import { HomeIcon, ArticleIcon, SearchNavIcon, MegaphoneIcon, BotIcon } from '@/components/icons'
import { ThemeToggle } from '@/components/theme'

const NAV_ITEMS = [
  { id: 'home', icon: HomeIcon, label: 'Inicio', path: '/inicio' },
  { id: 'search', icon: SearchNavIcon, label: 'Buscar', path: '/buscar' },
  { id: 'publish', icon: MegaphoneIcon, label: 'Publicar', path: '/publicar' },
  { id: 'blog', icon: ArticleIcon, label: 'Noticias', path: '/revista' },
  { id: 'bot', icon: BotIcon, label: 'ADIS', path: '/adis' },
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [touchedItem, setTouchedItem] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { scrollY } = useScroll()
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      const direction = latest > lastScrollY ? 'down' : 'up'
      if (direction === 'down' && latest > 150) { isVisible && setIsVisible(false) } 
      else { !isVisible && setIsVisible(true) }
      setLastScrollY(latest)
    })
  }, [scrollY, lastScrollY, isVisible])
  
  const isActiveRoute = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  return (
    <>


      <motion.nav
        aria-label="Navegación principal en móvil"
        className="fixed bottom-0 left-0 right-0 z-40 h-20 md:hidden"
        initial={false}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-700/60" />
        <div className="relative flex items-center justify-around h-full px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = isActiveRoute(item.path)
            const isTouched = touchedItem === item.id
            const Icon = item.icon

            return (
              <div key={item.id} className="relative flex-1 flex justify-center max-w-[80px]">
                <motion.button
                  className="relative flex flex-col items-center justify-center w-full h-full"
                  onClick={() => router.push(item.path)}
                  onTouchStart={() => setTouchedItem(item.id)}
                  onTouchEnd={() => setTouchedItem(null)}
                  whileTap={{ scale: 0.95 }}
                  animate={{ scale: isTouched ? 1.05 : 1 }}
                >
                  {/* Este es el contenedor clave. Es relativo para posicionar la línea. */}
                  <motion.div
                    className="relative flex flex-col items-center py-2 px-3 rounded-2xl"
                    animate={{ y: isActive ? -2 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {/* SOLUCIÓN ESTRUCTURAL: La línea está DENTRO del mismo contenedor que el ícono, garantizando un centrado perfecto. */}
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileIndicator"
                        className="absolute top-0 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}

                    {/* El fondo también está aquí, como hermano de la línea. */}
                    {isActive && (
                       <motion.div
                         layoutId="activeMobileBackground"
                         className="absolute inset-0 bg-teal-500/10 dark:bg-teal-400/15 rounded-2xl"
                         transition={{ duration: 0.3 }}
                       />
                    )}
                    
                    {/* El contenido está aquí, compartiendo el mismo padre que la línea. */}
                    <div className="relative z-10 mb-1 mt-2">
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-teal-500 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    <span className={`relative z-10 text-xs font-semibold transition-colors duration-300 ${isActive ? 'text-teal-600 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.label}
                    </span>
                  </motion.div>
                </motion.button>
              </div>
            )
          })}
        </div>
      </motion.nav>
      
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  )
}