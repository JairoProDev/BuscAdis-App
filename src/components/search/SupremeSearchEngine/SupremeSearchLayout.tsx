'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import SupremeSearchEngine from './index'
import SearchResults from './SearchResults'

interface SupremeSearchLayoutProps {
  className?: string
}

export default function SupremeSearchLayout({
  className = ''
}: SupremeSearchLayoutProps) {
  const { searchState, updateSearch } = useSearch()
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async (query: string, options: Record<string, unknown> = {}) => {
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      // Usar la API real de publicaciones
      const { mongoFetch } = await import('@/lib/mongodb-browser')
      
      const searchParams: Record<string, string> = {
        sortBy: 'recent'
      }
      
      if (query.trim()) searchParams.query = query
      if (options.category) searchParams.category = options.category
      if (options.subcategory) searchParams.subcategory = options.subcategory
      if (options.location) searchParams.location = options.location
      
      console.log('Supreme Search: Searching with params:', searchParams)
      
      const response = await mongoFetch('/api/publications', { queryParams: searchParams })
      
      if (!response.publications) {
        throw new Error(response.errorFriendly || 'No se encontraron resultados')
      }
      
      // Adaptar resultados de la API al formato esperado
      const adaptedResults = response.publications.map((pub: Record<string, unknown>, i: number) => ({
        id: pub._id || `result-${Date.now()}-${i}`,
        title: pub.title || 'Sin título',
        description: pub.description || '',
        price: pub.price || pub.amount || 0,
        location: typeof pub.location === 'object' 
          ? `${pub.location.district || pub.location.province || pub.location.city || 'Sin ubicación'}` 
          : pub.location || 'Sin ubicación',
        category: pub.categorySlug || pub.category || 'general',
        image: pub.images?.[0] || `/images/placeholder/listing-${(i % 10) + 1}.jpg`,
        publishedAt: pub.createdAt || pub.created_at || new Date().toISOString(),
        views: Math.floor(Math.random() * 1000) + 10, // Temporal hasta que tengamos views reales
        isFavorite: false,
        isPromoted: pub.premium || false,
        isPremium: pub.premium || false,
        condition: pub.condition || 'Sin especificar',
        tags: []
      }))

      setResults(adaptedResults)
      setTotalCount(response.total || adaptedResults.length)
      
      console.log(`Supreme Search: Found ${adaptedResults.length} results`)
      
    } catch (error) {
      console.error('Error in search:', error)
      setResults([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFilterChange = useCallback((filters: Record<string, unknown>) => {
    // Si ya hay una búsqueda activa, aplicar filtros
    if (hasSearched && searchState.query) {
      handleSearch(searchState.query, {
        ...filters,
        category: searchState.category,
        subcategory: searchState.subcategory,
        location: searchState.location
      })
    }
  }, [hasSearched, searchState, handleSearch])

  // Cargar resultados iniciales
  useEffect(() => {
    // Si hay parámetros de búsqueda en la URL, ejecutar búsqueda automáticamente
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const query = urlParams.get('q')
      const category = urlParams.get('category')
      
      if (query || category) {
        handleSearch(query || '', {
          category: category || searchState.category,
          subcategory: searchState.subcategory,
          location: searchState.location
        })
      } else {
        // Cargar publicaciones iniciales sin filtro
        handleSearch('', {})
      }
    }
  }, []) // Solo ejecutar una vez al montar

  const handleSortChange = useCallback((sort: string) => {
    // Simular ordenamiento
    const sortedResults = [...results].sort((a, b) => {
      switch (sort) {
        case 'date':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case 'price-asc':
          return (a.price || 0) - (b.price || 0)
        case 'price-desc':
          return (b.price || 0) - (a.price || 0)
        case 'views':
          return b.views - a.views
        default:
          return 0
      }
    })
    setResults(sortedResults)
  }, [results])

  const handleViewModeChange = useCallback((mode: 'grid' | 'list' | 'map') => {
    setViewMode(mode)
  }, [])

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Search Engine - Sticky */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SupremeSearchEngine 
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            variant="page"
            showFilters={true}
          />
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
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              >
                <span className="text-6xl">🚀</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Buscador Supremo
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                La experiencia de búsqueda más avanzada y completa. Encuentra exactamente lo que buscas con 
                inteligencia artificial, reconocimiento de voz, búsqueda por imagen y filtros inteligentes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Búsqueda Inteligente</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Resultados en tiempo real con IA que entiende exactamente lo que necesitas
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎤</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Múltiples Métodos</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Busca por voz, imagen, texto o simplemente describe lo que quieres
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Súper Rápido</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Resultados instantáneos mientras escribes, sin esperas ni demoras
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Consejo</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Comienza escribiendo lo que buscas en la barra superior. También puedes usar el micrófono para buscar por voz 
                  o la cámara para buscar por imagen. ¡Los resultados aparecerán al instante!
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SearchResults
              results={results}
              isLoading={isLoading}
              totalCount={totalCount}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onSortChange={handleSortChange}
            />
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
              />
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
              >
                Búsqueda Exhaustiva en Progreso
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 dark:text-gray-400"
              >
                Analizando miles de publicaciones para encontrar los mejores resultados...
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 grid grid-cols-3 gap-4 text-center"
              >
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-xs text-gray-500">Publicaciones escaneadas</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">AI</div>
                  <div className="text-xs text-gray-500">Análisis inteligente</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-purple-600">⚡</div>
                  <div className="text-xs text-gray-500">Optimización automática</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 