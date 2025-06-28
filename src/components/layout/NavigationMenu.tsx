'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HomeIcon, SearchNavIcon, MegaphoneIcon } from '@/components/icons'
import { NewspaperIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface NavigationMenuProps {
  variant?: 'mobile' | 'desktop'
  onAdisClick?: () => void
  showAdisChat?: boolean
  className?: string
}

const NAV_ITEMS = [
  { id: 'home', icon: HomeIcon, label: 'Inicio', path: '/inicio' },
  { id: 'search', icon: SearchNavIcon, label: 'Buscar', path: '/buscar' },
  { id: 'publish', icon: MegaphoneIcon, label: 'Publicar', path: '/publicar' },
  { id: 'news', icon: NewspaperIcon, label: 'Noticias', path: '/revista' },
  { id: 'adis', icon: SparklesIcon, label: 'ADIS', path: '#adis' },
]

export default function NavigationMenu({ 
  variant = 'mobile', 
  onAdisClick,
  showAdisChat = false,
  className = '' 
}: NavigationMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [touchedItem, setTouchedItem] = useState<string | null>(null)

  const isActiveRoute = (path: string) => {
    if (path === '/buscar') return pathname === '/' || pathname === '/buscar'
    if (path === '#adis') return showAdisChat
    return pathname?.startsWith(path)
  }

  const handleNavigation = (item: typeof NAV_ITEMS[0]) => {
    if (item.path === '#adis' && onAdisClick) {
      onAdisClick()
    } else if (item.path !== '#adis') {
      router.push(item.path)
    }
  }

  if (variant === 'desktop') {
    // Versión Desktop - Horizontal
    const navButtonBaseClasses = "flex flex-col items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
    const navButtonActiveClasses = "text-teal-500 dark:text-teal-400"
    const navButtonInactiveClasses = "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-teal-500 dark:hover:text-teal-400"

    return (
      <nav className={`hidden md:flex flex-1 justify-center space-x-1 lg:space-x-2 ${className}`} role="navigation" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(item.path)
          const Icon = item.icon
          const classes = `${navButtonBaseClasses} ${isActive ? navButtonActiveClasses : navButtonInactiveClasses}`

          if (item.path === '#adis') {
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={classes}
                aria-label={`Abrir chat con ${item.label}`}
                aria-expanded={showAdisChat ? "true" : "false"}
                title={`Chat con ${item.label} IA`}
              >
                <Icon className="w-6 h-6 mb-1 md:mb-0 md:mr-1.5" aria-hidden="true" />
                <span className="text-xs md:text-sm">{item.label}</span>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={classes}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6 mb-1 md:mb-0 md:mr-1.5" aria-hidden="true" />
              <span className="text-xs md:text-sm">{item.label}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  // Versión Mobile - Vertical (Default)
  return (
    <div className={`relative flex items-center justify-around h-full px-2 ${className}`}>
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(item.path)
        const isTouched = touchedItem === item.id
        const Icon = item.icon

        return (
          <div key={item.id} className="relative flex-1 flex justify-center max-w-[80px]">
            <motion.button
              className="relative flex flex-col items-center justify-center w-full h-full"
              onClick={() => handleNavigation(item)}
              onTouchStart={() => setTouchedItem(item.id)}
              onTouchEnd={() => setTouchedItem(null)}
              whileTap={{ scale: 0.95 }}
              animate={{ scale: isTouched ? 1.05 : 1 }}
              aria-label={item.path === '#adis' ? `Abrir chat con ${item.label}` : `Ir a ${item.label}`}
            >
              <motion.div
                className="relative flex flex-col items-center py-2 px-3 rounded-2xl"
                animate={{ y: isActive ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {/* Indicador activo */}
                {isActive && (
                  <motion.div
                    layoutId="activeMobileIndicator"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Fondo activo */}
                {isActive && (
                   <motion.div
                     layoutId="activeMobileBackground"
                     className="absolute inset-0 bg-teal-500/10 dark:bg-teal-400/15 rounded-2xl"
                     transition={{ duration: 0.3 }}
                   />
                )}
                
                {/* Contenido */}
                <div className="relative z-10 mb-1 mt-2">
                  <Icon className={`
                    w-6 h-6 transition-colors duration-300 
                    ${isActive 
                      ? 'text-teal-500 dark:text-teal-400' 
                      : 'text-slate-600 dark:text-slate-400'
                    }
                  `} />
                </div>
                <span className={`
                  relative z-10 text-xs font-semibold transition-colors duration-300 
                  ${isActive 
                    ? 'text-teal-600 dark:text-teal-300' 
                    : 'text-slate-600 dark:text-slate-400'
                  }
                `}>
                  {item.label}
                </span>
              </motion.div>
            </motion.button>
          </div>
        )
      })}
    </div>
  )
} 