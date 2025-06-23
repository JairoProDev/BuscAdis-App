// src\app\buscar\page.tsx
'use client'

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  ChevronDownIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline'
import RealTimeSearchEngine from '@/components/search/RealTimeSearchEngine'
import SearchFilters from '@/components/search/SearchFilters'
import PublicationCard from '@/components/publications/PublicationCard'

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

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<string>('')
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

  const activeFilterCount = Object.keys(activeFilters).length + 
    (selectedCategory && selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubcategory ? 1 : 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Enhanced Search Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Main Search Bar */}
          <div className="mb-4">
            <RealTimeSearchEngine 
              onSearch={handleSearch}
              variant="page"
              showFilters={true}
              placeholder="Buscar productos, servicios, empleos..."
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">

            {/* Category-specific Filters */}
            {selectedCategory && selectedCategory !== 'all' && (
              <SearchFilters
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                selectedSubSubcategory={selectedSubSubcategory}
                onFilterChange={handleFiltersChange}
                compact={true}
              />
            )}

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
              >
                Limpiar filtros ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
          <div className="space-y-6">
            {/* Search Stats and Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuery ? `Resultados para "${currentQuery}"` : 'Todas las oportunidades'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isLoading ? 'Buscando...' : `${totalCount.toLocaleString()} resultados encontrados`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggles */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
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
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
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
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  >
                    <span className="text-sm">
                      {sortOptions.find(opt => opt.value === sortBy)?.icon} 
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {sortOptions.find(opt => opt.value === sortBy)?.label}
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
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="text-base">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                          {sortBy === option.value && (
                            <span className="ml-auto text-blue-600">✓</span>
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
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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

            {/* No Results */}
            {!isLoading && results.length === 0 && hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-4xl">😔</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {currentQuery 
                    ? `No hay anuncios que coincidan con "${currentQuery}"`
                    : 'No hay anuncios disponibles en este momento'
                  }
                </p>
                <button
                  onClick={() => {
                    handleSearch('', {})
                    clearAllFilters()
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ver todas las oportunidades
                </button>
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    </Suspense>
  )
}