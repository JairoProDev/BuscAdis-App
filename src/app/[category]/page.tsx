'use client';

import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import SearchPageContent from '../buscar/page'
import { isValidCategoryPath } from '@/lib/categories'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Categoría
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparando la mejor experiencia para ti...
          </p>
        </div>
      </div>
    }>
      <CategoryPageContent params={params} />
    </Suspense>
  )
}

async function CategoryPageContent({ params }: CategoryPageProps) {
  const { category } = await params
  
  // Validar que la categoría existe
  if (!isValidCategoryPath(category)) {
    notFound()
  }

  // Renderizar la misma página de búsqueda pero con la categoría preseleccionada
  return <SearchPageContent />
} 