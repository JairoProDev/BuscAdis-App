'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-glass/30 border-b border-primary-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary-800">
            BuacAdis
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/buscar" className="text-primary-700 hover:text-primary-900">
              Buscar Adisos
            </Link>
            <Link href="/categorias" className="text-primary-700 hover:text-primary-900">
              Categorías
            </Link>
            <Link href="/publicar" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
              Publicar Adiso
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú de navegación"
            title="Menú de navegación"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <Link href="/buscar" className="block py-2 text-primary-700">
              Buscar Adisos
            </Link>
            <Link href="/categorias" className="block py-2 text-primary-700">
              Categorías
            </Link>
            <Link href="/publicar" className="block py-2 text-primary-700">
              Publicar Adiso
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
} 