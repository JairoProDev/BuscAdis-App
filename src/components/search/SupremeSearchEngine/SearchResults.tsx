'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  MapIcon,
  FunnelIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

interface SearchResult {
  id: string
  title: string
  description: string
  price?: number
  location: string
  category: string
  image: string
  publishedAt: string
  views: number
  isFavorite: boolean
  isPromoted?: boolean
  isPremium?: boolean
  condition?: string
  tags?: string[]
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading?: boolean
  totalCount?: number
  viewMode?: 'grid' | 'list' | 'map'
  onViewModeChange?: (mode: 'grid' | 'list' | 'map') => void
  onSortChange?: (sort: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

const mockResults: SearchResult[] = Array(20).fill(null).map((_, i) => ({
  id: `result-${i}`,
  title: `Resultado de búsqueda ${i + 1}`,
  description: `Esta es una descripción detallada del resultado ${i + 1}. Incluye características importantes y detalles relevantes.`,
  price: Math.floor(Math.random() * 10000) + 500,
  location: ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura'][Math.floor(Math.random() * 5)],
  category: ['empleos', 'inmuebles', 'vehiculos', 'servicios'][Math.floor(Math.random() * 4)],
  image: `/images/placeholder/listing-${(i % 10) + 1}.jpg`,
  publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  views: Math.floor(Math.random() * 1000) + 10,
  isFavorite: Math.random() > 0.7,
  isPromoted: Math.random() > 0.8,
  isPremium: Math.random() > 0.9,
  condition: ['Nuevo', 'Usado', 'Excelente', 'Bueno'][Math.floor(Math.random() * 4)],
  tags: ['destacado', 'urgente', 'negociable'].filter(() => Math.random() > 0.6)
}))

export default function SearchResults({
  results = mockResults,
  isLoading = false,
  totalCount = 0,
  viewMode = 'grid',
  onViewModeChange,
  onSortChange,
  onLoadMore,
  hasMore = true,
  className = ''
}: SearchResultsProps) {
  const [selectedSort, setSelectedSort] = useState('relevance')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort)
    if (onSortChange) {
      onSortChange(sort)
    }
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoy'
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
    return `Hace ${Math.floor(diffInDays / 30)} meses`
  }

  const ResultCard = ({ result, index }: { result: SearchResult; index: number }) => {
    const isGridView = viewMode === 'grid'
    const isFav = favorites.has(result.id) || result.isFavorite

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${
          isGridView ? 'flex flex-col' : 'flex flex-row'
        } ${result.isPromoted ? 'ring-2 ring-yellow-400' : ''} ${result.isPremium ? 'ring-2 ring-purple-400' : ''}`}
      >
        {/* Image */}
        <div className={`relative ${isGridView ? 'aspect-video' : 'w-48 h-36'} flex-shrink-0`}>
          <Image
            src={result.image}
            alt={result.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/images/placeholder/default.jpg'
            }}
          />
          
          {/* Actions */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(result.id)
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isFav ? (
                <HeartSolidIcon className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Views */}
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <EyeIcon className="h-3 w-3" />
            <span>{result.views}</span>
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 flex-1 ${isGridView ? '' : 'flex flex-col justify-between'}`}>
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {result.title}
            </h3>
            
            {result.price && (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatPrice(result.price)}
              </div>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
            {result.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{result.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatTimeAgo(result.publishedAt)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Resultados de búsqueda
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalCount > 0 ? `${totalCount} resultados encontrados` : `${results.length} resultados`}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sort - Más compacto */}
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-2 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] max-w-[160px]"
            aria-label="Ordenar resultados"
          >
            <option value="relevance">Relevancia</option>
            <option value="date">Recientes</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
            <option value="views">Más vistos</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              aria-label="Vista en cuadrícula"
              title="Vista en cuadrícula"
            >
              <Squares2X2Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              aria-label="Vista en lista"
              title="Vista en lista"
            >
              <ListBulletIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && results.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6' 
            : 'space-y-4'
        }`}>
          {results.map((result, index) => (
            <ResultCard key={result.id} result={result} index={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FunnelIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Intenta ajustar tus filtros de búsqueda o usa términos más generales.
          </p>
        </div>
      )}
    </div>
  )
} 