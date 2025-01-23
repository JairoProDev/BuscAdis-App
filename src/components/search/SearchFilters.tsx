'use client'

import { useState } from 'react'
import { XIcon } from '@/components/icons'
import { CategoryFilters } from './CategoryFilters'

interface SearchFiltersProps {
  category?: string
  onApply: (filters: any) => void
  onClose: () => void
}

export default function SearchFilters({ category, onApply, onClose }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    price: { min: '', max: '' },
    location: {
      radius: 10,
      coordinates: null
    },
    date: 'all',
    sortBy: 'relevance'
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Filtros avanzados</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Cerrar filtros"
            title="Cerrar filtros"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filtros generales */}
          <div className="space-y-4">
            <h3 className="font-medium">Precio</h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Mínimo"
                className="flex-1 p-2 border rounded"
                value={filters.price.min}
                onChange={(e) => setFilters({
                  ...filters,
                  price: { ...filters.price, min: e.target.value }
                })}
              />
              <input
                type="number"
                placeholder="Máximo"
                className="flex-1 p-2 border rounded"
                value={filters.price.max}
                onChange={(e) => setFilters({
                  ...filters,
                  price: { ...filters.price, max: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Filtros específicos por categoría */}
          {category && <CategoryFilters category={category} />}

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="font-medium">Ubicación</h3>
            <div className="space-y-2">
              <label className="sr-only" htmlFor="radius-range">Radio de búsqueda</label>
              <input
                id="radius-range"
                type="range"
                min="1"
                max="50"
                value={filters.location.radius}
                onChange={(e) => setFilters({
                  ...filters,
                  location: { ...filters.location, radius: Number(e.target.value) }
                })}
                className="w-full"
                title="Radio de búsqueda"
              />
              <div className="text-sm text-gray-500">
                Radio de búsqueda: {filters.location.radius} km
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-4">
            <label htmlFor="date-filter" className="font-medium block">
              Fecha de publicación
            </label>
            <select
              id="date-filter"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>

          {/* Ordenar por */}
          <div className="space-y-4">
            <label htmlFor="sort-filter" className="font-medium block">
              Ordenar por
            </label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="relevance">Relevancia</option>
              <option value="date_desc">Más recientes</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={() => onApply(filters)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  )
} 