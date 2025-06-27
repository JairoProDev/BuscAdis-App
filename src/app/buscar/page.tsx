// src\app\buscar\page.tsx
'use client'

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  ChevronDownIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline'
import RealTimeSearchEngine from '@/components/search/RealTimeSearchEngine'
import EnhancedSearchInput from '@/components/search/EnhancedSearchInput'
import SearchFilters from '@/components/search/SearchFilters'
import PublicationCard from '@/components/publications/PublicationCard'
import CategorySelector from '@/components/search/CategorySelector'
import { parseCategoryUrl, getSubcategories } from '@/lib/categories'
import { filtersByCategory } from '@/data/filterConfig'
import type { FilterOption } from '@/types/filters'
import { createPortal } from 'react-dom'

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  image: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
}

interface PublicationData {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string | null;
  subSubcategorySlug: string | null;
  transactionType: string;
  value: number;
  currency: string;
  valueType: string;
  size: number;
  location: {
    district: string;
    province: string;
    city: string;
    country: string;
  };
  images: string[];
  whatsapp: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
}

type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'views' | 'distance'

const sortOptions = [
  { value: 'recent', label: 'Más recientes', icon: '🕒' },
  { value: 'price-asc', label: 'Precio: menor a mayor', icon: '💰' },
  { value: 'price-desc', label: 'Precio: mayor a menor', icon: '💸' },
  { value: 'views', label: 'Más populares', icon: '👁️' },
  { value: 'distance', label: 'Más cercanos', icon: '📍' }
]

// Componente simple para selector de subcategorías
const SubcategorySelector = ({ 
  selectedCategory, 
  selectedSubcategory, 
  onSubcategoryChange 
}: {
  selectedCategory: string
  selectedSubcategory: string
  onSubcategoryChange: (subcategory: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const subcategories = getSubcategories(selectedCategory)
  
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleSubcategorySelect = useCallback((subcategoryId: string) => {
    onSubcategoryChange(subcategoryId)
    setIsOpen(false)
  }, [onSubcategoryChange])
  
  if (!subcategories.length) return null
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedSubcategory ? subcategories.find(sub => sub.id === selectedSubcategory)?.name : 'Subcategoría'}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <DropdownPortal 
        isOpen={isOpen}
        buttonRef={buttonRef.current}
        onClose={handleClose}
      >
        <button
          onClick={() => handleSubcategorySelect('')}
          className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          Todas las subcategorías
        </button>
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => handleSubcategorySelect(subcategory.id)}
            className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              selectedSubcategory === subcategory.id 
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {subcategory.name}
          </button>
        ))}
      </DropdownPortal>
    </div>
  )
}

// Componente para selector individual de filtros
const FilterSelector = ({ 
  filter, 
  value, 
  onFilterChange 
}: {
  filter: FilterOption
  value: any
  onFilterChange: (filterId: string, value: any) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleFilterSelect = useCallback((optionValue: any) => {
    onFilterChange(filter.id, optionValue)
    setIsOpen(false)
  }, [filter.id, onFilterChange])

  if (filter.type === 'select') {
    const selectedOption = filter.options?.find(option => option.value === value)
    
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedOption ? selectedOption.label : filter.label}
          </span>
          <ChevronDownIcon 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        <DropdownPortal 
          isOpen={isOpen}
          buttonRef={buttonRef.current}
          onClose={handleClose}
        >
          <button
            onClick={() => handleFilterSelect(null)}
            className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            Cualquier {filter.label.toLowerCase()}
          </button>
          {filter.options?.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterSelect(option.value)}
              className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                value === option.value 
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </DropdownPortal>
      </div>
    )
  }

  // Para otros tipos de filtros, devolver null por ahora
  return null
}

// Custom hook para manejar positioning de dropdowns
const useDropdownPosition = (buttonRef: HTMLButtonElement | null, isOpen: boolean) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!buttonRef || !isOpen) return

    const updatePosition = () => {
      const rect = buttonRef.getBoundingClientRect()
      setPosition({
        top: rect.bottom,
        left: rect.left
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [buttonRef, isOpen])

  return position
}

// Componente Dropdown Portal - Solución profesional
const DropdownPortal = ({ 
  isOpen, 
  buttonRef, 
  onClose, 
  children 
}: {
  isOpen: boolean
  buttonRef: HTMLButtonElement | null
  onClose: () => void
  children: React.ReactNode
}) => {
  const position = useDropdownPosition(buttonRef, isOpen)

  if (!isOpen || typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop para cerrar al hacer click fuera */}
      <div 
        className="fixed inset-0 z-[100000]" 
        onClick={onClose}
      />
      {/* Dropdown content */}
      <div 
        className="fixed w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto z-[100001]"
        style={{ 
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        {children}
      </div>
    </>,
    document.body
  )
}

// Componente mejorado que fusiona selector + chip cuando está activo
const EnhancedFilterSelector = ({ 
  label,
  value, 
  options,
  onChange,
  placeholder
}: {
  label: string
  value: any
  options: Array<{value: string, label: string}>
  onChange: (value: string | null) => void
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const selectedOption = options.find(option => option.value === value)
  const hasValue = value && value !== ''
  
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleOptionSelect = useCallback((optionValue: string | null) => {
    onChange(optionValue)
    setIsOpen(false)
  }, [onChange])
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm ${
          hasValue 
            ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300' 
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
      >
        <span className="text-sm font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {hasValue && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)
            }}
            className="ml-1 hover:bg-teal-200 dark:hover:bg-teal-800 rounded-full p-0.5 transition-colors"
            title="Limpiar filtro"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <DropdownPortal 
        isOpen={isOpen}
        buttonRef={buttonRef.current}
        onClose={handleClose}
      >
        <button
          onClick={() => handleOptionSelect(null)}
          className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          {placeholder}
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              value === option.value 
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </DropdownPortal>
    </div>
  )
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const currentPathname = usePathname()
  
  // Inicializar estados con valores de URL si están disponibles
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (currentPathname && currentPathname !== '/buscar') {
      const parsed = parseCategoryUrl(currentPathname)
      return parsed.categoryId || 'all'
    }
    return 'all'
  })
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(() => {
    if (currentPathname && currentPathname !== '/buscar') {
      const parsed = parseCategoryUrl(currentPathname)
      return parsed.subcategoryId || ''
    }
    return ''
  })
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<string>(() => {
    if (currentPathname && currentPathname !== '/buscar') {
      const parsed = parseCategoryUrl(currentPathname)
      return parsed.subSubcategoryId || ''
    }
    return ''
  })
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [currentQuery, setCurrentQuery] = useState<string>('')
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)

  // Convert SearchResult to PublicationData format
  const convertToPublicationData = (searchResult: SearchResult): PublicationData => {
    const locationParts = searchResult.location.split(',').map(part => part.trim())
    
    return {
      id: searchResult.id,
      title: searchResult.title,
      description: searchResult.description,
      categorySlug: searchResult.category.toLowerCase(),
      subcategorySlug: null,
      subSubcategorySlug: null,
      transactionType: 'venta',
      value: searchResult.price,
      currency: 'PEN',
      valueType: 'fixed',
      size: 0,
      location: {
        district: locationParts[0] || '',
        province: locationParts[1] || '',
        city: locationParts[2] || 'Cusco',
        country: 'Perú'
      },
      images: [searchResult.image],
      whatsapp: '51987654321', // Número de WhatsApp por defecto
      createdAt: searchResult.createdAt || new Date().toISOString(), // Usar fecha real de MongoDB
      views: searchResult.views || Math.floor(Math.random() * 500) + 50,
      featured: searchResult.featured || false,
      premium: searchResult.premium || false,
    }
  }

  const handleSearch = useCallback(async (query: string, filters: Record<string, any> = {}) => {
    console.log('🔍 handleSearch called with:', { query, filters, selectedCategory })
    
    setIsLoading(true)
    setHasSearched(true)
    setCurrentQuery(query)
    
    try {
      const searchParams: Record<string, string> = {
        sortBy: sortBy
      }
      
      if (query.trim()) searchParams.query = query
      if (filters.category && filters.category !== 'all') searchParams.category = filters.category
      if (filters.subcategory) searchParams.subcategory = filters.subcategory
      if (filters.subsubcategory) searchParams.subsubcategory = filters.subsubcategory
      if (filters.location) searchParams.location = filters.location
      
      // Add active filters to search params
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) searchParams[key] = String(value)
      })
      
      console.log('🔍 Searching with params:', searchParams)
      
      const queryString = new URLSearchParams(searchParams).toString()
      const response = await fetch(`/api/publications?${queryString}`)
      const data = await response.json()
      
      if (!data.publications) {
        throw new Error(data.errorFriendly || 'No se encontraron resultados')
      }
      
      // Adaptar resultados de la API al formato esperado
      const adaptedResults: SearchResult[] = data.publications.map((pub: any) => ({
        id: pub._id || pub.id || `result-${Date.now()}-${Math.random()}`,
        title: pub.title || 'Sin título',
        description: pub.description || '',
        price: pub.price || pub.amount || 0,
        location: typeof pub.location === 'object' 
          ? `${pub.location.district || pub.location.province || pub.location.city || 'Sin ubicación'}` 
          : pub.location || 'Sin ubicación',
        category: pub.categorySlug || pub.category || 'general',
        image: pub.images?.[0] || '/images/placeholder-image.jpg',
        createdAt: pub.createdAt || pub.created_at || new Date().toISOString(), // Fecha real de MongoDB
        views: pub.views || Math.floor(Math.random() * 500) + 50,
        premium: pub.premium || false,
        featured: pub.featured || false
      }))

      setResults(adaptedResults)
      setTotalCount(data.total || adaptedResults.length)
      
      console.log(`Found ${adaptedResults.length} results for "${query}"`)
      
    } catch (error) {
      console.error('Error in search:', error)
      setResults([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, activeFilters])

  const handleCategoryChange = useCallback((category: string) => {
    console.log('📂 Category changed to:', category)
    
    setSelectedCategory(category)
    setSelectedSubcategory('')
    setSelectedSubSubcategory('')
    setActiveFilters({})
    
    handleSearch(currentQuery, {
      category: category === 'all' ? undefined : category
    })
  }, [currentQuery, handleSearch])

  const handleSubcategoryChange = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory)
    setSelectedSubSubcategory('')
    setActiveFilters({})
    
    handleSearch(currentQuery, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      subcategory: subcategory || undefined
    })
  }, [currentQuery, selectedCategory, handleSearch])

  const handleFiltersChange = useCallback((filters: Record<string, any>) => {
    setActiveFilters(filters)
    
    handleSearch(currentQuery, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      subcategory: selectedSubcategory || undefined,
      subsubcategory: selectedSubSubcategory || undefined,
      ...filters
    })
  }, [currentQuery, selectedCategory, selectedSubcategory, selectedSubSubcategory, handleSearch])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
    setSortDropdownOpen(false)
    
    handleSearch(currentQuery, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      subcategory: selectedSubcategory || undefined,
      subsubcategory: selectedSubSubcategory || undefined
    })
  }, [currentQuery, selectedCategory, selectedSubcategory, selectedSubSubcategory, handleSearch])

  // Cargar resultados iniciales basado en parámetros URL (solo una vez)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const query = urlParams.get('q')
      const category = urlParams.get('category')
      
      if (query || category) {
        // Actualizar estado de categoría si viene de URL
        if (category && category !== 'all') {
          setSelectedCategory(category)
        }
        handleSearch(query || '', {
          category: category || undefined
        })
      } else {
        // Cargar publicaciones recientes sin filtro
        handleSearch('', {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar el componente

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setSelectedSubcategory('')
    setSelectedSubSubcategory('')
    setActiveFilters({})
    handleSearch(currentQuery, {})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Enhanced Search Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-30 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 overflow-visible">
          
          {/* Main Search Bar */}
          <div className="mb-1 search-input">
            <RealTimeSearchEngine 
              onSearch={handleSearch}
              variant="page"
              showFilters={true}
              placeholder="¿Qué necesitas hoy? Encuentra oportunidades cerca de ti..."
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
            />
          </div>

          {/* Filters Row Mejorado - Fusionando selectores con estado activo */}
          {(selectedCategory && selectedCategory !== 'all') && (
            <div className="pb-1 overflow-visible">
              <div className="flex items-center gap-3 overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent justify-start md:justify-center">
                {/* Selector de Subcategorías */}
                <div className="flex-shrink-0">
                  <EnhancedFilterSelector
                    label="Subcategoría"
                    value={selectedSubcategory}
                    options={getSubcategories(selectedCategory).map(sub => ({ value: sub.id, label: sub.name }))}
                    onChange={(value) => handleSubcategoryChange(value || '')}
                    placeholder="Todas las subcategorías"
                  />
                </div>

                {/* Filtros dinámicos según categoría */}
                {(() => {
                  const categoryConfig = filtersByCategory[selectedCategory]
                  if (!categoryConfig) return null
                  
                  const selectFilters = categoryConfig.sections
                    .flatMap(section => section.filters)
                    .filter(filter => filter.type === 'select')
                    .slice(0, 4)
                  
                  return selectFilters.map(filter => (
                    <div key={filter.id} className="flex-shrink-0">
                      <EnhancedFilterSelector
                        label={filter.label}
                        value={activeFilters[filter.id]}
                        options={filter.options || []}
                        onChange={(value) => {
                          const newFilters = { ...activeFilters }
                          if (value === null || value === undefined || value === '') {
                            delete newFilters[filter.id]
                          } else {
                            newFilters[filter.id] = value
                          }
                          handleFiltersChange(newFilters)
                        }}
                        placeholder={`Cualquier ${filter.label.toLowerCase()}`}
                      />
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pt-2 pb-2">
        
        {/* Welcome State */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
              >
                <span className="text-6xl">🔍</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
              >
                Búsqueda Inteligente
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed"
              >
                Encuentra exactamente lo que buscas con nuestro buscador en tiempo real. 
                <br />Sugerencias inteligentes, resultados instantáneos y filtros avanzados.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left"
              >
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Tiempo Real</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Resultados mientras escribes, sin esperas
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">IA Inteligente</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Sugerencias que aprenden de tus búsquedas
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Filtros Avanzados</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Encuentra exactamente lo que necesitas
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Recomendaciones personalizadas
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            {/* Breadcrumbs en área de resultados */}
            {(selectedCategory && selectedCategory !== 'all') && (
              <div className="mb-2">
                <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    Inicio
                  </button>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => {
                      setSelectedSubcategory('')
                      setSelectedSubSubcategory('')
                    }}
                    className={`transition-colors ${
                      !selectedSubcategory 
                        ? 'text-teal-600 dark:text-teal-400 font-medium' 
                        : 'hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    {(() => {
                      const categoryNames: Record<string, string> = {
                        'inmuebles': 'Inmuebles',
                        'vehiculos': 'Vehículos', 
                        'empleos': 'Empleos',
                        'servicios': 'Servicios',
                        'productos': 'Productos',
                        'eventos': 'Eventos',
                        'comunidad': 'Comunidad',
                        'negocios': 'Negocios'
                      }
                      return categoryNames[selectedCategory] || selectedCategory
                    })()}
                  </button>
                  {selectedSubcategory && (
                    <>
                      <span className="text-gray-400">/</span>
                      <button
                        onClick={() => setSelectedSubSubcategory('')}
                        className={`transition-colors ${
                          !selectedSubSubcategory 
                            ? 'text-teal-600 dark:text-teal-400 font-medium' 
                            : 'hover:text-teal-600 dark:hover:text-teal-400'
                        }`}
                      >
                        {getSubcategories(selectedCategory).find(sub => sub.id === selectedSubcategory)?.name}
                      </button>
                    </>
                  )}
                  {selectedSubSubcategory && (
                    <>
                      <span className="text-gray-400">/</span>
                      <span className="text-teal-600 dark:text-teal-400 font-medium">
                        {selectedSubSubcategory}
                      </span>
                    </>
                  )}
                </nav>
              </div>
            )}

            {/* Search Stats and Controls - Layout responsive mejorado */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Título y stats - Siempre en la parte superior */}
              <div className="flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuery ? `Resultados para "${currentQuery}"` : 'Todas las oportunidades'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {isLoading ? 'Buscando...' : `${totalCount.toLocaleString()} resultados encontrados`}
                </p>
              </div>

              {/* Controles - Botones de vista y ordenar en la misma línea */}
              <div className="flex items-center gap-3 lg:flex-shrink-0">
                {/* View Mode Toggles */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-teal-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label="Vista en cuadrícula"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-teal-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label="Vista en lista"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Enhanced Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm"
                  >
                    <span className="text-sm">
                      {sortOptions.find(opt => opt.value === sortBy)?.icon} 
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                      {sortOptions.find(opt => opt.value === sortBy)?.label}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                      Ordenar
                    </span>
                    <ChevronDownIcon 
                      className={`w-4 h-4 text-gray-500 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {sortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value as SortOption)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            sortBy === option.value 
                              ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="text-base">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                          {sortBy === option.value && (
                            <span className="ml-auto text-teal-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Buscando los mejores resultados...</p>
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
              <div className={viewMode === 'grid' ? 'publications-grid' : 'publications-list'}>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PublicationCard
                      publication={convertToPublicationData(result)}
                      viewMode={viewMode}
                      onPublicationClick={() => {
                        // Navigate to publication detail
                        window.location.href = `/anuncios/${result.id}/${result.title.replace(/\s+/g, '-').toLowerCase()}`
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results - UX/UI Expert Version */}
            {!isLoading && results.length === 0 && hasSearched && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                {/* Icon with subtle animation */}
                <div className="relative w-28 h-28 mb-7 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-100/80 via-blue-100/60 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 shadow-lg animate-pulse-slow" />
                  <span className="relative z-10 text-5xl select-none" aria-label="Sin resultados">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <circle cx="28" cy="28" r="28" fill="url(#sadGradient)" />
                      <g>
                        <ellipse cx="28" cy="34" rx="8" ry="4" fill="#FBBF24" opacity="0.18"/>
                        <circle cx="28" cy="26" r="12" fill="#FBBF24"/>
                        <ellipse cx="24" cy="25" rx="1.5" ry="2" fill="#92400E"/>
                        <ellipse cx="32" cy="25" rx="1.5" ry="2" fill="#92400E"/>
                        <path d="M24 30c1.5 1.5 6.5 1.5 8 0" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round"/>
                      </g>
                      <defs>
                        <linearGradient id="sadGradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#F0FDFA"/>
                          <stop offset="1" stopColor="#A7F3D0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  Sin coincidencias por ahora
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {currentQuery
                    ? (
                        <>
                          No encontramos anuncios que coincidan con <span className="font-semibold text-teal-700 dark:text-teal-300">"{currentQuery}"</span>.
                          <br />
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            Prueba ajustando tus filtros, usando palabras clave diferentes o explora todas las oportunidades disponibles.
                          </span>
                        </>
                      )
                    : (
                        <>
                          Actualmente no hay anuncios publicados en esta categoría o filtro.
                          <br />
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            ¡Vuelve pronto o revisa otras categorías para encontrar lo que buscas!
                          </span>
                        </>
                      )
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      handleSearch('', {})
                      clearAllFilters()
                    }}
                    className="px-7 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-semibold text-base shadow-md hover:shadow-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
                  >
                    Ver todas las oportunidades
                  </button>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-7 py-3 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-teal-700 dark:text-teal-300 rounded-xl font-medium text-base shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150"
                  >
                    Ajustar búsqueda
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuscadorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Buscador
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparando la mejor experiencia de búsqueda...
          </p>
        </div>
      </div>
    }>
              <SearchPageContent />
        {/* Componentes de prueba removidos - La funcionalidad de voz está completamente integrada */}
    </Suspense>
  )
}