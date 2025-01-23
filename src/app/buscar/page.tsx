'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '@/components/search/SearchBar'
import AdisoSection from '@/components/home/AdisoSection'
import CategoryFilters from '@/components/search/CategoryFilters'
import { AdisoType } from '@/types/marketplace'
import { mockData } from '@/data/mockData'

export default function SearchPage() {
  const [selectedType, setSelectedType] = useState<AdisoType | null>(null)

  const filteredData = selectedType
    ? { [selectedType]: mockData[selectedType] }
    : mockData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de búsqueda fija */}
      <div className="sticky top-0 bg-primary-900 pt-20 pb-4 z-30">
        <div className="container mx-auto px-4">
          <SearchBar onSearch={() => {}} />
          <CategoryFilters 
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </div>
      </div>

      {/* Feed de contenido */}
      <motion.div 
        layout
        className="py-6 space-y-8"
      >
        {Object.entries(filteredData).map(([type, data]) => (
          <motion.div
            key={type}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AdisoSection
              type={type as AdisoType}
              title={data.title}
              categories={data.categories}
              adisos={data.adisos}
              featured={type === 'featured'}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
} 