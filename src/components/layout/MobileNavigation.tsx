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
    gradient: 'from-primary-500 via-primary-400 to-primary-600',
    glow: 'rgba(14, 165, 233, 0.5)',
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
    gradient: 'from-primary-500 via-primary-400 to-primary-600',
    glow: 'rgba(14, 165, 233, 0.5)',
    subOptions: [
      { id: 'categories', label: 'Categorías', path: '/categorias', icon: SearchNavIcon },
      { id: 'near', label: 'Cerca de mí', path: '/cerca', icon: SearchNavIcon }
    ]
  },
  {
    id: 'bot',
    icon: BotIcon,
    label: 'ADIS',
    path: '/chatbot',
    gradient: 'from-primary-500 via-primary-400 to-primary-600',
    glow: 'rgba(14, 165, 233, 0.5)',
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
    gradient: 'from-primary-500 via-primary-400 to-primary-600',
    glow: 'rgba(14, 165, 233, 0.5)',
    subOptions: [
      { id: 'new', label: 'Nuevo Adiso', path: '/publicar/nuevo', icon: MegaphoneIcon },
      { id: 'drafts', label: 'Borradores', path: '/publicar/borradores', icon: MegaphoneIcon }
    ]
  }
].sort((a, b) => {
  // Ordenar para que ADIS esté en el centro
  const order = ['home', 'blog', 'bot', 'search', 'publish']
  return order.indexOf(a.id) - order.indexOf(b.id)
})

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
        className="fixed bottom-0 left-0 right-0 h-16 bg-primary-950 md:hidden z-50"
        initial={false}
        animate={{
          y: isVisible ? 0 : 100,
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] // Curva de animación más suave
        }}
      >
        {/* Efecto de profundidad base mejorado */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary-900/20 to-primary-950/40">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-end justify-around pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            const isHovered = hoveredItem === item.id
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                className="relative flex flex-col items-center justify-end pb-1 w-16"
                onClick={() => router.push(item.path)}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                {...bindLongPress(item.id)}
              >
                {/* Hendidura mejorada bajo el hexágono activo */}
                {isActive && (
                  <motion.div
                    className="absolute -top-6 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative h-8">
                      {/* Sombra superior */}
                      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-primary-950 to-transparent" />
                      {/* Bordes laterales brillantes */}
                      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary-400/20 to-transparent" />
                      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary-400/20 to-transparent" />
                      {/* Línea inferior brillante */}
                      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-400/30 to-transparent" />
                    </div>
                  </motion.div>
                )}

                {/* Hexágono con efectos mejorados */}
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
                        stiffness: 150,
                        damping: 13,
                        y: {
                          repeat: Infinity,
                          duration: 2,
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

                      {/* Icono centrado sin rotación */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icono y etiqueta base mejorados */}
                <motion.div
                  className={`flex flex-col items-center ${
                    isActive ? 'opacity-0' : 'opacity-100'
                  }`}
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    y: isHovered ? -2 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }}
                >
                  <Icon className={`w-6 h-6 text-primary-200`} />
                  <span className="text-sm font-medium mt-1.5 text-primary-200 drop-shadow">
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