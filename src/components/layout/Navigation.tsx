'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, NewspaperIcon, MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Header para desktop */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-transparent z-50">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white">
              BuscAdis
            </Link>

            {/* Navegación central - Solo visible en desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-white bg-white/10' 
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <HomeIcon className="w-5 h-5" />
                  <span>Inicio</span>
                </span>
              </Link>

              <Link
                href="/blog"
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/blog')
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <NewspaperIcon className="w-5 h-5" />
                  <span>Blog</span>
                </span>
              </Link>

              <Link
                href="/buscar"
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/buscar')
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Buscar</span>
                </span>
              </Link>

              <Link
                href="/publicar"
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/publicar')
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>Publicar</span>
                </span>
              </Link>
            </nav>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-white/90 hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-white/90 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      
    </>
  )
} 