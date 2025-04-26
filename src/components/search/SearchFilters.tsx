'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CategoriesService } from '@/services/categories.service'
import CategoryFilters from './CategoryFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { filtersByCategory } from '@/data/filterConfig'
import { FilterValue } from '@/types/filters'

// Enhanced filter styling constants
const FILTER_PANEL_WIDTH = 'md:w-72 lg:w-80'

interface SearchFiltersProps {
  category?: string
  activeFilters?: Record<string, unknown>
  onFiltersChange?: (filters: Record<string, unknown>) => void
  className?: string
  compact?: boolean
}

export default function SearchFilters({
  category,
  activeFilters = {},
  onFiltersChange,
  className = '',
  compact = false
}: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null)
  const [filters, setFilters] = useState<FilterValue>(activeFilters)
  const [filterCount, setFilterCount] = useState<number>(0)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mobile responsiveness
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true)
        const response = await CategoriesService.getCategories()
        setCategories(response)
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCategories()
  }, [])

  // Sync active filters with URL params
  useEffect(() => {
    if (!searchParams) return
    
    const params = Object.fromEntries(searchParams.entries())
    const newFilters: FilterValue = {}
    
    // Extract filter values from URL
    Object.keys(params).forEach(key => {
      if (key !== 'q' && key !== 'category') {
        try {
          // Try to parse JSON values (for ranges, arrays, etc)
          newFilters[key] = JSON.parse(params[key])
        } catch {
          // If not JSON, use the string value
          newFilters[key] = params[key]
        }
      }
    })
    
    if (params.category && params.category !== activeCategory) {
      setActiveCategory(params.category)
    }
    
    setFilters(newFilters)
    countActiveFilters(newFilters)
  }, [searchParams, activeCategory])

  // Count active filters for the badge
  const countActiveFilters = (filterValues: FilterValue) => {
    const count = Object.keys(filterValues).length
    setFilterCount(count)
  }

  // Toggle filter panel visibility
  const toggleFilters = () => {
    setIsOpen(!isOpen)
  }

  // Handle filter changes and update URL
  const handleFilterChange = (filterId: string, value: unknown) => {
    const newFilters = { ...filters }
    
    // Remove empty values
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId]
    } else {
      newFilters[filterId] = value
    }
    
    // Update state
    setFilters(newFilters)
    countActiveFilters(newFilters)
    
    // Update URL and notify parent
    updateUrlParams(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  // Update URL parameters without full page reload
  const updateUrlParams = (filterValues: FilterValue) => {
    if (!searchParams) return
    
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove existing filter params
    Array.from(params.keys()).forEach(key => {
      if (key !== 'q' && key !== 'category') {
        params.delete(key)
      }
    })
    
    // Add new filter params
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convert objects/arrays to JSON strings
        const paramValue = typeof value === 'object' ? JSON.stringify(value) : value.toString()
        params.set(key, paramValue)
      }
    })
    
    // Update URL without reloading the page
    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  // Handle category selection
  const handleCategoryChange = (category: {id: string, name: string} | null) => {
    if (category) {
      setActiveCategory(category.id)
      
      // Update URL with new category
      if (!searchParams) return
      
      const params = new URLSearchParams(searchParams.toString())
      params.set('category', category.id)
      
      // Clear filters when changing category
      Object.keys(filters).forEach(key => {
        params.delete(key)
      })
      
      setFilters({})
      setFilterCount(0)
      
      const newUrl = `${pathname}?${params.toString()}`
      router.push(newUrl, { scroll: false })
      
      // Close filter panel on mobile after category selection
      if (isMobile) {
        setIsOpen(false)
      }
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({})
    setFilterCount(0)
    
    // Update URL, keeping only search query and category
    if (!searchParams) return
    
    const params = new URLSearchParams()
    if (searchParams.has('q')) {
      params.set('q', searchParams.get('q')!)
    }
    if (activeCategory) {
      params.set('category', activeCategory)
    }
    
    const newUrl = `${pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
    
    if (onFiltersChange) {
      onFiltersChange({})
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter toggle button with counter */}
      <Button
        onClick={toggleFilters}
        variant="outline"
        className={`flex items-center gap-2 ${compact ? 'px-3 py-1 h-9' : 'px-4 py-2'}`}
        aria-expanded={isOpen}
        aria-controls="filter-panel"
      >
        <FunnelIcon className="h-4 w-4" />
        <span>Filtros</span>
        {filterCount > 0 && (
          <span className="ml-1 px-2 py-0 text-xs bg-slate-200 text-slate-800 rounded-full">
            {filterCount}
          </span>
        )}
      </Button>

      {/* Filter panel with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full z-40 mt-2 ${isMobile ? 'w-[calc(100vw-2rem)] left-0' : FILTER_PANEL_WIDTH} 
              bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden`}
            id="filter-panel"
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">Filtros</h3>
              <button 
                onClick={toggleFilters}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                aria-label="Cerrar panel de filtros"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Category selection section */}
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <CategoryFilters
                  selectedCategory={activeCategory ? { id: activeCategory, name: categories.find(c => c.id === activeCategory)?.name || '' } : null}
                  selectedType={null}
                  onSelectCategory={handleCategoryChange}
                  onSelectType={() => {}}
                  onFilterChange={() => {}}
                />
              )}

              {/* Dynamic filters based on selected category */}
              {activeCategory && filtersByCategory[activeCategory] && (
                <div className="mt-6 space-y-6">
                  {filtersByCategory[activeCategory].sections.map((section) => (
                    <div key={section.title} className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1">{section.title}</h4>
                      <div className="space-y-4">
                        {section.filters.map((filter) => {
                          // Renderizado simplificado para cada tipo de filtro
                          return (
                            <div key={filter.id} className="space-y-2">
                              <div className="flex justify-between">
                                <label className="text-sm font-medium dark:text-white">{filter.label}</label>
                              </div>
                              {/* Aquí iría el control específico según filter.type */}
                              <div className="text-xs text-gray-500 dark:text-slate-400 italic">
                                Filtro de tipo: {filter.type}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Apply and clear buttons */}
              <div className="mt-6 flex space-x-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button 
                  onClick={clearAllFilters}
                  variant="outline" 
                  className="flex-1"
                  disabled={filterCount === 0}
                >
                  Limpiar todos
                </Button>
                <Button 
                  onClick={toggleFilters}
                  className="flex-1"
                >
                  Ver resultados
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active filters summary (only show if there are active filters) */}
      {filterCount > 0 && !isOpen && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            // Find filter config to get proper label
            let filterLabel = key
            
            if (activeCategory && filtersByCategory[activeCategory]) {
              for (const section of filtersByCategory[activeCategory].sections) {
                const filter = section.filters.find(f => f.id === key);
                if (filter) {
                  filterLabel = filter.label;
                  break;
                }
              }
            }
            
            // Format the display value
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
            
            return (
              <div 
                key={key} 
                className="flex items-center gap-1 py-1 px-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-sm"
              >
                <span className="font-medium">{filterLabel}:</span> {displayValue}
                <button
                  onClick={() => handleFilterChange(key, null)}
                  className="ml-1 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                  aria-label={`Eliminar filtro ${filterLabel}`}
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-xs text-gray-500 dark:text-slate-400 px-2"
          >
            Limpiar todos
          </Button>
        </div>
      )}
    </div>
  )
} 