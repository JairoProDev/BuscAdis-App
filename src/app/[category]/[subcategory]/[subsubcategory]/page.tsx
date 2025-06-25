'use client';

import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SearchPageContent from '../../../buscar/page';
import { isValidCategoryPath } from '@/lib/categories';

interface SubSubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    subsubcategory: string;
  }>;
}

export default function SubSubcategoryPage({ params }: SubSubcategoryPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Tipo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparando la mejor experiencia para ti...
          </p>
        </div>
      </div>
    }>
      <SubSubcategoryPageContent params={params} />
    </Suspense>
  );
}

async function SubSubcategoryPageContent({ params }: SubSubcategoryPageProps) {
  const { category, subcategory, subsubcategory } = await params;
  
  // Validar que la categoría, subcategoría y sub-subcategoría existen
  if (!isValidCategoryPath(category, subcategory, subsubcategory)) {
    notFound();
  }

  // Renderizar la misma página de búsqueda pero con toda la jerarquía preseleccionada
  return <SearchPageContent />;
} 