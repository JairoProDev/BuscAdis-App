'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ArticleIcon, 
  SearchNavIcon, 
  MegaphoneIcon,
  LocationIcon,
  MessagesIcon,
  NotificationsIcon
} from '@/components/icons'

const menuItems = [
  { href: '/', label: 'Inicio', icon: HomeIcon },
  { href: '/blog', label: 'Blog', icon: ArticleIcon },
  { href: '/buscar', label: 'Buscar', icon: SearchNavIcon },
  { href: '/publicar', label: 'Publicar', icon: MegaphoneIcon },
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Temporal, luego usar tu sistema de auth
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            BuscAdis
          </Link>

          {/* Menú central de navegación */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex space-x-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative group px-6 py-2 rounded-lg transition-colors ${
                    pathname === item.href 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs mt-1">{item.label}</span>
                  </div>
                  {pathname === item.href && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Menú derecho */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <LocationIcon className="w-6 h-6" />
            </button>
            
            {isAuthenticated ? (
              <>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MessagesIcon className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <NotificationsIcon className="w-6 h-6" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300">
                  {/* Avatar del usuario */}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón de menú móvil */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-around">
              <motion.span
                className="w-full h-0.5 bg-primary-600 block"
                animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="w-full h-0.5 bg-primary-600 block"
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="w-full h-0.5 bg-primary-600 block"
                animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              />
            </div>
          </button>
        </div>

        {/* Menú móvil */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4"
            >
              <div className="flex flex-col space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="pt-2 space-y-2">
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-center text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
} 