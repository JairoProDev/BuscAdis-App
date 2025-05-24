'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { HomeIcon, ArticleIcon, SearchNavIcon, MegaphoneIcon, BotIcon } from '@/components/icons' // Usando ArticleIcon para el Blog
import { useLongPress } from '@/hooks/useLongPress'
import { ThemeToggle } from '@/components/theme'

const navItems = [
    {
        id: 'home',
        icon: HomeIcon,
        label: 'Inicio',
        path: '/inicio',
        gradient: 'from-primary-500 via-primary-400 to-primary-600', // Updated gradient colors
        glow: 'rgba(59, 130, 246, 0.7)', // Updated glow color 
        subOptions: [
            { id: 'featured', label: 'Destacados', path: '/destacados', icon: HomeIcon },
            { id: 'recent', label: 'Recientes', path: '/recientes', icon: HomeIcon }
        ]
    },
    {
        id: 'blog',
        icon: ArticleIcon, // Usando ArticleIcon para el Blog
        label: 'Blog',
        path: '/blog',
        gradient: 'from-primary-500 via-primary-400 to-primary-600',
        glow: 'rgba(59, 130, 246, 0.7)',
        subOptions: [
            { id: 'news', label: 'Noticias', path: '/blog/noticias', icon: ArticleIcon },
            { id: 'guides', label: 'Guías', path: '/blog/guias', icon: ArticleIcon }
        ]
    },
    {
        id: 'search',
        icon: SearchNavIcon,
        label: 'Buscar',
        path: '/',
        gradient: 'from-primary-500 via-primary-400 to-primary-600',
        glow: 'rgba(59, 130, 246, 0.7)',
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
        glow: 'rgba(59, 130, 246, 0.7)',
        subOptions: [
            { id: 'assistant', label: 'Asistente', path: '/chatbot', icon: BotIcon },
            { id: 'help', label: 'Ayuda', path: '/ayuda', icon: BotIcon }
        ]
    },
    {
        id: 'publish',
        icon: MegaphoneIcon, // Usando PlusCircleIcon como es más acorde a "Publicar"
        label: 'Publicar',
        path: '/publicar',
        gradient: 'from-primary-500 via-primary-400 to-primary-600',
        glow: 'rgba(59, 130, 246, 0.7)',
        subOptions: [
            { id: 'new', label: 'Nuevo Anuncio', path: '/publicar/nuevo', icon: MegaphoneIcon },
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
        return scrollY.on("change", (latest) => {
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
            {/* Floating Theme Toggle */}
            <div className="fixed top-4 right-4 z-50 md:hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-800 modal-overlay rounded-full p-1 shadow-lg"
                >
                    <ThemeToggle />
                </motion.div>
            </div>

            <motion.nav
                className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 md:hidden z-50 border-t border-slate-800"
                initial={false}
                animate={{
                    y: isVisible ? 0 : 100,
                }}
                transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                }}
            >

                <div className="relative container mx-auto px-4 h-full flex items-end justify-around pb-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path
                        const isHovered = hoveredItem === item.id
                        const Icon = item.icon

                        return (
                            <motion.button
                                key={item.id}
                                className="relative flex flex-col items-center justify-end w-16"
                                onClick={() => router.push(item.path)}
                                onHoverStart={() => setHoveredItem(item.id)}
                                onHoverEnd={() => setHoveredItem(null)}
                                {...bindLongPress(item.id)}
                            >
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
                                    <Icon className={`w-6 h-6 text-primary-300`} /> {/* Updated icon colors */}
                                    <span className="text-sm font-medium mt-1.5 text-primary-300"> {/* Updated text colors */}
                                        {item.label}
                                    </span>
                                </motion.div>

                                {isActive && (
                                    <motion.div
                                        className="absolute -top-6 w-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="relative h-8">
                                            {/* Sombra superior */}
                                            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-slate-900 to-transparent" />
                                            {/* Bordes laterales brillantes */}
                                            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary-400/40 to-transparent" /> {/* Updated highlight color */}
                                            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary-400/40 to-transparent" /> {/* Updated highlight color */}
                                            {/* Línea inferior brillante */}
                                            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" /> {/* Updated highlight color */}
                                        </div>
                                    </motion.div>
                                )}

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
                                            {/* Efecto de brillo mejorado con gradiente */}
                                            <div
                                                className="absolute inset-0 blur-2xl opacity-60 -z-10 animate-pulse"
                                                style={{
                                                    background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`
                                                }}
                                            />

                                            {/* Hexágono principal con nuevo gradiente */}
                                            <div className={`w-full h-full bg-gradient-to-br ${item.gradient} rounded-xl transform rotate-45 shadow-lg`}>
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                            </div>

                                            {/* Anillo giratorio con nuevo color */}
                                            <motion.div
                                                className="absolute inset-0 -m-1"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                            >
                                                <svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
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
                            </motion.button>
                        )
                    })}
                </div>
            </motion.nav>

            {/* Submenu con el nuevo color de fondo y estilos */}
            <AnimatePresence>
                {activeSubMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-16 left-0 right-0 bg-slate-800 md:hidden z-40 border-t border-slate-700 modal-overlay"
                    >
                        <div className="container mx-auto p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {navItems
                                    .find(item => item.id === activeSubMenu)
                                    ?.subOptions.map(option => (
                                        <motion.button
                                            key={option.id}
                                            className="flex items-center space-x-2 p-3 rounded-lg bg-slate-700 text-primary-300 hover:bg-slate-600 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                router.push(option.path)
                                                setActiveSubMenu(null)
                                            }}
                                        >
                                            {option.icon && <option.icon className="w-5 h-5" />}
                                            <span>{option.label}</span>
                                        </motion.button>
                                    ))}
                            </div>
                            <motion.button
                                className="w-full mt-3 p-2 rounded-lg bg-slate-700 text-primary-300 hover:bg-slate-600 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveSubMenu(null)}
                            >
                                Cerrar
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}