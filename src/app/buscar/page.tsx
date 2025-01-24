'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '@/components/search/SearchBar'
import AdisoSection from '@/components/home/AdisoSection'
import CategoryFilters from '@/components/search/CategoryFilters'
import SearchFilters from '@/components/search/SearchFilters'
import { CategoryId } from '@/types/marketplace'
import { categories } from '@/data/mockCategories'
import { mockData } from '@/data/mockData'
import AdvancedFilters from '@/components/search/AdvancedFilters'

export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [filters, setFilters] = useState({})

  const handleSearch = (query: string) => {
    console.log('Búsqueda:', { query, filters, category: selectedCategory })
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const filteredData = selectedCategory
    ? { [selectedCategory]: mockData[selectedCategory] }
    : mockData

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-950">
      {/* Header de búsqueda */}
      <div className="bg-primary-900/80 backdrop-blur-sm pt-20 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <AdvancedFilters
                category={selectedCategory || 'inmuebles'}
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de categorías con scroll horizontal */}
      <div className="bg-primary-900/60 py-4 overflow-x-auto hide-scrollbar">
        <div className="container mx-auto px-4">
          <CategoryFilters 
            selectedCategory={selectedCategory}
            selectedType={selectedType}
            onSelectCategory={setSelectedCategory}
            onSelectType={setSelectedType}
          />
        </div>
      </div>

      {/* Feed de contenido */}
      <div className="container mx-auto px-4">
        <motion.div 
          layout
          className="py-6 space-y-8 md:space-y-12"
        >
          {/* Sección Featured siempre visible al inicio */}
          {!selectedCategory && mockData.featured && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                  type={type as CategoryId}
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