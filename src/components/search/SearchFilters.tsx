'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilterIcon } from '@/components/icons'

interface FilterState {
  priceRange: [number, number]
  sortBy: string
  location: string
}

export default function SearchFilters() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    sortBy: 'recent',
    location: ''
  })

  const handleApplyFilters = () => {
    // Implementar lógica de filtros
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
                  Rango de precio
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [+e.target.value, filters.priceRange[1]]
                    })}
                    className="w-full bg-primary-700 text-white rounded-lg px-3 py-2"
                    placeholder="Mín"
                  />
                  <span className="text-white">-</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [filters.priceRange[0], +e.target.value]
                    })}
                    className="w-full bg-primary-700 text-white rounded-lg px-3 py-2"
                    placeholder="Máx"
                  />
                </div>
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
                  <option value="rating">Mejor valorados</option>
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