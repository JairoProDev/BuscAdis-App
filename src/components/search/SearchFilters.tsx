'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FunnelIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { filtersByCategory } from '@/data/filterConfig'
import type { FilterOption } from '@/types/filters'

interface SearchFiltersProps {
  selectedCategory?: string
  onFilterChange?: (filters: Record<string, unknown>) => void
  onClearFilters?: () => void
  compact?: boolean
  className?: string
}

export default function SearchFilters({
  selectedCategory,
  onFilterChange,
  onClearFilters,
  compact = false,
  className = ''
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Get filters for the current category
  const categoryConfig = selectedCategory ? filtersByCategory[selectedCategory] : null
  const availableFilters = categoryConfig?.sections || []

  // Count applied filters
  const appliedFilterCount = Object.keys(appliedFilters).length

  const handleFilterChange = useCallback((filterId: string, value: unknown) => {
    const newFilters = { ...appliedFilters }
    
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId]
    } else {
      newFilters[filterId] = value
    }
    
    setAppliedFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }, [appliedFilters, onFilterChange])

  const clearAllFilters = useCallback(() => {
    setAppliedFilters({})
    if (onClearFilters) {
      onClearFilters()
    }
    if (onFilterChange) {
      onFilterChange({})
    }
  }, [onClearFilters, onFilterChange])

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  const renderFilterControl = (filter: FilterOption) => {
    const value = appliedFilters[filter.id]

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value)
                    handleFilterChange(filter.id, newValues.length > 0 ? newValues : null)
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'range':
        const rangeValue = value || { min: filter.min || 0, max: filter.max || 100 }
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Mín"
                value={rangeValue.min || ''}
                onChange={(e) => handleFilterChange(filter.id, {
                  ...rangeValue,
                  min: e.target.value ? parseInt(e.target.value) : filter.min
                })}
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={rangeValue.max || ''}
                onChange={(e) => handleFilterChange(filter.id, {
                  ...rangeValue,
                  max: e.target.value ? parseInt(e.target.value) : filter.max
                })}
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
              />
            </div>
            {filter.format && (
              <div className="text-xs text-gray-500">
                {filter.format(rangeValue.min || 0)} - {filter.format(rangeValue.max || 100)}
              </div>
            )}
          </div>
        )

      case 'toggle':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFilterChange(filter.id, e.target.checked || null)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Sí</span>
          </label>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={filter.label}
          />
        )
    }
  }

  // Don't show if no category selected or no filters available
  if (!selectedCategory || !categoryConfig || availableFilters.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className={`flex items-center gap-2 ${compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
      >
        <FunnelIcon className="h-4 w-4" />
        <span>Filtros</span>
        {appliedFilterCount > 0 && (
          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {appliedFilterCount}
          </span>
        )}
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
        />
      </Button>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {categoryConfig.title}
              </h3>
              <div className="flex items-center gap-2">
                {appliedFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Limpiar todo
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Sections */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableFilters.map((section) => (
                <div key={section.title} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                      {section.title}
                    </h4>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${
                        expandedSections[section.title] !== false ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections[section.title] !== false && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-3"
                      >
                        {section.filters.map((filter) => (
                          <div key={filter.id} className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                              {filter.label}
                            </label>
                            {renderFilterControl(filter)}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 