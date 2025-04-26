'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FunnelIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { CategoriesService } from '@/services/CategoriesService'
import CategoryFilters from './CategoryFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import FilterSection from '@/components/search/FilterSection'
import { filtersByCategory } from '@/data/filterConfig'
import { FilterValue, Filter, FilterType } from '@/types/filters'
import type { Category } from '@/types/categories'

// Enhanced filter styling constants
const FILTER_PANEL_WIDTH = 'md:w-72 lg:w-80'

interface SearchFiltersProps {
  activeFilters?: FilterValue
  onFiltersChange?: (filters: Record<string, unknown>) => void
  activeCategory?: string
  className?: string
  compact?: boolean
  filters?: Filter[]
  onFilterChange?: (filters: Record<string, unknown>) => void
  selectedCategory?: string
  selectedSubcategory?: string
  selectedSubSubcategory?: string
  onClearFilters?: () => void
  initialCategory?: string
}

export default function SearchFilters({
  activeFilters = {},
  // onFiltersChange, // Commented out as it's unused
  activeCategory,
  className = '',
  compact = false,
  filters = [],
  onFilterChange,
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory,
  onClearFilters,
  initialCategory,
}: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // State for filter management
  const [categories, setCategories] = useState<Category[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [filterCount, setFilterCount] = useState(0)
  
  // Mobile responsiveness
  const [isMobile, setIsMobile] = useState(false)
  
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  // const [loadedCategories, setLoadedCategories] = useState<Array<{id: string, name: string}>>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterValue>(activeFilters || {})
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  const [categoryFilters, setCategoryFilters] = useState<Filter[]>([])
  const [currentCategory, setCurrentCategory] = useState(selectedCategory || initialCategory || '')
  // Removed unused variables
  // const [currentSubcategory, setCurrentSubcategory] = useState(selectedSubcategory || '')
  // const [currentSubSubcategory, setCurrentSubSubcategory] = useState(selectedSubSubcategory || '')
  // const isMounted = useRef(false)

  useEffect(() => {
    // Load categories on component mount
    const loadCategories = async () => {
      try {
        const response = await CategoriesService.getCategories()
        setCategories(response)
        // setLoadedCategories(response)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    
    loadCategories()
    
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Handle filter changes and update URL
  const handleFilterChange = useCallback((filterKey: string, value: unknown) => {
    setAppliedFilters((prev) => {
      const newFilters = { ...prev, [filterKey]: value }
      
      // If the value is undefined, null, an empty array or an empty object, delete the property
      if (
        value === undefined || 
        value === null || 
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      ) {
        delete newFilters[filterKey]
      }
      
      // Notify parent component
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
      
      // Update URL with the new filters
      updateQueryParams(newFilters)
      
      return newFilters
    })
    
    setIsFilterApplied(true)
  }, [onFilterChange, router])

  // Update URL parameters without full page reload
  const updateQueryParams = useCallback((newFilters: FilterValue) => {
    // Create object with current parameters
    const params = Object.fromEntries(searchParams.entries())
    
    // Update with the new filters
    Object.keys(newFilters).forEach((key) => {
      const value = newFilters[key]
      
      if (value === undefined || value === null) {
        delete params[key]
      } 
      // Handle ranges
      else if (typeof value === 'object' && 'min' in value && 'max' in value) {
        params[key] = `${value.min}-${value.max}`
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        params[key] = value.join(',')
      }
      // Simple values
      else {
        params[key] = String(value)
      }
    })
    
    // Build the new URL
    const query = new URLSearchParams(params).toString()
    const newUrl = window.location.pathname + (query ? `?${query}` : '')
    
    // Update URL without reloading the page
    router.replace(newUrl, { scroll: false })
  }, [searchParams, router])

  // Handle category selection
  const handleCategoryChange = (category: {id: string, name: string} | null) => {
    if (category) {
      setCurrentCategory(category.id)
      
      // Update URL with new category
      if (!searchParams) return
      
      const params = new URLSearchParams(searchParams.toString())
      params.set('category', category.id)
      
      // Clear filters when changing category
      Object.keys(appliedFilters).forEach(key => {
        params.delete(key)
      })
      
      setAppliedFilters({})
      setFilterCount(0)
      
      const newUrl = `${pathname}?${params.toString()}`
      router.push(newUrl, { scroll: false })
      
      // Close filter panel on mobile after category selection
      if (isMobile) {
        setShowMobileFilters(false)
      }
    }
  }

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setAppliedFilters({})
    setIsFilterApplied(false)
    
    if (onClearFilters) {
      onClearFilters()
    }
    
    // Remove filter parameters from URL keeping pagination and search
    const baseParams: Record<string, string> = {}
    ['query', 'category', 'subcategory', 'subsubcategory', 'page'].forEach((key) => {
      const value = searchParams.get(key)
      if (value) baseParams[key] = value
    })
    
    const query = new URLSearchParams(baseParams).toString()
    router.replace(window.location.pathname + (query ? `?${query}` : ''), { scroll: false })
  }, [onClearFilters, router, searchParams])

  // Count applied filters
  const appliedFilterCount = Object.keys(appliedFilters).length

  // Combine general filters with category-specific filters
  const allFilters = useMemo(() => {
    return [...filters, ...categoryFilters]
  }, [filters, categoryFilters])

  // Actualizar filtros basados en categoría seleccionada
  useEffect(() => {
    if (!selectedCategory && !initialCategory) return
    
    const category = selectedCategory || initialCategory || ''
    setCurrentCategory(category)

    // Obtener filtros específicos para la categoría
    const getFiltersForCategory = async () => {
      try {
        // Aquí implementar el servicio real para obtener filtros de categoría
        const categorySpecificFilters = getCategoryFilters(category)
        setCategoryFilters(categorySpecificFilters)
      } catch (error) {
        console.error('Error loading category filters:', error)
        setCategoryFilters([])
      }
    }
    
    getFiltersForCategory()
  }, [selectedCategory, initialCategory])

  return (
    <div className={`relative ${className}`}>
      {/* Filter toggle button with counter */}
      <Button
        onClick={() => setShowMobileFilters(true)}
        variant="outline"
        className={`flex items-center gap-2 ${compact ? 'px-3 py-1 h-9' : 'px-4 py-2'}`}
        aria-expanded={showMobileFilters}
        aria-controls="filter-panel"
      >
        <FunnelIcon className="h-4 w-4" />
        <span>Filtros</span>
        {appliedFilterCount > 0 && (
          <span className="ml-1 px-2 py-0 text-xs bg-slate-200 text-slate-800 rounded-full">
            {appliedFilterCount}
          </span>
        )}
      </Button>

      {/* Filter panel with animation */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-4/5 bg-slate-900 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                  <h3 className="text-lg font-medium text-white">Filtros</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-slate-400">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {isFilterApplied && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Limpiar todos los filtros</span>
                    </button>
                  )}

                  {allFilters.length > 0 ? (
                    <div className="space-y-4 px-1">
                      {allFilters.map((filter) => (
                        <FilterSection
                          key={filter.id}
                          filter={filter}
                          value={appliedFilters[filter.id]}
                          onChange={(value) => handleFilterChange(filter.id, value)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      {currentCategory ? (
                        <p>No hay filtros disponibles para esta categoría</p>
                      ) : (
                        <p>Selecciona una categoría para ver los filtros disponibles</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-700">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function to get category-specific filters
// This function should be replaced with an actual API call
function getCategoryFilters(category: string): Filter[] {
  // Filters for vehicles
  if (category === 'vehiculos') {
    return [
      {
        id: 'year',
        label: 'Año',
        type: FilterType.RANGE,
        min: 1980,
        max: new Date().getFullYear(),
        step: 1,
      },
      {
        id: 'price',
        label: 'Precio',
        type: FilterType.RANGE,
        min: 0,
        max: 100000,
        step: 500,
      },
      {
        id: 'mileage',
        label: 'Kilometraje',
        type: FilterType.RANGE,
        min: 0,
        max: 300000,
        step: 1000,
      },
      {
        id: 'fuel',
        label: 'Combustible',
        type: FilterType.SELECT,
        options: [
          { value: 'gasoline', label: 'Gasolina' },
          { value: 'diesel', label: 'Diésel' },
          { value: 'electric', label: 'Eléctrico' },
          { value: 'hybrid', label: 'Híbrido' },
          { value: 'lpg', label: 'GLP' },
        ],
      },
      {
        id: 'transmission',
        label: 'Transmisión',
        type: FilterType.SELECT,
        options: [
          { value: 'manual', label: 'Manual' },
          { value: 'automatic', label: 'Automática' },
        ],
      },
      {
        id: 'features',
        label: 'Características',
        type: FilterType.MULTISELECT,
        options: [
          { value: 'air_conditioning', label: 'Aire acondicionado' },
          { value: 'parking_sensors', label: 'Sensores de aparcamiento' },
          { value: 'bluetooth', label: 'Bluetooth' },
          { value: 'cruise_control', label: 'Control de crucero' },
          { value: 'sunroof', label: 'Techo solar' },
        ],
      },
      {
        id: 'professional',
        label: 'Vendedor profesional',
        type: FilterType.TOGGLE,
      },
    ];
  }
  
  // Filters for real estate
  if (category === 'inmuebles') {
    return [
      {
        id: 'price',
        label: 'Precio',
        type: FilterType.RANGE,
        min: 0,
        max: 1000000,
        step: 1000,
      },
      {
        id: 'size',
        label: 'Superficie (m²)',
        type: FilterType.RANGE,
        min: 0,
        max: 500,
        step: 5,
      },
      {
        id: 'rooms',
        label: 'Habitaciones',
        type: FilterType.SELECT,
        options: [
          { value: '1', label: '1 o más' },
          { value: '2', label: '2 o más' },
          { value: '3', label: '3 o más' },
          { value: '4', label: '4 o más' },
          { value: '5', label: '5 o más' },
        ],
      },
      {
        id: 'bathrooms',
        label: 'Baños',
        type: FilterType.SELECT,
        options: [
          { value: '1', label: '1 o más' },
          { value: '2', label: '2 o más' },
          { value: '3', label: '3 o más' },
        ],
      },
      {
        id: 'features',
        label: 'Características',
        type: FilterType.MULTISELECT,
        options: [
          { value: 'garage', label: 'Garaje' },
          { value: 'terrace', label: 'Terraza' },
          { value: 'pool', label: 'Piscina' },
          { value: 'garden', label: 'Jardín' },
          { value: 'elevator', label: 'Ascensor' },
          { value: 'storage_room', label: 'Trastero' },
          { value: 'air_conditioning', label: 'Aire acondicionado' },
        ],
      },
      {
        id: 'furnished',
        label: 'Amueblado',
        type: FilterType.TOGGLE,
      },
      {
        id: 'professional',
        label: 'Anunciante profesional',
        type: FilterType.TOGGLE,
      },
    ];
  }
  
  // Filters for jobs
  if (category === 'empleos') {
    return [
      {
        id: 'salary',
        label: 'Salario anual',
        type: FilterType.RANGE,
        min: 10000,
        max: 100000,
        step: 1000,
      },
      {
        id: 'contract_type',
        label: 'Tipo de contrato',
        type: FilterType.SELECT,
        options: [
          { value: 'full_time', label: 'Jornada completa' },
          { value: 'part_time', label: 'Media jornada' },
          { value: 'temporary', label: 'Temporal' },
          { value: 'internship', label: 'Prácticas' },
          { value: 'freelance', label: 'Autónomo/Freelance' },
        ],
      },
      {
        id: 'experience',
        label: 'Experiencia',
        type: FilterType.SELECT,
        options: [
          { value: 'no_experience', label: 'Sin experiencia' },
          { value: '1-2', label: '1-2 años' },
          { value: '3-5', label: '3-5 años' },
          { value: '5-10', label: '5-10 años' },
          { value: '10+', label: 'Más de 10 años' },
        ],
      },
      {
        id: 'education',
        label: 'Formación',
        type: FilterType.SELECT,
        options: [
          { value: 'none', label: 'No requerida' },
          { value: 'high_school', label: 'Educación secundaria' },
          { value: 'vocational', label: 'Formación profesional' },
          { value: 'bachelor', label: 'Grado universitario' },
          { value: 'master', label: 'Máster' },
          { value: 'phd', label: 'Doctorado' },
        ],
      },
      {
        id: 'remote',
        label: 'Trabajo remoto',
        type: FilterType.TOGGLE,
      },
    ];
  }
  
  // Generic filters for other categories
  return [
    {
      id: 'price',
      label: 'Precio',
      type: FilterType.RANGE,
      min: 0,
      max: 10000,
      step: 10,
    },
    {
      id: 'condition',
      label: 'Estado',
      type: FilterType.SELECT,
      options: [
        { value: 'new', label: 'Nuevo' },
        { value: 'like_new', label: 'Como nuevo' },
        { value: 'good', label: 'En buen estado' },
        { value: 'fair', label: 'Estado aceptable' },
        { value: 'poor', label: 'Necesita reparación' },
      ],
    },
    {
      id: 'professional',
      label: 'Vendedor profesional',
      type: FilterType.TOGGLE,
    },
  ];
} 