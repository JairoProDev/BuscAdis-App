'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon, 
  ClockIcon,
  MapPinIcon,
  Squares2X2Icon, 
  ListBulletIcon,
  HeartIcon,
  FunnelIcon,
  ShareIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

export interface SearchResult {
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

// Mock data simplificado - solo para desarrollo
const mockResults: SearchResult[] = []

// Move ResultCard component outside to fix ESLint warning
const ResultCard = ({ 
  result, 
  index, 
  viewMode, 
  favorites, 
  toggleFavorite, 
  getCategoryStyle, 
  formatPrice, 
  formatTimeAgo, 
  createWhatsAppMessage 
}: { 
  result: SearchResult; 
  index: number; 
  viewMode: 'grid' | 'list' | 'map'; 
  favorites: Set<string>; 
  toggleFavorite: (id: string) => void; 
  getCategoryStyle: (category: string) => { bgClass: string; icon: React.ReactNode; name: string }; 
  formatPrice: (price: number) => string; 
  formatTimeAgo: (dateString: string) => string; 
  createWhatsAppMessage: (category: string, title: string, resultId: string) => string; 
}) => {
  const isGridView = viewMode === 'grid'
  const isFav = favorites.has(result.id) || result.isFavorite
  const isPremium = result.isPremium || result.isPromoted
  const categoryStyle = getCategoryStyle(result.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden publication-card-hover smooth-transition cursor-pointer ${
        isGridView ? 'flex flex-col' : 'flex flex-row h-40'
      } ${
        isPremium 
          ? 'publication-card-premium shadow-lg shadow-cyan-400/25' 
          : 'shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700'
      }`}
      onClick={() => {
        // Navegar al detalle del anuncio
        console.log('Navigating to:', result.id)
      }}
    >
      {/* Destacado Border - Borde celeste sólido con esquinas redondeadas */}
      {isPremium && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 p-[2px] pointer-events-none">
          <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl" />
        </div>
      )}
      {/* Destacado Badge */}
      {isPremium && (
        <div className="absolute top-3 left-3 z-30">
          <div className="flex items-center bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            <span className="mr-1">⭐</span>
            DESTACADO
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
        className="absolute top-3 right-3 z-30 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {isFav ? (
          <HeartSolidIcon className="h-4 w-4 text-red-500" />
        ) : (
          <HeartIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Image Container */}
      <div className={`relative ${isGridView ? 'aspect-[4/3]' : 'w-36 h-full'} flex-shrink-0 overflow-hidden z-10`}>
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
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <EyeIcon className="h-3 w-3" />
          <span>{result.views}</span>
        </div>

        {/* Price Tag - Solo en grid view */}
        {result.price && isGridView && (
          <div className="absolute bottom-2 left-2 bg-green-600 text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">
            {formatPrice(result.price)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 p-4 ${isGridView ? '' : 'flex flex-col justify-between'} relative z-10`}>
        {/* Title and Price */}
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {result.title}
          </h3>
          
          {result.price && (
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(result.price)}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3 leading-relaxed">
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

          {/* Action Buttons - PERFECTO: Espaciado correcto, botones personalizados */}
          <div className="flex items-center justify-between gap-3 pt-4 px-1 mt-auto border-t border-gray-100 dark:border-gray-700 min-h-[48px]">
            {/* Category Badge - Con icono monocromático y colores personalizados */}
            <span className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-full font-medium capitalize flex-shrink-0 ${categoryStyle.bgClass}`}>
              {categoryStyle.icon}
              <span className="hidden md:inline whitespace-nowrap">{categoryStyle.name}</span>
            </span>

            {/* Share Button - En el centro */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                // Compartir con Web Share API o copiar al portapapeles
                if (navigator.share) {
                  navigator.share({
                    title: result.title,
                    text: result.description,
                    url: window.location.href + '/' + result.id
                  })
                } else {
                  // Fallback: copiar al portapapeles
                  navigator.clipboard.writeText(window.location.href + '/' + result.id)
                  alert('Enlace copiado al portapapeles')
                }
              }}
              className="flex p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
              title="Compartir"
            >
              <ShareIcon className="h-4 w-4" />
            </button>

            {/* Contact Button - Uniforme con mensaje personalizado */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                const phone = '51987654321'
                const message = createWhatsAppMessage(result.category, result.title, result.id)
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition-colors flex-shrink-0"
              title="Contactar por WhatsApp"
            >
              <PhoneIcon className="h-3 w-3" />
              <span className="whitespace-nowrap">Contactar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
}

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
  const [loadingMore, setLoadingMore] = useState(false)

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

  const handleLoadMore = async () => {
    if (!onLoadMore || loadingMore) return
    
    setLoadingMore(true)
    try {
      await onLoadMore()
    } finally {
      setLoadingMore(false)
    }
  }

  // Función para obtener icono y color de categoría
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'empleos':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V5a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          bgClass: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
          name: 'empleos'
        }
      case 'inmuebles':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          ),
          bgClass: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
          name: 'inmuebles'
        }
      case 'vehiculos':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V9a1 1 0 112 0v1h8V9a1 1 0 112 0v1a2 2 0 002-2V6a2 2 0 00-2-2H4zm2.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
            </svg>
          ),
          bgClass: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
          name: 'vehículos'
        }
      case 'servicios':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          ),
          bgClass: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
          name: 'servicios'
        }
      case 'productos':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15v-3a1 1 0 011-1h2a1 1 0 011 1v3H8z" clipRule="evenodd" />
            </svg>
          ),
          bgClass: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
          name: 'productos'
        }
      case 'eventos':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          ),
          bgClass: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
          name: 'eventos'
        }
      case 'negocios':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          ),
          bgClass: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
          name: 'negocios'
        }
      case 'comunidad':
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          ),
          bgClass: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
          name: 'comunidad'
        }
      default:
        return {
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ),
          bgClass: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
          name: category
        }
    }
  }

  // Función para crear mensaje personalizado de WhatsApp
  const createWhatsAppMessage = (category: string, title: string, resultId: string) => {
    const currentUrl = window.location.origin
    const anuncioUrl = `${currentUrl}/adisos/${resultId}/${title.toLowerCase().replace(/\s+/g, '-')}`
    
    return encodeURIComponent(
      `Hola, vi su anuncio de ${category}: ${anuncioUrl} en BuscaDis y me interesó. ¿Podría brindarme más información, por favor?`
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
          {/* Sort */}
          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            aria-label="Ordenar resultados"
          >
            <option value="relevance">Relevancia</option>
            <option value="date">Más recientes</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="views">Más vistos</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              aria-label="Vista en cuadrícula"
              title="Vista en cuadrícula"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              aria-label="Vista en lista"
              title="Vista en lista"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && results.length === 0 ? (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
            : 'space-y-4'
        }`}>
          {Array(8).fill(null).map(() => (
            <div key={`skeleton-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className={`${viewMode === 'grid' ? 'aspect-[4/3]' : 'h-36 flex'}`}>
                {viewMode === 'grid' ? (
                  <div className="w-full bg-gray-200 dark:bg-gray-700" />
                ) : (
                  <>
                    <div className="w-32 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {viewMode === 'grid' && (
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Results Grid/List
        <>
          <AnimatePresence mode="wait">
            <motion.div 
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                  : 'space-y-4'
              }`}
            >
              {results.map((result, index) => (
                <ResultCard 
                  key={result.id} 
                  result={result} 
                  index={index} 
                  viewMode={viewMode} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite} 
                  getCategoryStyle={getCategoryStyle} 
                  formatPrice={formatPrice} 
                  formatTimeAgo={formatTimeAgo} 
                  createWhatsAppMessage={createWhatsAppMessage} 
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More Button */}
          {hasMore && results.length > 0 && (
            <div className="flex justify-center pt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cargando...
                  </>
                ) : (
                  'Cargar más resultados'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FunnelIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Intenta ajustar tus filtros de búsqueda o usa términos más generales para encontrar lo que buscas.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar búsqueda
          </button>
        </motion.div>
      )}
    </div>
  )
} 