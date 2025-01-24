'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { HomeIcon, ArticleIcon, SearchNavIcon, MegaphoneIcon, BotIcon } from '@/components/icons'
import { useLongPress } from '@/hooks/useLongPress'

const navItems = [
  {
    id: 'home',
    icon: HomeIcon,
    label: 'Inicio',
    path: '/',
    gradient: 'from-primary-500 via-primary-400 to-primary-600',
    glow: 'rgba(14, 165, 233, 0.5)',
    subOptions: [
      { id: 'featured', label: 'Destacados', path: '/destacados', icon: HomeIcon },
      { id: 'recent', label: 'Recientes', path: '/recientes', icon: HomeIcon }
    ]
  },
  {
    id: 'blog',
    icon: ArticleIcon,
    label: 'Blog',
    path: '/blog',
    gradient: 'from-violet-500 via-violet-400 to-violet-600',
    glow: 'rgba(139, 92, 246, 0.5)',
    subOptions: [
      { id: 'news', label: 'Noticias', path: '/blog/noticias', icon: ArticleIcon },
      { id: 'guides', label: 'Guías', path: '/blog/guias', icon: ArticleIcon }
    ]
  },
  {
    id: 'search',
    icon: SearchNavIcon,
    label: 'Buscar',
    path: '/buscar',
    gradient: 'from-sky-500 via-sky-400 to-sky-600',
    glow: 'rgba(56, 189, 248, 0.5)',
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
    gradient: 'from-emerald-500 via-emerald-400 to-emerald-600',
    glow: 'rgba(16, 185, 129, 0.5)',
    subOptions: [
      { id: 'assistant', label: 'Asistente', path: '/chatbot', icon: BotIcon },
      { id: 'help', label: 'Ayuda', path: '/ayuda', icon: BotIcon }
    ]
  },
  {
    id: 'publish',
    icon: MegaphoneIcon,
    label: 'Publicar',
    path: '/publicar',
    gradient: 'from-amber-500 via-amber-400 to-amber-600',
    glow: 'rgba(245, 158, 11, 0.5)',
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { scrollY } = useScroll()
  const [lastScrollY, setLastScrollY] = useState(0)

  // Control de visibilidad basado en scroll
  useEffect(() => {
    return scrollY.onChange((latest) => {
      const direction = latest > lastScrollY ? 'down' : 'up'
      if (direction === 'down' && latest > 100) {
        setIsVisible(false)
      } else if (direction === 'up') {
        setIsVisible(true)
      }
      setLastScrollY(latest)
    })
  }, [scrollY, lastScrollY])

  const bindLongPress = useLongPress((id) => {
    setActiveSubMenu(prev => prev === id ? null : id)
  })

  return (
    <>
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 h-16 bg-primary-950/98 backdrop-blur-xl md:hidden z-50"
        initial={false}
        animate={{
          y: isVisible ? 0 : 100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {/* Efecto de profundidad base */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary-900/20 to-primary-950/40" />
        
        <div className="relative container mx-auto px-4 h-full flex items-end justify-around pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            const isHovered = hoveredItem === item.id
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                className="relative flex flex-col items-center justify-end pb-1"
                onClick={() => router.push(item.path)}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                {...bindLongPress(item.id)}
              >
                {/* Hendidura bajo el hexágono activo */}
                {isActive && (
                  <motion.div
                    className="absolute -top-4 w-16 h-8 bg-primary-950"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-primary-900/20" />
                    <div className="absolute -bottom-px left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/20 to-transparent" />
                  </motion.div>
                )}

                {/* Hexágono con efectos */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeHex"
                      className="absolute -top-8 w-16 h-16"
                      initial={{ scale: 0.5, rotate: 180 }}
                      animate={{ 
                        scale: 1,
                        rotate: 0,
                        y: [-2, 2, -2],
                      }}
                      exit={{ scale: 0.5, rotate: -180 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        y: {
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      {/* Efecto de brillo mejorado */}
                      <div 
                        className="absolute inset-0 blur-2xl opacity-40 -z-10 animate-pulse"
                        style={{
                          background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`
                        }}
                      />

                      {/* Hexágono principal */}
                      <div className={`w-full h-full bg-gradient-to-br ${item.gradient} rounded-xl transform rotate-45 shadow-lg`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      </div>

                      {/* Anillo giratorio */}
                      <motion.div
                        className="absolute inset-0 -m-1"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full opacity-50">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={item.glow}
                            strokeWidth="1"
                            strokeDasharray="0.5 8"
                            className="animate-pulse"
                          />
                        </svg>
                      </motion.div>

                      {/* Icono centrado */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white transform -rotate-45" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icono y etiqueta base */}
                <motion.div
                  className={`flex flex-col items-center ${
                    isActive ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 text-primary-200`} />
                  <span className="text-sm font-medium mt-1 text-primary-200">
                    {item.label}
                  </span>
                </motion.div>
              </motion.button>
            )
          })}
        </div>
      </motion.nav>

      {/* Submenú mejorado */}
      <AnimatePresence>
        {activeSubMenu && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-16 left-0 right-0 bg-primary-950/98 backdrop-blur-xl md:hidden z-40 border-t border-primary-800/30"
          >
            <div className="container mx-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {navItems
                  .find(item => item.id === activeSubMenu)
                  ?.subOptions?.map(option => (
                    <motion.button
                      key={option.id}
                      className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                      onClick={() => {
                        router.push(option.path)
                        setActiveSubMenu(null)
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <option.icon className="w-5 h-5 mr-3 text-primary-400" />
                      <span className="text-sm font-medium text-white">{option.label}</span>
                    </motion.button>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 