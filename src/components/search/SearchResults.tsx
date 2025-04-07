'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  FireIcon,
  BookmarkIcon,
  HeartIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid'
import { SparklesIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'
import useMediaQuery from '@/hooks/useMediaQuery'

export interface Publication {
  id: string
  title: string
  description: string
  price: number
  currency: string
  categorySlug: string
  location: string
  contactName: string
  status: string
  createdAt: string
  images?: string[]
  premium?: boolean
  verified?: boolean
  rating?: number
  views?: number
  likes?: number
  bookmarks?: number
  slug?: string
  categoryName?: string
  distance?: number
  attributes?: Record<string, unknown>
}

interface SearchResultsProps {
  results: Publication[]
  loading: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  highlightNew?: boolean
  showInteractionButtons?: boolean
  showMap?: boolean
  activeCategory?: string
}

// Formato de precio
function formatPrice(price: number, currency: string = 'PEN'): string {
  if (!price) return 'Precio a consultar'
  
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price)
  } catch {
    return `${price.toLocaleString()} ${currency}`
  }
}

// Formato de fecha relativa
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSecs = Math.floor(diffInMs / 1000)
  const diffInMins = Math.floor(diffInSecs / 60)
  const diffInHours = Math.floor(diffInMins / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInSecs < 60) return 'Hace un momento'
  if (diffInMins < 60) return `Hace ${diffInMins} ${diffInMins === 1 ? 'minuto' : 'minutos'}`
  if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  if (diffInDays < 7) return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
  
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export default function SearchResults({
  results,
  loading,
  onLoadMore,
  hasMore = false,
  highlightNew = true,
  showInteractionButtons = true,
  activeCategory
}: SearchResultsProps) {
  // Estado para alternar entre vista de cuadrícula y lista
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // Estado para interacciones del usuario (likes, guardados)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  // Referencia para los resultados más nuevos
  const [newItemsCount, setNewItemsCount] = useState(0)
  // Referencia para infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  })
  // Media queries
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  
  // Calcular cuántos ítems mostrar en cada fila según el tamaño de pantalla
  const getGridCols = () => {
    if (isLg) return 3  // lg:grid-cols-3
    if (isMd) return 2  // md:grid-cols-2
    return 2            // mobile: grid-cols-2
  }
  
  // Cargar más resultados cuando el elemento de carga está en vista
  useEffect(() => {
    if (inView && !loading && hasMore && onLoadMore) {
      onLoadMore()
    }
  }, [inView, loading, hasMore, onLoadMore])
  
  // Cargar likes y guardados del localStorage al iniciar
  useEffect(() => {
    const loadInteractions = () => {
      try {
        const savedLikes = localStorage.getItem('likedItems')
        const savedBookmarks = localStorage.getItem('savedItems')
        
        if (savedLikes) {
          setLikedItems(new Set(JSON.parse(savedLikes)))
        }
        
        if (savedBookmarks) {
          setSavedItems(new Set(JSON.parse(savedBookmarks)))
        }
      } catch (error) {
        console.error('Error loading user interactions:', error)
      }
    }
    
    loadInteractions()
  }, [])
  
  // Detectar nuevos resultados
  useEffect(() => {
    // Simular algunos elementos como "nuevos"
    if (highlightNew && results.length > 0) {
      // Considera "nuevos" el 20% de los resultados más recientes
      const newCount = Math.max(1, Math.floor(results.length * 0.2))
      setNewItemsCount(newCount)
    } else {
      setNewItemsCount(0)
    }
  }, [results, highlightNew])
  
  // Gestionar interacciones (like, guardar)
  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      
      // Guardar en localStorage
      localStorage.setItem('likedItems', JSON.stringify(Array.from(newSet)))
      return newSet
    })
  }
  
  const toggleSave = (id: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      
      // Guardar en localStorage
      localStorage.setItem('savedItems', JSON.stringify(Array.from(newSet)))
      return newSet
    })
  }
  
  // Marcar elemento como visto al hacer scroll
  const handleItemVisible = (id: string) => {
    setVisibleItems(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      return newSet
    })
  }
  
  // Generar URL amigable para SEO
  const generateSeoUrl = (publication: Publication) => {
    const base = publication.categorySlug || 'anuncio'
    const titleSlug = publication.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
    
    return `/${base}/${publication.id}-${titleSlug}`
  }
  
  // Renderizar item en vista de cuadrícula
  const renderGridItem = (publication: Publication, index: number) => {
    const isNew = index < newItemsCount
    const isPremium = publication.premium
    const isLiked = likedItems.has(publication.id)
    const isSaved = savedItems.has(publication.id)
    
    // Default image if none provided
    const imageUrl = publication.images && publication.images.length > 0
      ? publication.images[0]
      : '/images/placeholder.jpg'
    
    return (
      <motion.div
        key={publication.id}
        layoutId={`publication-${publication.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="relative group"
      >
        <Link href={generateSeoUrl(publication)} className="block">
          <div className="relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-teal-500/20 hover:border-cyan-400/30">
            {/* Imagen principal */}
            <div className="relative h-52 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/60 z-10" />
              <Image
                src={imageUrl}
                alt={publication.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-2 z-20">
                {isPremium && (
                  <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-lg flex items-center">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    Premium
                  </span>
                )}
                
                {isNew && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-lg flex items-center">
                    <FireIcon className="w-3 h-3 mr-1" />
                    Nuevo
                  </span>
                )}
              </div>
              
              {/* Precio */}
              <div className="absolute bottom-2 right-2 z-20">
                <span className="bg-slate-900/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg border border-slate-700/50">
                  {formatPrice(publication.price, publication.currency)}
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white line-clamp-2 mb-1 group-hover:text-teal-300 transition-colors">
                {publication.title}
              </h3>
              
              <p className="text-cyan-100/80 text-sm line-clamp-2 mb-3">
                {publication.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-cyan-300/90">
                  <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[180px]">{publication.location}</span>
                </div>
                
                <span className="text-xs text-teal-300/80">
                  {formatRelativeTime(publication.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Botones de interacción */}
        {showInteractionButtons && (
          <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleLike(publication.id)
              }}
              className={`p-1 rounded-full ${isLiked ? 'bg-red-500' : 'bg-slate-800/90 hover:bg-slate-700/90'} shadow-lg backdrop-blur-sm border border-slate-700/50`}
              aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
            >
              {isLiked ? (
                <HeartSolid className="w-4 h-4 text-white" />
              ) : (
                <HeartIcon className="w-4 h-4 text-white" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleSave(publication.id)
              }}
              className={`p-1 rounded-full ${isSaved ? 'bg-teal-500' : 'bg-slate-800/90 hover:bg-slate-700/90'} shadow-lg backdrop-blur-sm border border-slate-700/50`}
              aria-label={isSaved ? "Guardado" : "Guardar"}
            >
              {isSaved ? (
                <BookmarkSolid className="w-4 h-4 text-white" />
              ) : (
                <BookmarkIcon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        )}
      </motion.div>
    )
  }
  
  // Renderizar item en vista de lista
  const renderListItem = (publication: Publication, index: number) => {
    const isNew = index < newItemsCount
    const isPremium = publication.premium
    const isLiked = likedItems.has(publication.id)
    const isSaved = savedItems.has(publication.id)
    
    // Default image if none provided
    const imageUrl = publication.images && publication.images.length > 0
      ? publication.images[0]
      : '/images/placeholder.jpg'
    
    return (
      <motion.div
        key={publication.id}
        layoutId={`publication-${publication.id}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="relative group"
      >
        <Link href={generateSeoUrl(publication)} className="block">
          <div className="relative flex bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-teal-500/20 hover:border-cyan-400/30">
            {/* Imagen */}
            <div className="relative w-32 sm:w-48 flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/60 z-10" />
              <Image
                src={imageUrl}
                alt={publication.title}
                fill
                sizes="(max-width: 640px) 30vw, 120px"
                className="object-cover h-full transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                {isPremium && (
                  <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg flex items-center">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Premium</span>
                  </span>
                )}
                
                {isNew && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg flex items-center">
                    <FireIcon className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </span>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-teal-300 transition-colors">
                    {publication.title}
                  </h3>
                  
                  <span className="text-xs text-teal-300/80 whitespace-nowrap ml-2">
                    {formatRelativeTime(publication.createdAt)}
                  </span>
                </div>
                
                <p className="text-cyan-100/80 text-sm line-clamp-2 mb-2">
                  {publication.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-cyan-300/90 text-sm">
                  <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{publication.location}</span>
                </div>
                
                <span className="bg-slate-900/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg border border-slate-700/50">
                  {formatPrice(publication.price, publication.currency)}
                </span>
              </div>
              
              {/* Botones de interacción en vista de lista */}
              {showInteractionButtons && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleLike(publication.id)
                    }}
                    className={`p-1 rounded-full ${isLiked ? 'bg-red-500' : 'bg-slate-700/90 hover:bg-slate-600/90'} shadow-lg backdrop-blur-sm border border-slate-600/50`}
                    aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
                  >
                    {isLiked ? (
                      <HeartSolid className="w-4 h-4 text-white" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-white" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleSave(publication.id)
                    }}
                    className={`p-1 rounded-full ${isSaved ? 'bg-teal-500' : 'bg-slate-700/90 hover:bg-slate-600/90'} shadow-lg backdrop-blur-sm border border-slate-600/50`}
                    aria-label={isSaved ? "Guardado" : "Guardar"}
                  >
                    {isSaved ? (
                      <BookmarkSolid className="w-4 h-4 text-white" />
                    ) : (
                      <BookmarkIcon className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }
  
  if (loading && results.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-40 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-slate-700 rounded animate-pulse"></div>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {Array.from({ length: getGridCols() * 2 }).map((_, index) => (
            <div key={index} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg h-80 animate-pulse">
              <div className="h-52 bg-slate-700"></div>
              <div className="p-4 space-y-2">
                <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      {/* Control de vista y resultados */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-slate-400">
            {results.length} resultado{results.length !== 1 ? 's' : ''}
            {activeCategory && <span className="ml-1">en {activeCategory}</span>}
          </span>
          
          {newItemsCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
              <FireIcon className="w-3 h-3 mr-0.5" />
              {newItemsCount} nuevo{newItemsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {/* Controles de vista */}
        <div className="flex items-center gap-2">
          {/* Selector de orden */}
          <select 
            className="bg-slate-700 border border-slate-600 text-slate-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2 pr-8"
            aria-label="Ordenar resultados"
          >
            <option value="recentes">Más recientes</option>
            <option value="relevancia">Más relevantes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
          
          {/* Toggle de vista cuadrícula/lista */}
          <div className="flex rounded-lg overflow-hidden shadow-md">
            <button
              className={`p-2 ${viewMode === 'grid' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Ver en cuadrícula"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              className={`p-2 ${viewMode === 'list' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              onClick={() => setViewMode('list')}
              aria-label="Ver en lista"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Resultados */}
      <LayoutGroup>
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <React.Fragment key="results">
              {viewMode === 'grid' ? (
                <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
                  {results.map((publication, index) => renderGridItem(publication, index))}
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((publication, index) => renderListItem(publication, index))}
                </div>
              )}
              
              {/* Loader de "cargar más" */}
              {hasMore && (
                <div ref={loadMoreRef} className="mt-8 flex justify-center">
                  {loading ? (
                    <div className="p-4 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                    </div>
                  ) : (
                    <button
                      onClick={onLoadMore}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Cargar más resultados
                    </button>
                  )}
                </div>
              )}
            </React.Fragment>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 bg-slate-800 rounded-lg shadow-md border border-teal-500/20"
            >
              <div className="p-4 bg-slate-700/50 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">No se encontraron resultados</h2>
              <p className="text-slate-400 text-center mb-6 max-w-md">
                Intenta modificar tu búsqueda o explora todas las categorías disponibles para encontrar lo que necesitas.
              </p>
              <button
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Ver todos los anuncios
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
} 