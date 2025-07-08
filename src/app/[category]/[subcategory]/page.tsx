'use client';

import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import SearchPageContent from '../../buscar/page'
import { isValidCategoryPath } from '@/lib/categories'

interface SubcategoryPageProps {
  params: Promise<{
    category: string
    subcategory: string
  }>
}

export default function SubcategoryPage({ params }: SubcategoryPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Subcategoría
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparando la mejor experiencia para ti...
          </p>
        </div>
      </div>
    }>
      <SubcategoryPageContent params={params} />
    </Suspense>
  )
}

function SubcategoryPageContent({ params }: SubcategoryPageProps) {
  const [isValid, setIsValid] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      const categoryId = resolvedParams.category
      const subcategoryId = resolvedParams.subcategory
      
      // Validar que la categoría y subcategoría existen
      const valid = isValidCategoryPath(categoryId, subcategoryId)
      
      if (!valid) {
        notFound()
        return
      }
      
      setIsValid(true)
    }
    
    resolveParams()
  }, [params])

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Validando Subcategoría
          </h2>
        </div>
      </div>
    )
  }

  // Renderizar la misma página de búsqueda pero con la categoría y subcategoría preseleccionadas
  return <SearchPageContent />
} 