'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ArticleIcon, 
  SearchNavIcon, 
  MegaphoneIcon,
  MessagesIcon,
  NotificationsIcon
} from '@/components/icons'
import { LogoIcon } from '@/components/icons/LogoIcon'

const menuItems = [
  { href: '/', label: 'Inicio', icon: HomeIcon },
  { href: '/blog', label: 'Blog', icon: ArticleIcon },
  { href: '/buscar', label: 'Buscar', icon: SearchNavIcon },
  { href: '/publicar', label: 'Publicar', icon: MegaphoneIcon },
]

export default function Navigation() {
  const [isAuthenticated] = useState(false) // Temporal, luego usar tu sistema de auth
  const pathname = usePathname()

  return (
    <header className="z-50">
      {/* Header superior */}
      <nav className="fixed top-0 left-0 right-0 container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo con función de selección de ubicación */}
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              aria-label="Seleccionar ubicación"
              title="Seleccionar ubicación"
            >
              <LogoIcon className="w-8 h-8" />
              <span className="text-2xl font-bold text-primary-600">
                BuscAdis
              </span>
            </button>
          </div>

          {/* Menú derecho */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Mensajes"
                  title="Mensajes"
                >
                  <MessagesIcon className="w-6 h-6" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Notificaciones"
                  title="Notificaciones"
                >
                  <NotificationsIcon className="w-6 h-6" />
                </button>
                <button 
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300"
                  aria-label="Perfil de usuario"
                  title="Perfil de usuario"
                >
                  {/* Avatar del usuario */}
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/login"
                  className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Barra de navegación inferior para mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                pathname === item.href
                  ? 'text-primary-600'
                  : 'text-gray-600'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
} 