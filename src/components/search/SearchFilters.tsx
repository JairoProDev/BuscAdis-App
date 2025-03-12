'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilterIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'

interface FilterState {
  priceRange: [number, number]
  sortBy: string
  location: string
  category: string
  minPrice: string
  maxPrice: string
}

export default function SearchFilters({ initialFilters, onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    sortBy: 'recent',
    location: '',
    category: initialFilters?.category || '',
    minPrice: initialFilters?.minPrice || '',
    maxPrice: initialFilters?.maxPrice || ''
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Cargar categorías de la API
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleApplyFilters = () => {
    onFiltersChange(filters)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-primary-800 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        <FilterIcon className="w-4 h-4 mr-2" />
        Filtros
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 right-0 w-80 bg-primary-800 rounded-xl shadow-xl p-4 z-50"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-primary-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full bg-primary-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="recent">Más recientes</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full bg-primary-700 text-white rounded-lg px-3 py-2"
                  placeholder="Ej: Lima, Miraflores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rango de precio
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-1/2 bg-primary-700 text-white rounded-lg px-3 py-2"
                    placeholder="Mínimo"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-1/2 bg-primary-700 text-white rounded-lg px-3 py-2"
                    placeholder="Máximo"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-white rounded-lg text-sm hover:bg-primary-700"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-500"
                >
                  Aplicar
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 