'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import { filtersByCategory } from '@/data/filterConfig'
import { 
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface AdvancedFiltersProps {
  onFilterChange: (filters: Record<string, unknown>) => void;
  onClose?: () => void;
  className?: string;
}

interface ActiveFilter {
  id: string
  label: string
  value: unknown
  displayValue: string
}

export default function AdvancedFilters({
  onFilterChange,
  onClose,
  className = ''
}: AdvancedFiltersProps) {
  const { searchState } = useSearch()
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({})

  // Get filters for current category
  const categoryFilters = searchState.category ? 
    filtersByCategory[searchState.category as keyof typeof filtersByCategory] : null

  // Update active filters list when filters change
  useEffect(() => {
    if (!categoryFilters) {
      return
    }

    const filtersList: ActiveFilter[] = []
    
    Object.entries(activeFilters).forEach(([filterId, value]) => {
      if (value === undefined || value === null || value === '') return

      const filter = categoryFilters.sections
        .flatMap(section => section.filters)
        .find(f => f.id === filterId)

      if (filter) {
        let displayValue = ''
        
        if (Array.isArray(value)) {
          displayValue = `${value.length} seleccionados`
        } else if (typeof value === 'number' && filter.format) {
          displayValue = filter.format(value)
        } else if (filter.type === 'select' && filter.options) {
          const option = filter.options.find(opt => opt.value === value)
          displayValue = option ? option.label : value.toString()
        } else {
          displayValue = value.toString()
        }

        filtersList.push({
          id: filterId,
          label: filter.label,
          value,
          displayValue
        })
      }
    })

  }, [activeFilters, categoryFilters])

  const handleFilterChange = (filterId: string, value: unknown) => {
    const newFilters = { ...activeFilters }
    
    if (value === undefined || value === null || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId]
    } else {
      newFilters[filterId] = value
    }

    setActiveFilters(newFilters)
    
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  if (!categoryFilters) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
      >
        <FunnelIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros</span>
      </button>

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 w-96 max-h-96 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {categoryFilters.title}
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Cerrar filtros"
                  title="Cerrar filtros"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-4">
                {categoryFilters.sections.map((section) => (
                  <div key={`section-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="space-y-4">
                    {section.title && (
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                        {section.title}
                      </h4>
                    )}
                    <div className="space-y-4">
                      {section.filters.map(filter => (
                        <div key={filter.id} className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {filter.label}
                          </label>

                          {filter.type === 'range' && (
                            <div className="space-y-2">
                              <input
                                type="range"
                                min={filter.min}
                                max={filter.max}
                                step={filter.step}
                                value={typeof activeFilters[filter.id] === 'number' ? activeFilters[filter.id] as number : filter.min}
                                onChange={(e) => handleFilterChange(filter.id, parseInt(e.target.value))}
                                className="w-full accent-blue-600"
                                aria-label={`Ajustar ${filter.label}`}
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{filter.format ? filter.format(filter.min || 0) : filter.min}</span>
                                <span className="font-medium">
                                  {filter.format ? filter.format(typeof activeFilters[filter.id] === 'number' ? activeFilters[filter.id] as number : filter.min || 0) : (typeof activeFilters[filter.id] === 'number' ? activeFilters[filter.id] as number : filter.min)}
                                </span>
                                <span>{filter.format ? filter.format(filter.max || 100) : filter.max}</span>
                              </div>
                            </div>
                          )}

                          {filter.type === 'select' && (
                            <select
                              value={typeof activeFilters[filter.id] === 'string' ? activeFilters[filter.id] as string : ''}
                              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label={`Seleccionar ${filter.label}`}
                              title={`Seleccionar ${filter.label}`}
                            >
                              <option value="">Seleccionar {filter.label.toLowerCase()}</option>
                              {filter.options?.map((option: { value: unknown; label: string }) => (
                                <option key={String(option.value)} value={String(option.value)}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {filter.type === 'multiselect' && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {filter.options?.map((option: { value: unknown; label: string }) => {
                                const value = activeFilters[filter.id]
                                const isSelected = Array.isArray(value) && value.includes(option.value)
                                return (
                                  <label
                                    key={String(option.value)}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        const currentValues = Array.isArray(value) ? value : []
                                        if (e.target.checked) {
                                          handleFilterChange(filter.id, [...currentValues, option.value])
                                        } else {
                                          handleFilterChange(filter.id, currentValues.filter(v => v !== option.value))
                                        }
                                      }}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {option.label}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 