'use client'

import { useState } from 'react'
import { useSearch } from '@/contexts/SearchContext'
import { filtersByCategory } from '@/data/filterConfig'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'

// Define Filter interface locally to avoid type conflicts
interface Filter {
  id: string
  type: string
  label: string
  min?: number
  max?: number
  step?: number
  format?: (value: number) => string
  options?: Array<{ value: string; label: string }>
}

interface FiltersBarProps {
  onFilterChange?: (filters: Record<string, any>) => void
  className?: string
}

export default function FiltersBar({ onFilterChange, className = '' }: FiltersBarProps) {
  const { searchState } = useSearch()
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  // Get filters for current category
  const categoryFilters = searchState.category ? filtersByCategory[searchState.category as keyof typeof filtersByCategory] : null

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...activeFilters, [filterId]: value }
    setActiveFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const removeFilter = (filterId: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[filterId]
    setActiveFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  // Don't render if no category selected or no filters available
  if (!categoryFilters || !searchState.category) {
    return null
  }

  return (
    <div className={`bg-white border-t border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-4 overflow-x-auto">
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtros:</span>
        
        {/* Render filters */}
        {categoryFilters.sections.map((section) =>
          section.filters.map((filter) => {
            const isActive = activeFilters[filter.id] !== undefined

            return (
              <div key={filter.id} className="relative">
                <button
                  onClick={() => setOpenFilter(openFilter === filter.id ? null : filter.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{filter.label}</span>
                  {isActive && activeFilters[filter.id] && (
                    <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded-full">
                      {Array.isArray(activeFilters[filter.id]) 
                        ? `${activeFilters[filter.id].length}`
                        : activeFilters[filter.id].toString().slice(0, 10)
                      }
                    </span>
                  )}
                  <ChevronDownIcon className="h-4 w-4 ml-2 inline" />
                </button>

                {openFilter === filter.id && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px] z-50">
                    {filter.type === 'select' && (
                      <div className="space-y-2">
                        {filter.options?.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={filter.id}
                              value={option.value}
                              checked={activeFilters[filter.id] === option.value}
                              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                              className="text-blue-600"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {filter.type === 'multiselect' && (
                      <div className="space-y-2">
                        {filter.options?.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={Array.isArray(activeFilters[filter.id]) && activeFilters[filter.id].includes(option.value)}
                              onChange={(e) => {
                                const currentValues = Array.isArray(activeFilters[filter.id]) ? activeFilters[filter.id] : []
                                if (e.target.checked) {
                                  handleFilterChange(filter.id, [...currentValues, option.value])
                                } else {
                                  handleFilterChange(filter.id, currentValues.filter((v: any) => v !== option.value))
                                }
                              }}
                              className="text-blue-600"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {filter.type === 'range' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-2">
                            {filter.format ? filter.format(activeFilters[filter.id] || filter.min || 0) : activeFilters[filter.id] || filter.min}
                          </label>
                                                     <input
                             type="range"
                             min={filter.min}
                             max={filter.max}
                             step={filter.step}
                             value={activeFilters[filter.id] || filter.min}
                             onChange={(e) => handleFilterChange(filter.id, parseInt(e.target.value))}
                             className="w-full accent-blue-600"
                             aria-label={`Ajustar ${filter.label}`}
                           />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{filter.format ? filter.format(filter.min || 0) : filter.min}</span>
                            <span>{filter.format ? filter.format(filter.max || 100) : filter.max}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Active filter chips */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
            {Object.entries(activeFilters).map(([filterId, value]) => {
              const filter = categoryFilters.sections
                .flatMap(s => s.filters)
                .find(f => f.id === filterId)
              
              if (!filter || !value) return null

              const displayValue = Array.isArray(value) 
                ? `${value.length} seleccionados`
                : typeof value === 'number' && filter.format
                ? filter.format(value)
                : value.toString()

              return (
                <span
                  key={filterId}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap"
                >
                  {filter.label}: {displayValue}
                  <button
                    onClick={() => removeFilter(filterId)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                    aria-label={`Remover filtro ${filter.label}`}
                    title={`Remover filtro ${filter.label}`}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {openFilter && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenFilter(null)}
        />
      )}
    </div>
  )
} 