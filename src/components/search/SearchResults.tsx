'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
import useMediaQuery from '@/hooks/useMediaQuery'
import PublicationModal from '@/components/search/PublicationModal'
import { generateSeoUrl } from '@/utils/url'
import { toast } from 'react-hot-toast'

export interface Publication {
  id: string
  title: string
  description: string
  price: number
  currency: string
  categorySlug: string
  location: { city: string; region: string } | string  // Allow both object and string format
  contactName: string
  status: string
  createdAt: string
  images?: string[]
  contactPhone?: string
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
  subcategory?: string
  subsubcategory?: string
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
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string>('')
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
 {/* 
  const handleItemVisible = (id: string) => {
    setVisibleItems(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      return newSet
    })
  }
    */}
  // Función para abrir el modal de publicación
  const handleOpenModal = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Validate that the ID exists
    if (!id) {
      console.error('ID de publicación inválido o vacío');
      toast.error('No se pudo abrir esta publicación');
      return;
    }
    
    // Save original URL and update URL for SEO
    setOriginalUrl(window.location.pathname + window.location.search);
    
    // Update browser URL without causing a navigation
    const urlWithModalParam = new URL(window.location.href);
    urlWithModalParam.searchParams.set('modal', id);
    window.history.pushState({ modalOpen: true, id }, '', urlWithModalParam.toString());
    
    // Update state to show the modal
    setSelectedPublicationId(id);
    setModalOpen(true);
  };

  // Función para cerrar el modal de publicación
  const handleCloseModal = () => {
    // Log para depuración
    console.log(`Cerrando modal para publicación ID: ${selectedPublicationId}`);
    
    // Actualizar estados
    setModalOpen(false);
    setSelectedPublicationId(null);
    
    // Remover clase modal-open del body al cerrar
    document.body.classList.remove('modal-open');
    document.documentElement.style.removeProperty('--scrollbar-width');
    
    // Restore the original URL using replaceState
    if (originalUrl) {
      window.history.replaceState({ modalOpen: false }, '', originalUrl);
      setOriginalUrl('');
    } else {
      // Fallback if originalUrl wasn't set (should not happen ideally)
      // Go back might be an option, but replaceState to a sensible default is safer
      const searchParams = window.location.search;
      // Attempt to reconstruct a base path (e.g., search results path)
      // This might need refinement based on your app's routing structure
      const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) || '/'; 
      window.history.replaceState({modalOpen: false}, '', basePath + searchParams);
    }
  };
  
  // Modify the handleChangeViewMode function to fix layout issues
  const handleChangeViewMode = (mode: 'grid' | 'list') => {
    // Don't do anything if we're already in this mode
    if (viewMode === mode) return;
    
    // Set the view mode immediately to prevent additional renders
    setViewMode(mode);
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewMode', mode);
    }
    
    // Let the transition happen naturally via CSS only
    // Avoid DOM manipulation and setTimeout chains which can cause re-render loops
  };
  
  // Renderizar item en vista de cuadrícula
  const renderGridItem = (publication: Publication, index: number) => {
    // Validate publication ID exists
    if (!publication || !publication.id) {
      console.warn('Publication or publication ID is missing', publication);
      return null;
    }

    const isNew = index < newItemsCount;
    const isPremium = publication.premium;
    const isLiked = likedItems.has(publication.id);
    const isSaved = savedItems.has(publication.id);
    
    // Verificar si tiene imágenes
    const hasImages = publication.images && publication.images.length > 0;
    
    // Default image if none provided
    const imageUrl = hasImages && publication.images ? publication.images[0] : '/images/placeholder-buscadis.jpg';
    
    // Generar seoUrl para el enlace
    const seoUrl = generateSeoUrl(
      publication.id,
      publication.title || '',
      publication.categorySlug || '',
      publication.subcategory || null,
      publication.subsubcategory || null,
      false // No incluir título en la URL cuando abrimos el modal
    );

    // Formatear mensaje de WhatsApp
    const formatWhatsAppMessage = () => {
      let message = `Hola, estoy interesado en tu publicación "${publication.title}" de BuscaDis.`;
      
      // Personalizar mensaje según categoría
      if (publication.categorySlug === 'empleos') {
        message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en BuscaDis.`;
      } else if (publication.categorySlug === 'inmuebles') {
        message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en BuscaDis.`;
      } else if (publication.categorySlug === 'vehiculos') {
        message = `Hola, estoy interesado en el vehículo "${publication.title}" que tienes en BuscaDis.`;
      }
      
      return encodeURIComponent(message);
    };

    // Función para abrir WhatsApp
    const handleWhatsAppClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const contactPhone = publication.contactPhone || '';
      if (!contactPhone) {
        toast.error('No hay número de contacto disponible');
        return;
      }
      const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${formatWhatsAppMessage()}`;
      window.open(whatsappUrl, '_blank');
    };
    
    return (
      <motion.div
        key={`grid-item-${publication.id}-${index}`}
        layoutId={`publication-${publication.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="relative w-full h-auto rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 publication-card"
      >
        <a 
          href={seoUrl} 
          className="block w-full h-full"
          onClick={(e) => handleOpenModal(publication.id, e)}
        >
          <div className="relative flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full">
            {/* Imagen siempre se muestra, usando placeholder si no hay imágenes */}
            <div className="relative w-full h-40 overflow-hidden bg-gray-100 dark:bg-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30 z-10" />
              <Image
                src={imageUrl}
                alt={publication.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-110"
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                {isPremium && (
                  <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    <span>Premium</span>
                  </span>
                )}
                
                {isNew && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center">
                    <FireIcon className="w-3 h-3 mr-1" />
                    <span>Nuevo</span>
                  </span>
                )}
              </div>
              
              {/* Precio */}
              <div className="absolute bottom-2 right-2 z-10">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  {formatPrice(publication.price, publication.currency)}
                </span>
              </div>
            </div>
            
            {/* Contenido */}
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">{publication.title}</h3>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                  {publication.description}
                </p>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <div className="flex items-center">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[80px]">
                    {typeof publication.location === 'string' 
                      ? publication.location 
                      : publication.location?.city || 'Ubicación no especificada'}
                  </span>
                </div>
                
                <span className="text-xs">
                  {formatRelativeTime(publication.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </a>
        
        {/* WhatsApp Button */}
        {publication.contactPhone && (
          <button
            onClick={handleWhatsAppClick}
            className="absolute bottom-3 right-3 z-20 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center"
            aria-label="Contactar por WhatsApp"
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            </svg>
            <span>WhatsApp</span>
          </button>
        )}
        
        {/* Botones de interacción */}
        {showInteractionButtons && (
          <div className="absolute top-2 right-2 flex gap-1 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleLike(publication.id);
              }}
              className={`p-1.5 rounded-full ${isLiked ? 'bg-red-500' : 'bg-white/80 hover:bg-white'} shadow-sm backdrop-blur-sm transition-colors`}
              aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
            >
              {isLiked ? (
                <HeartSolid className="w-4 h-4 text-white" />
              ) : (
                <HeartIcon className="w-4 h-4 text-gray-700" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSave(publication.id);
              }}
              className={`p-1.5 rounded-full ${isSaved ? 'bg-blue-500' : 'bg-white/80 hover:bg-white'} shadow-sm backdrop-blur-sm transition-colors`}
              aria-label={isSaved ? "Guardado" : "Guardar"}
            >
              {isSaved ? (
                <BookmarkSolid className="w-4 h-4 text-white" />
              ) : (
                <BookmarkIcon className="w-4 h-4 text-gray-700" />
              )}
            </button>
          </div>
        )}
      </motion.div>
    )
  }
  
  // Renderizar item en vista de lista
  const renderListItem = (publication: Publication, index: number) => {
    // Validate publication ID exists
    if (!publication || !publication.id) {
      console.warn('Publication or publication ID is missing', publication);
      return null;
    }

    const isNew = index < newItemsCount
    const isPremium = publication.premium
    const isLiked = likedItems.has(publication.id)
    const isSaved = savedItems.has(publication.id)
    
    // Verificar si tiene imágenes
    const hasImages = publication.images && publication.images.length > 0;
    
    // Default image if none provided
    const imageUrl = hasImages && publication.images ? publication.images[0] : '/images/placeholder-buscadis.jpg';

    // Formatear mensaje de WhatsApp
    const formatWhatsAppMessage = () => {
      let message = `Hola, estoy interesado en tu publicación "${publication.title}" de BuscaDis.`;
      
      // Personalizar mensaje según categoría
      if (publication.categorySlug === 'empleos') {
        message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en BuscaDis.`;
      } else if (publication.categorySlug === 'inmuebles') {
        message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en BuscaDis.`;
      } else if (publication.categorySlug === 'vehiculos') {
        message = `Hola, estoy interesado en el vehículo "${publication.title}" que tienes en BuscaDis.`;
      }
      
      return encodeURIComponent(message);
    };

    // Función para abrir WhatsApp
    const handleWhatsAppClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const contactPhone = publication.contactPhone || '';
      if (!contactPhone) {
        toast.error('No hay número de contacto disponible');
        return;
      }
      const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${formatWhatsAppMessage()}`;
      window.open(whatsappUrl, '_blank');
    };
    
    return (
      <motion.div
        key={`list-item-${publication.id}-${index}`}
        layoutId={`publication-list-${publication.id}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="relative w-full list-view-item"
      >
        <a 
          href={generateSeoUrl(
            publication.id,
            publication.title || '',
            publication.categorySlug || '',
            publication.subcategory || null,
            publication.subsubcategory || null,
            false // No incluir título en la URL cuando abrimos el modal
          )} 
          className="block w-full"
          onClick={(e) => handleOpenModal(publication.id, e)}
        >
          <div className="relative flex flex-row bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
            {/* Imagen */}
            <div className="relative w-40 sm:w-48 flex-shrink-0 overflow-hidden h-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/60 z-10" />
              <div className="relative w-full h-full min-h-[160px]">
                <Image
                  src={imageUrl}
                  alt={publication.title}
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
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

              {/* WhatsApp Button for List View */}
              {publication.contactPhone && (
                <button
                  onClick={handleWhatsAppClick}
                  className="absolute bottom-2 left-2 z-20 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm flex items-center"
                  aria-label="Contactar por WhatsApp"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 p-4 flex flex-col justify-between min-h-[160px]">
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
                  <span className="truncate max-w-[120px]">
                    {typeof publication.location === 'string'
                      ? publication.location
                      : publication.location?.city || 'Ubicación no especificada'}
                  </span>
                </div>
                
                <span className="bg-slate-900/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                  {formatPrice(publication.price, publication.currency)}
                </span>
              </div>
              
              {/* Logo de Buscadis */}
              <div className="absolute top-2 right-2 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-md">
                  <Image
                    src="/logo.png"
                    alt="Buscadis"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </div>
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
                    className={`p-1 rounded-full ${isLiked ? 'bg-red-500' : 'bg-slate-700/90 hover:bg-slate-600/90'} shadow-lg backdrop-blur-sm`}
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
                    className={`p-1 rounded-full ${isSaved ? 'bg-teal-500' : 'bg-slate-700/90 hover:bg-slate-600/90'} shadow-lg backdrop-blur-sm`}
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
        </a>
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
    <>
      {/* Results list */}
      <div className="relative z-10">
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
              onClick={() => handleChangeViewMode('grid')}
              aria-label="Ver en cuadrícula"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              className={`p-2 ${viewMode === 'list' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              onClick={() => handleChangeViewMode('list')}
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
                <div className="publications-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 grid-auto-rows transition-all duration-300">
                  {results.filter(publication => publication && publication.id).map((publication, index) => (
                    <React.Fragment key={`grid-item-${publication.id}-${index}`}>
                      {renderGridItem(publication, index)}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="publications-list space-y-4 transition-all duration-300">
                  {results.filter(publication => publication && publication.id).map((publication, index) => (
                    <React.Fragment key={`list-item-${publication.id}-${index}`}>
                      {renderListItem(publication, index)}
                    </React.Fragment>
                  ))}
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
    
    {/* Publication Modal */}
    {selectedPublicationId && (
      <PublicationModal
        publicationId={selectedPublicationId}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialData={undefined}
      />
    )}
  </>
)
}