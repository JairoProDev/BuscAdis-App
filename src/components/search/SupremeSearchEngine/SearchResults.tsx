'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon, 
  ClockIcon,
  MapPinIcon,
  TagIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon, 
  ListBulletIcon,
  HeartIcon,
  FunnelIcon
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
    const isPremium = result.isPremium || result.isPromoted

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden publication-card-hover smooth-transition ${
          isGridView ? 'flex flex-col' : 'flex flex-row'
        } ${
          isPremium 
            ? 'publication-card-premium' 
            : 'shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700'
        }`}
      >
        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <span className="mr-1">👑</span>
              PREMIUM
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            toggleFavorite(result.id)
          }}
          className="absolute top-3 right-3 z-20 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {isFav ? (
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Image Container */}
        <div className={`relative ${isGridView ? 'aspect-[4/3]' : 'w-48 h-36'} flex-shrink-0 overflow-hidden`}>
          <Image
            src={result.image}
            alt={result.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/images/placeholder/default.jpg'
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Views Badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <EyeIcon className="h-3 w-3" />
            <span>{result.views}</span>
          </div>

          {/* Price Tag */}
          {result.price && (
            <div className="absolute bottom-3 left-3 bg-green-600 text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">
              {formatPrice(result.price)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 p-4 ${isGridView ? '' : 'flex flex-col justify-between'}`}>
          {/* Title and Price */}
          <div className="mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {result.title}
            </h3>
            
            {result.price && isGridView && (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {formatPrice(result.price)}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4 leading-relaxed">
            {result.description}
          </p>

          {/* Metadata */}
          <div className="space-y-2 mt-auto">
            {/* Location and Time */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <MapPinIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="truncate">{result.location}</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <ClockIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="whitespace-nowrap">{formatTimeAgo(result.publishedAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {/* Contact Button */}
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition-colors"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  Contactar
                </button>
                
                {/* Share Button */}
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Compartir"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>

              {/* Category Badge */}
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
                {result.category}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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