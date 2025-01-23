'use client'

import { motion } from 'framer-motion'
import { AdisoType, Adiso } from '@/types/marketplace'
import FeaturedAds from './FeaturedAds'
import CategoryRow from './CategoryRow'

interface AdisoSectionProps {
  type: AdisoType
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
    <section className="relative py-6">
      {/* Título de la sección con ícono */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-2">
        <h2 className="text-xl font-bold text-primary-800 flex items-center">
          {title}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-600 rounded-full"
          >
            {adisos.length}
          </motion.span>
        </h2>
      </div>

      {/* Categorías */}
      <CategoryRow 
        title="Categorías populares" 
        categories={categories} 
      />

      {/* Adisos */}
      <FeaturedAds 
        ads={adisos} 
        featured={featured}
      />
    </section>
  )
} 