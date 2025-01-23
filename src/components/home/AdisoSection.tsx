'use client'

import { motion } from 'framer-motion'
import { AdisoType, Category, Adiso } from '@/types/marketplace'
import FeaturedAds from './FeaturedAds'
import CategoryRow from './CategoryRow'

interface AdisoSectionProps {
  type: AdisoType | 'featured'
  title: string
  categories: Category[]
  adisos: Adiso[]
  featured?: boolean
}

export default function AdisoSection({ 
  type, 
  title, 
  categories, 
  adisos,
  featured = false 
}: AdisoSectionProps) {
  return (
    <section className="relative">
      {/* Título de la sección */}
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          {title}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-800 text-primary-100 rounded-full"
          >
            {adisos.length}
          </motion.span>
        </h2>
        <motion.button
          whileHover={{ x: 5 }}
          className="text-sm text-primary-200 hover:text-white flex items-center"
        >
          Ver más
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Categorías (si existen) */}
      {categories.length > 0 && (
        <CategoryRow 
          title="" 
          categories={categories} 
        />
      )}

      {/* Adisos */}
      <FeaturedAds 
        ads={adisos} 
        featured={featured}
      />
    </section>
  )
} 