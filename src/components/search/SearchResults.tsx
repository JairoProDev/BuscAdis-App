'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  FireIcon,
  MapPinIcon,
  MagnifyingGlassIcon as SearchIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid'
import { SparklesIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import useMediaQuery from '@/hooks/useMediaQuery'
import { generateSeoUrl } from '@/utils/url'
import { toast } from 'react-hot-toast'
import { HeartOutline } from '@/components/icons/Heart'
import { BookmarkOutline } from '@/components/icons/Bookmark'

export interface Publication {
  id: string
  title: string
  description: string
  price: number
  currency: string
  categorySlug: string
  location: ExtendedLocation | string  // Update to use ExtendedLocation
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
  subcategorySlug?: string
  subSubcategorySlug?: string
  contactEmail?: string
}

export interface SearchResultsProps {
  results: Publication[]
  loading: boolean
  highlightNew?: boolean
  showInteractionButtons?: boolean
  showMap?: boolean
  activeCategory?: string
  viewType?: 'grid' | 'list' | 'map'
  hasMore?: boolean // Used in previous implementation for infinite loading, kept for API compatibility
  onPublicationClick?: (publication: Publication, e: React.MouseEvent<HTMLAnchorElement>) => void
}

// Define interface for location fields
interface ExtendedLocation {
  city?: string;
  region?: string;
  district?: string;
  province?: string;
  address?: string;
  neighborhood?: string;
}

// Formato de precio
function formatPrice(price: number, currency: string = 'PEN'): string | null {
  if (!price) return null; // Return null instead of "Precio a consultar"
  
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

// Helper function to get category-specific default image
const getDefaultImageForCategory = (categorySlug?: string): string => {
  switch (categorySlug) {
    case 'vehiculos': return '/images/placeholder/vehiculos.jpg';
    case 'inmuebles': return '/images/placeholder/inmuebles.jpg';
    case 'empleos': return '/images/placeholder/empleos.jpg';
    case 'servicios': return '/images/placeholder/servicios.jpg';
    case 'productos': return '/images/placeholder/productos.jpg';
    case 'eventos': return '/images/placeholder/eventos.jpg';
    case 'negocios': return '/images/placeholder/negocios.jpg';
    case 'comunidad': return '/images/placeholder/comunidad.jpg';
    // Add more cases as needed
    default: return '/images/placeholder-buscadis.jpg'; // Generic fallback
  }
};

// Format full location with all available fields
const formatFullLocation = (location: Publication['location']): string => {
  if (!location) return 'Ubicación no especificada';
  
  // Handle string locations
  if (typeof location === 'string') return location;
  
  const locationParts = [];
  if (location.district) locationParts.push(location.district);
  if (location.neighborhood) locationParts.push(location.neighborhood);
  if (location.address) locationParts.push(location.address);
  if (location.city) locationParts.push(location.city);
  if (location.province) locationParts.push(location.province);
  if (location.region) locationParts.push(location.region);
  
  return locationParts.length > 0 ? locationParts.join(', ') : 'Ubicación no especificada';
};

export default function SearchResults({
  results: initialResults,
  loading: initialLoading,
  highlightNew = true,
  showInteractionButtons = true,
  activeCategory,
  viewType = 'grid',
  onPublicationClick
}: SearchResultsProps) {
  // Estado para interacciones del usuario (likes, guardados)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  // Referencia para los resultados más nuevos
  const [newItemsCount, setNewItemsCount] = useState(0)
  
  // Nuevos estados para el scroll infinito - Managed by parent now mostly
  const [allResults, setAllResults] = useState<Publication[]>(initialResults || [])
  const [loading, setLoading] = useState(initialLoading)
  
  // Media queries
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  
  // Calcular cuántos ítems mostrar en cada fila según el tamaño de pantalla
  const getGridCols = () => {
    if (isLg) return 3  // lg:grid-cols-3
    if (isMd) return 2  // md:grid-cols-2
    return 2            // mobile: grid-cols-2
  }
  
  // Actualizar resultados cuando cambian los resultados iniciales
  useEffect(() => {
    if (!initialResults) {
      // Handle case where initialResults might be undefined
      setAllResults([]); // Clear local state if initial is undefined
      return;
    }
    if (initialResults.length === 0) {
      // If parent sends an empty array (e.g., after filters yield nothing)
      setAllResults([]); // Update local state to be empty
      return;
    }

    console.log('SearchResults: Updating results from props, count:', initialResults.length);
    setAllResults(initialResults);
    setLoading(initialLoading);
  }, [initialResults, initialLoading]);
  
  // Load likes and saved items from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const likedFromStorage = localStorage.getItem('likedItems')
      const savedFromStorage = localStorage.getItem('savedItems')
      
      if (likedFromStorage) {
        try {
          setLikedItems(new Set(JSON.parse(likedFromStorage)))
        } catch (error) {
          console.error('Error parsing liked items from localStorage:', error)
        }
      }
      
      if (savedFromStorage) {
        try {
          setSavedItems(new Set(JSON.parse(savedFromStorage)))
        } catch (error) {
          console.error('Error parsing saved items from localStorage:', error)
        }
      }
    }
  }, [])

  // Actualizar localStorage cuando cambien likes o guardados
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('likedItems', JSON.stringify([...likedItems]))
    }
  }, [likedItems])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedItems', JSON.stringify([...savedItems]))
    }
  }, [savedItems])

  // Detectar nuevos resultados
  useEffect(() => {
    // Simular algunos elementos como "nuevos"
    if (highlightNew && allResults.length > 0) {
      // Considera "nuevos" el 20% de los resultados más recientes
      const newCount = Math.max(1, Math.floor(allResults.length * 0.2))
      setNewItemsCount(newCount)
    } else {
      setNewItemsCount(0)
    }
  }, [allResults, highlightNew])
  
  // Gestionar interacciones (like, guardar)
  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
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
  // Improved handleChangeViewMode function with smooth transitions
  const handleChangeViewMode = (mode: 'grid' | 'list') => {
    // No hacemos nada aquí porque ahora el viewType es manejado por el componente padre
    console.log('View mode changed to', mode);
    // El modo de vista ahora es controlado por el padre
  };
  
  // Renderizar item en vista de cuadrícula
  const renderGridItem = (publication: Publication, index: number) => {
    // Validate publication ID exists
    if (!publication || !publication.id) {
      console.warn('Publication or publication ID is missing', publication);
      return null;
    }

    console.log(`Rendering Card ID: ${publication.id}, Contact Phone: ${publication.contactPhone}`);
    
    const isNew = index < newItemsCount;
    const isPremium = publication.premium;
    const isLiked = likedItems.has(publication.id);
    const isSaved = savedItems.has(publication.id);
    
    // Robust image check
    const images = publication.images;
    const hasImages = Array.isArray(images) && images.length > 0 && images[0] !== '/images/placeholder-image.jpg' && images[0] !== '/images/defaults/default.jpg';
    const imageUrl = hasImages ? images[0] : getDefaultImageForCategory(publication.categorySlug);
    
    // Log the publication object to inspect its structure
    if (index === 0) { // Log only the first item
        console.log("--- Publication Data (Grid Item) ---", JSON.stringify(publication, null, 2));
    }

    // Ensure we have the correct category levels
    const categorySlug = publication.categorySlug || '';
    const subcategorySlug = publication.subcategory || publication.subcategorySlug || '';
    const subsubcategorySlug = publication.subsubcategory || publication.subSubcategorySlug || '';

    // Generate SEO-friendly URL with all category levels
    const seoUrl = generateSeoUrl(
      publication.id,
      publication.title || '',
      publication.slug,
      categorySlug,
      subcategorySlug,
      subsubcategorySlug,
      !publication.slug
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
      console.log('Opening WhatsApp with phone:', cleanPhone);
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
          onClick={(e) => {
            if (onPublicationClick) {
              onPublicationClick(publication, e);
            } else {
              console.warn("onPublicationClick handler not provided to SearchResults");
              e.preventDefault();
            }
          }}
        >
          {/* Image Container */}
          <div className="image-container">
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30 z-10" />
            <Image
              src={imageUrl}
              alt={`Imagen de ${publication.title || 'publicación'}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => { 
                console.log(`Image load error for publication ${publication.id}:`, e);
                e.currentTarget.src = '/images/placeholder-buscadis.jpg'; 
              }}
              priority={index < 4} // Prioritize loading first 4 images
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
              {/* Subsubcategory Badge (Always shown if available) */}
              {publication.subsubcategory && (
                <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  {publication.subsubcategory}
                </span>
              )}
              
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
            
            {/* Botones de interacción (like/save) */}
            {showInteractionButtons && (
              <div className="absolute top-2 right-2 flex gap-2 z-20">
                <button
                  className={`flex items-center justify-center transition-all rounded-full w-8 h-8 ${
                    isLiked
                      ? "bg-red-500 text-white"
                      : "text-white border border-transparent hover:border-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleLike(publication.id);
                  }}
                  aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
                >
                  {isLiked ? (
                    <HeartSolid className="w-5 h-5" />
                  ) : (
                    <HeartOutline className="w-5 h-5" />
                  )}
                </button>

                <button
                  className={`flex items-center justify-center transition-all rounded-full w-8 h-8 ${
                    isSaved
                      ? "bg-blue-500 text-white"
                      : "text-white border border-transparent hover:border-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleSave(publication.id);
                  }}
                  aria-label={isSaved ? "Quitar de guardados" : "Guardar publicación"}
                >
                  {isSaved ? (
                    <BookmarkSolid className="w-5 h-5" />
                  ) : (
                    <BookmarkOutline className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
            
            {/* Precio o botón de WhatsApp si no hay precio */}
            <div className="absolute bottom-2 right-2 z-10">
              {formatPrice(publication.price, publication.currency) ? (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  {formatPrice(publication.price, publication.currency)}
                </span>
              ) : (
                publication.contactPhone && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center"
                    aria-label="Contactar por WhatsApp"
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    <span>Consultar</span>
                  </button>
                )
              )}
            </div>
            
            {/* WhatsApp button (always visible) */}
            {publication.contactPhone && (
              <button
                onClick={handleWhatsAppClick}
                className="absolute bottom-2 left-2 z-20 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center"
                aria-label="Contactar por WhatsApp"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                <span>Contactar</span>
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="content">
            <div>
              <h3>{publication.title}</h3>
              <p className="description">{publication.description}</p>
            </div>
            
            <div className="footer">
              <div className="location">
                <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span title={formatFullLocation(publication.location)}>
                  {formatFullLocation(publication.location)}
                </span>
              </div>
              
              <span className="date">
                {formatRelativeTime(publication.createdAt)}
              </span>
            </div>
          </div>
        </a>
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
    
    // Robust image check
    const images = publication.images;
    const hasImages = Array.isArray(images) && images.length > 0 && images[0] !== '/images/placeholder-image.jpg' && images[0] !== '/images/defaults/default.jpg';
    const imageUrl = hasImages ? images[0] : getDefaultImageForCategory(publication.categorySlug);

    // Log the publication object to inspect its structure
    if (index === 0) { // Log only the first item
        console.log("--- Publication Data (List Item) ---", JSON.stringify(publication, null, 2));
    }

    // Ensure we have the correct category levels
    const categorySlug = publication.categorySlug || '';
    const subcategorySlug = publication.subcategory || publication.subcategorySlug || '';
    const subsubcategorySlug = publication.subsubcategory || publication.subSubcategorySlug || '';

    // Generate SEO-friendly URL with all category levels
    const seoUrl = generateSeoUrl(
      publication.id,
      publication.title || '',
      publication.slug,
      categorySlug,
      subcategorySlug,
      subsubcategorySlug,
      !publication.slug
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
        key={`list-item-${publication.id}-${index}`}
        layoutId={`publication-list-${publication.id}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="relative w-full list-view-item"
      >
        <a 
          href={seoUrl} 
          className="block w-full"
          onClick={(e) => {
            if (onPublicationClick) {
              onPublicationClick(publication, e);
            } else {
              console.warn("onPublicationClick handler not provided to SearchResults");
              e.preventDefault();
            }
          }}
        >
          <div className="relative flex flex-row bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
            {/* Imagen */}
            <div className="relative w-40 sm:w-48 flex-shrink-0 overflow-hidden h-auto image-container">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/60 z-10" />
              <div className="relative w-full h-full min-h-[160px]">
                <Image
                  src={imageUrl}
                  alt={`Imagen de ${publication.title || 'publicación'}`}
                  fill
                  sizes="(max-width: 640px) 30vw, 120px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { 
                    console.log(`Image load error for publication ${publication.id}:`, e);
                    e.currentTarget.src = '/images/placeholder-buscadis.jpg'; 
                  }}
                  priority={index < 4} // Prioritize loading first 4 images
                />
              </div>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                {/* Subsubcategory Badge (Always shown if available) */}
                {publication.subsubcategory && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg">
                    {publication.subsubcategory}
                  </span>
                )}
                
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
                  <span className="hidden sm:inline">Contactar</span>
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
                  <span className="truncate max-w-[150px]" title={formatFullLocation(publication.location)}>
                    {formatFullLocation(publication.location)}
                  </span>
                </div>
                
                {formatPrice(publication.price, publication.currency) ? (
                  <span className="bg-slate-900/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                    {formatPrice(publication.price, publication.currency)}
                  </span>
                ) : (
                  publication.contactPhone && (
                    <button
                      onClick={handleWhatsAppClick}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-lg shadow-sm flex items-center"
                      aria-label="Contactar por WhatsApp"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      </svg>
                      <span>Consultar precio</span>
                    </button>
                  )
                )}
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
                <div className="absolute top-2 right-2 flex gap-1 z-20">
                  <button
                    className={`flex items-center justify-center px-3 py-1.5 rounded transition-all ${
                      isLiked ? 'text-red-500 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800/30' : 'text-slate-500 bg-slate-100 dark:bg-slate-800/50 dark:border-slate-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleLike(publication.id);
                    }}
                    aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
                  >
                    {isLiked ? <HeartSolid className="w-5 h-5" /> : <HeartOutline className="w-5 h-5" />}
                  </button>
                  
                  <button
                    className={`flex items-center justify-center px-3 py-1.5 rounded transition-all ${
                      isSaved ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30' : 'text-slate-500 bg-slate-100 dark:bg-slate-800/50 dark:border-slate-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleSave(publication.id);
                    }}
                    aria-label={isSaved ? "Quitar de guardados" : "Guardar publicación"}
                  >
                    {isSaved ? <BookmarkSolid className="w-5 h-5" /> : <BookmarkOutline className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </a>
      </motion.div>
    )
  }
  
  if (loading && allResults.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-40 bg-slate-700 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {Array.from({ length: getGridCols() * 2 }).map((_, index) => (
            <div key={index} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg h-auto animate-pulse publication-card">
              <div className="h-48 bg-slate-700 relative">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent shimmer"></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-700 rounded-full w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add this CSS to the globals.css file for the shimmer effect */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .shimmer {
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </div>
    )
  }
  
  return (
    <div>
      {/* Toggle de vista (grid/list) */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button 
            className={`p-2 rounded ${viewType === 'grid' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => handleChangeViewMode('grid')}
            aria-label="Ver en cuadrícula"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button 
            className={`p-2 rounded ${viewType === 'list' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => handleChangeViewMode('list')}
            aria-label="Ver en lista"
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toggle para resultados recientes (solo si hay resultados nuevos) */}
      {/*
      {newItemsCount > 0 && (
        <div className="mb-4">
          <button 
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Mostrar {newItemsCount} {newItemsCount === 1 ? 'resultado' : 'resultados'} recientes</span>
          </button>
        </div>
      )}
      {/* Estado de carga */}
      {loading && allResults.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-slate-400">Cargando resultados...</p>
        </div>
      )}

      {/* Mensaje de no resultados */}
      {!loading && allResults.length === 0 && (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-slate-700/50 rounded-full">
              <SearchIcon className="w-10 h-10 text-slate-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No se encontraron resultados</h3>
          <p className="text-slate-400 mb-4">
            Intenta con otros términos de búsqueda o filtros diferentes.
          </p>
          
          {activeCategory && (
            <p className="text-teal-400">
              Estás buscando en la categoría <span className="font-semibold">{activeCategory}</span>
            </p>
          )}
        </div>
      )}

      {/* Resultados en cuadrícula o lista */}
      {!loading && allResults.length > 0 && (
        <AnimatePresence>
          {viewType === 'grid' ? (
            <LayoutGroup>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid grid-cols-2 md:grid-cols-${getGridCols()} gap-4`}
              >
                {allResults.map((publication, index) => renderGridItem(publication, index))}
              </motion.div>
            </LayoutGroup>
          ) : (
            <LayoutGroup>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
              >
                {allResults.map((publication, index) => renderListItem(publication, index))}
              </motion.div>
            </LayoutGroup>
          )}
        </AnimatePresence>
      )}

      {/* "Cargar más" indicator */}
      {loading && allResults.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      )}
    </div>
  )
}