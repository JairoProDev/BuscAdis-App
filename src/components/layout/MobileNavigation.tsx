'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeIcon, ArticleIcon, SearchNavIcon, MegaphoneIcon, BotIcon } from '@/components/icons'
import { useLongPress } from '@/hooks/useLongPress'

interface NavItem {
  id: string
  icon: React.ComponentType<any>
  label: string
  path: string
  subOptions?: {
    id: string
    label: string
    path: string
    icon: React.ComponentType<any>
  }[]
}

const navItems: NavItem[] = [
  {
    id: 'home',
    icon: HomeIcon,
    label: 'Inicio',
    path: '/',
    subOptions: [
      { id: 'featured', label: 'Destacados', path: '/destacados', icon: HomeIcon },
      { id: 'recent', label: 'Recientes', path: '/recientes', icon: HomeIcon }
    ]
  },
  {
    id: 'search',
    icon: SearchNavIcon,
    label: 'Buscar',
    path: '/buscar',
    subOptions: [
      { id: 'categories', label: 'Categorías', path: '/categorias', icon: SearchNavIcon },
      { id: 'near', label: 'Cerca de mí', path: '/cerca', icon: SearchNavIcon }
    ]
  },
  {
    id: 'bot',
    icon: BotIcon,
    label: 'Chatbot',
    path: '/chatbot',
    subOptions: [
      { id: 'assistant', label: 'Asistente', path: '/chatbot', icon: BotIcon },
      { id: 'help', label: 'Ayuda', path: '/ayuda', icon: BotIcon }
    ]
  },
  {
    id: 'blog',
    icon: ArticleIcon,
    label: 'Blog',
    path: '/blog',
    subOptions: [
      { id: 'news', label: 'Noticias', path: '/blog/noticias', icon: ArticleIcon },
      { id: 'guides', label: 'Guías', path: '/blog/guias', icon: ArticleIcon }
    ]
  },
  {
    id: 'publish',
    icon: MegaphoneIcon,
    label: 'Publicar',
    path: '/publicar',
    subOptions: [
      { id: 'new', label: 'Nuevo Adiso', path: '/publicar/nuevo', icon: MegaphoneIcon },
      { id: 'drafts', label: 'Borradores', path: '/publicar/borradores', icon: MegaphoneIcon }
    ]
  }
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)

  const handleLongPress = (itemId: string) => {
    setActiveSubMenu(activeSubMenu === itemId ? null : itemId)
  }

  const bindLongPress = useLongPress(handleLongPress, {
    threshold: 500,
    captureEvent: true
  })

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-primary-900/95 backdrop-blur-md border-t border-primary-800 md:hidden z-50">
        <div className="flex justify-around items-center h-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                className="relative flex flex-col items-center justify-center w-16 h-16"
                onClick={() => router.push(item.path)}
                {...bindLongPress(item.id)}
              >
                {/* Hexágono de fondo cuando está activo */}
                {isActive && (
                  <motion.div
                    layoutId="activeHex"
                    className="absolute inset-0 m-auto w-14 h-14 -mt-8"
                    initial={false}
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <defs>
                        <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"
                        fill="url(#navGradient)"
                        filter="drop-shadow(0 4px 6px rgba(37, 99, 235, 0.3))"
                        strokeWidth="2"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* Icono y etiqueta */}
                <motion.div
                  className={`relative z-10 flex flex-col items-center ${
                    isActive ? 'text-white' : 'text-primary-400'
                  }`}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -12 : 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                </motion.div>
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Submenú */}
      <AnimatePresence>
        {activeSubMenu && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-16 left-0 right-0 bg-primary-800/95 backdrop-blur-md md:hidden z-40"
          >
            <div className="p-4">
              {navItems
                .find(item => item.id === activeSubMenu)
                ?.subOptions?.map(option => (
                  <motion.button
                    key={option.id}
                    className="flex items-center w-full p-3 rounded-lg text-white hover:bg-primary-700"
                    onClick={() => {
                      router.push(option.path)
                      setActiveSubMenu(null)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <option.icon className="w-5 h-5 mr-3" />
                    {option.label}
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 