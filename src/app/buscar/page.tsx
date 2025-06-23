// src\app\buscar\page.tsx
'use client'

import { Suspense } from 'react'
import RealTimeSearchEngine from '@/components/search/RealTimeSearchEngine'
import SearchResults from '@/components/search/SearchResults'
import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  image: string;
}

function SearchPageContent() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')

  const handleSearch = useCallback(async (query: string, filters: Record<string, any> = {}) => {
    setIsLoading(true)
    setHasSearched(true)
    setCurrentQuery(query)
    
    try {
      const searchParams: Record<string, string> = {
        sortBy: 'recent'
      }
      
      if (query.trim()) searchParams.query = query
      if (filters.category) searchParams.category = filters.category
      if (filters.location) searchParams.location = filters.location
      
      console.log('Searching with params:', searchParams)
      
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
        image: pub.images?.[0] || '/images/placeholder-image.jpg'
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
  }, [])

  // Cargar resultados iniciales basado en parámetros URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const query = urlParams.get('q')
      const category = urlParams.get('category')
      
      if (query || category) {
        handleSearch(query || '', {
          category: category || undefined
        })
      } else {
        // Cargar publicaciones recientes sin filtro
        handleSearch('', {})
      }
    }
  }, [handleSearch])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Engine - Sticky */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <RealTimeSearchEngine 
            onSearch={handleSearch}
            variant="page"
            showFilters={true}
            placeholder="Buscar productos, servicios, empleos..."
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
                <span className="text-6xl">🔍</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Búsqueda Inteligente
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                Encuentra exactamente lo que buscas con nuestro buscador en tiempo real. 
                Sugerencias inteligentes, resultados instantáneos y filtros avanzados.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Búsqueda en Tiempo Real</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Ve resultados mientras escribes. Sin esperas, sin demoras.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sugerencias IA</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Autocompletado inteligente que aprende de tu búsqueda.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Filtros Avanzados</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Refina tu búsqueda con filtros específicos por categoría.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-6">
            {/* Search Stats */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuery ? `Resultados para "${currentQuery}"` : 'Todos los anuncios'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isLoading ? 'Buscando...' : `${totalCount.toLocaleString()} resultados encontrados`}
                </p>
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

            {/* Results Grid */}
            {!isLoading && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg'
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {result.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          S/ {result.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {result.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <span>📍</span>
                        <span>{result.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* No Results */}
            {!isLoading && results.length === 0 && hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
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
                  onClick={() => handleSearch('', {})}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Ver todos los anuncios
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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