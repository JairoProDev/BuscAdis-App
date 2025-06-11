// src\app\buscar\page.tsx
'use client'

import { Suspense } from 'react'
import SupremeSearchLayout from '@/components/search/SupremeSearchEngine/SupremeSearchLayout'

function SearchPageContent() {
  return <SupremeSearchLayout />
}

export default function BuscadorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Buscador Supremo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparando la experiencia de búsqueda más avanzada...
          </p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}