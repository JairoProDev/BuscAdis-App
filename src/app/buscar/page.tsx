'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '@/components/search/SearchBar'
import AdisoSection from '@/components/home/AdisoSection'
import CategoryFilters from '@/components/search/CategoryFilters'
import SearchFilters from '@/components/search/SearchFilters'
import { AdisoType } from '@/types/marketplace'
import { mockData } from '@/data/mockData'

export default function SearchPage() {
  const [selectedType, setSelectedType] = useState<AdisoType | null>(null)

  const filteredData = selectedType
    ? { [selectedType]: mockData[selectedType] }
    : mockData

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-950">
      {/* Barra de búsqueda fija */}
      <div className="sticky top-0 bg-gradient-to-b from-primary-900/95 to-primary-900/80 backdrop-blur-sm pt-20 pb-4 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar onSearch={() => {}} />
            </div>
            <SearchFilters />
          </div>
          <CategoryFilters 
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </div>
      </div>

      {/* Feed de contenido */}
      <div className="container mx-auto px-4">
        <motion.div 
          layout
          className="py-6 space-y-12"
        >
          {/* Sección Featured siempre visible al inicio */}
          {!selectedType && mockData.featured && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8"
            >
              <AdisoSection
                type="featured"
                title="Destacados"
                categories={[]}
                adisos={mockData.featured.adisos}
                featured={true}
              />
            </motion.div>
          )}

          {/* Resto de secciones */}
          {Object.entries(filteredData)
            .filter(([type]) => type !== 'featured')
            .map(([type, data]) => (
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
                  featured={false}
                />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </div>
  )
} 