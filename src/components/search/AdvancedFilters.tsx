'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Switch } from '@headlessui/react'
import { Slider } from '@mui/material'
import {
  ChevronDownIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import { filtersByCategory } from '@/data/filterConfig'
import { FilterValue } from '@/types/filters'

export default function AdvancedFilters({ 
  category,
  onFiltersChange,
  initialFilters = {}
}: {
  category: keyof typeof filtersByCategory
  onFiltersChange: (filters: FilterValue) => void
  initialFilters?: FilterValue
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterValue>(initialFilters)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const categoryFilters = filtersByCategory[category]

  useEffect(() => {
    // Sincronizar filtros con URL al montar
    const params = new URLSearchParams(searchParams.toString())
    const filtersFromUrl: FilterValue = {}
    
    params.forEach((value, key) => {
      try {
        filtersFromUrl[key] = JSON.parse(value)
      } catch {
        filtersFromUrl[key] = value
      }
    })
    
    setActiveFilters(filtersFromUrl)
  }, [searchParams])

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = {
      ...activeFilters,
      [filterId]: value
    }
    setActiveFilters(newFilters)
    onFiltersChange(newFilters)

    // Actualizar URL
    const params = new URLSearchParams(searchParams.toString())
    params.set(filterId, JSON.stringify(value))
    router.push(`?${params.toString()}`)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const renderFilter = (filter: any) => {
    switch (filter.type) {
      case 'range':
        return (
          <div className="space-y-2">
            <label htmlFor={filter.id} className="text-sm font-medium text-white/80">
              {filter.label}
            </label>
            <Slider
              id={filter.id}
              value={activeFilters[filter.id] || [filter.min, filter.max]}
              onChange={(_, value) => handleFilterChange(filter.id, value)}
              min={filter.min}
              max={filter.max}
              step={filter.step}
              valueLabelDisplay="auto"
              valueLabelFormat={filter.format}
              className="text-white"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>{filter.format(filter.min)}</span>
              <span>{filter.format(filter.max)}</span>
            </div>
          </div>
        )

      case 'select':
        return (
          <div className="space-y-2">
            <label htmlFor={filter.id} className="text-sm font-medium text-white/80">
              {filter.label}
            </label>
            <select
              id={filter.id}
              value={activeFilters[filter.id] || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="w-full rounded-lg bg-white/10 border-white/20 text-white placeholder-white/40
                       focus:border-white/40 focus:ring-white/20"
            >
              <option value="">Todos</option>
              {filter.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            <label htmlFor={filter.id} className="text-sm font-medium text-white/80">
              {filter.label}
            </label>
            <div className="flex flex-wrap gap-2">
              {filter.options.map((option: any) => {
                const isSelected = (activeFilters[filter.id] || []).includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const current = activeFilters[filter.id] || []
                      const newValue = isSelected
                        ? current.filter((v: string) => v !== option.value)
                        : [...current, option.value]
                      handleFilterChange(filter.id, newValue)
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 'toggle':
        return (
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label htmlFor={filter.id} className="text-sm font-medium text-white/80">
                {filter.label}
              </Switch.Label>
              <Switch
                id={filter.id}
                checked={activeFilters[filter.id] || false}
                onChange={(checked) => handleFilterChange(filter.id, checked)}
                className={`${
                  activeFilters[filter.id] ? 'bg-primary-600' : 'bg-white/20'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    activeFilters[filter.id] ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </Switch.Group>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative">
      {/* Botón de filtros */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="filter-button"
        aria-label="Abrir filtros"
        title="Abrir filtros"
      >
        <AdjustmentsHorizontalIcon className="w-5 h-5" />
        <span>Filtros</span>
        {Object.keys(activeFilters).length > 0 && (
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
            {Object.keys(activeFilters).length}
          </span>
        )}
      </button>

      {/* Panel de filtros */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="filter-panel"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {categoryFilters.title}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white"
                  aria-label="Cerrar filtros"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {categoryFilters.sections.map((section) => (
                <div key={section.title} className="border-b border-white/10">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full p-4 text-left hover:bg-white/5"
                    aria-expanded={expandedSections.includes(section.title) ? "true" : "false"}
                    aria-controls={`section-${section.title}`}
                  >
                    <span className="font-medium text-white">
                      {section.title}
                    </span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-white/60 transition-transform ${
                        expandedSections.includes(section.title) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes(section.title) && (
                      <motion.div
                        id={`section-${section.title}`}
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          {section.filters.map((filter) => (
                            <div key={filter.id}>
                              {renderFilter(filter)}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveFilters({})
                    onFiltersChange({})
                    router.push(window.location.pathname)
                  }}
                  className="text-sm text-white/60 hover:text-white"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="glass-button text-white"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 