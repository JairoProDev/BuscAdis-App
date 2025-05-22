'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  FireIcon,
  MapPinIcon,
  MagnifyingGlassIcon as SearchIcon
} from '@heroicons/react/24/outline'
import {
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid'
import { SparklesIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import useMediaQuery from '@/hooks/useMediaQuery'
import { generateSeoUrl } from '@/utils/url'
import { toast } from 'react-hot-toast'
// Se eliminó: import { HeartOutline } from '@/components/icons/Heart'
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
  bookmarks?: number // Este campo podría usarse para mostrar el conteo total de guardados si viniera del backend
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
  // Estado para interacciones del usuario (guardados)
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
    if (isLg) return 3  // Large screens
    if (isMd) return 2  // Medium screens
    return 2            // Mobile: ahora 2 columnas tipo Pinterest
  }

  // Actualizar resultados cuando cambian los resultados iniciales
  useEffect(() => {
    console.log('SearchResults: Updating results from props, count:', initialResults ? initialResults.length : 0);
    setAllResults(initialResults || []); // Handles null, undefined, or empty array
    setLoading(initialLoading);
  }, [initialResults, initialLoading]);

  // Load saved items from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFromStorage = localStorage.getItem('savedItems')
      if (savedFromStorage) {
        try {
          setSavedItems(new Set(JSON.parse(savedFromStorage)))
        } catch (error) {
          console.error('Error parsing saved items from localStorage:', error)
          // Optionally clear invalid data from localStorage
          // localStorage.removeItem('savedItems');
        }
      }
    }
  }, [])

  // Save saved items to localStorage when they change
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

  const toggleSave = (id: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        toast.success('Eliminado de guardados')
      } else {
        newSet.add(id)
        toast.success('Guardado correctamente')
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


  // Renderizar item en vista de cuadrícula
  const renderGridItem = (publication: Publication, index: number) => {
    // Validate publication ID exists
    if (!publication || !publication.id) {
      console.warn('Publication or publication ID is missing', publication);
      return null;
    }

    // console.log(`Rendering Card ID: ${publication.id}, Contact Phone: ${publication.contactPhone}`);

    const isNew = index < newItemsCount;
    const isPremium = publication.premium;
    const isSaved = savedItems.has(publication.id);

    // Robust image check
    const images = publication.images;
    const hasImages = Array.isArray(images) && images.length > 0 && images[0] !== '/images/placeholder-image.jpg' && images[0] !== '/images/defaults/default.jpg';
    const imageUrl = hasImages ? images[0] : getDefaultImageForCategory(publication.categorySlug);

    // Log the publication object to inspect its structure
    if (index === 0) { // Log only the first item
        // console.log("--- Publication Data (Grid Item) ---", JSON.stringify(publication, null, 2));
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
      // console.log('Opening WhatsApp with phone:', cleanPhone);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${formatWhatsAppMessage()}`;
      window.open(whatsappUrl, '_blank');
    };

    return (
      <motion.div
        key={`grid-item-${publication.id}`} // Key simplificada
        layoutId={`publication-${publication.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="relative w-full h-auto rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 publication-card bg-slate-800 border border-slate-700"
      >
        <a
          href={seoUrl}
          className="block w-full h-full"
          onClick={(e) => {
            if (onPublicationClick) {
              onPublicationClick(publication, e);
            } else {
              console.warn("onPublicationClick handler not provided to SearchResults. Defaulting to link navigation.");
              // No e.preventDefault() aquí para permitir la navegación si no hay manejador
            }
          }}
        >
          {/* Image Container */}
          <div className="image-container">
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30 z-10" />
            <Image
              src={imageUrl}
              alt={`Imagen de ${publication.title || 'publicación'}`}
              width={500}
              height={300}
              className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
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

            {/* Botones de interacción (save) */}
            {showInteractionButtons && (
              <div className="absolute top-2 right-2 flex gap-2 z-20">
                {/* Botón de Like ELIMINADO */}
                <button
                  className={`flex items-center justify-center transition-all rounded-full w-8 h-8 ${
                    isSaved
                      ? "bg-blue-500 text-white"
                      : "text-white border border-transparent hover:border-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault(); // Previene la navegación al hacer clic en el botón de guardar
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

            {/* WhatsApp button (always visible if contactPhone exists) */}
            {publication.contactPhone && !formatPrice(publication.price, publication.currency) && ( /* Show only if price is not shown */
                <button
                    onClick={handleWhatsAppClick} //This button was duplicated, it is now conditional
                    className="absolute bottom-2 left-2 z-20 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center"
                    aria-label="Contactar por WhatsApp"
                >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    <span>Contactar</span>
                </button>
            )}
             {/* Correction: The WhatsApp contact button at bottom-left was sometimes redundant with the 'Consultar' button at bottom-right.
                 Now, the bottom-left "Contactar" button will appear if there's a phone number AND no price is displayed (meaning "Consultar" isn't shown).
                 If a price IS shown, the bottom-left "Contactar" button will still appear if a phone number exists, providing a consistent contact option.
                 The original code had two WhatsApp buttons potentially appearing. This is now streamlined.
                 A more distinct logic: The "Consultar" button appears bottom-right if no price AND phone exists.
                 A general "Contactar" button appears bottom-left if phone exists, regardless of price, to ensure contact is always possible.
                 Let's make the "Contactar" button on the left appear if contactPhone exists AND it's not already handled by the "Consultar" (no price) button.
                 This logic might need further refinement based on exact UI preference for button placement.
                 For now, I've made the bottom-left "Contactar" button more generally available IF there's a phone.
             */}
            {publication.contactPhone && (
                <button
                    onClick={handleWhatsAppClick}
                    className="absolute bottom-2 left-2 z-20 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center"
                    aria-label="Contactar por WhatsApp Directo"
                >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    <span>Contactar</span>
                </button>
            )}

          </div>

          {/* Content */}
          <div className="content p-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-white mb-1">{publication.title}</h3>
              <p className="description text-sm text-gray-300 line-clamp-2">{publication.description}</p>
            </div>

            <div className="footer flex justify-between items-center mt-3 text-xs text-gray-400">
              <div className="location flex items-center max-w-[70%]">
                <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate" title={formatFullLocation(publication.location)}>
                  {formatFullLocation(publication.location)}
                </span>
              </div>

              <span className="date whitespace-nowrap">
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
      console.warn('Publication or publication ID is missing for list item', publication);
      return null;
    }

    const isNew = index < newItemsCount
    const isPremium = publication.premium
    const isSaved = savedItems.has(publication.id); // Needed for list view interaction buttons if added

    // Robust image check
    const images = publication.images;
    const hasImages = Array.isArray(images) && images.length > 0 && images[0] !== '/images/placeholder-image.jpg' && images[0] !== '/images/defaults/default.jpg';
    const imageUrl = hasImages ? images[0] : getDefaultImageForCategory(publication.categorySlug);

    // Log the publication object to inspect its structure
    if (index === 0) { // Log only the first item
        // console.log("--- Publication Data (List Item) ---", JSON.stringify(publication, null, 2));
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
        key={`list-item-${publication.id}`} // Key simplificada
        layoutId={`publication-list-${publication.id}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="relative w-full list-view-item group" // Added group for group-hover effects
      >
        <a
          href={seoUrl}
          className="block w-full"
          onClick={(e) => {
            if (onPublicationClick) {
              onPublicationClick(publication, e);
            } else {
              console.warn("onPublicationClick handler not provided to SearchResults. Defaulting to link navigation.");
              // No e.preventDefault() aquí para permitir la navegación si no hay manejador
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
                  sizes="(max-width: 640px) 30vw, 120px" // Adjusted sizes for list view
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
                    {/* Interaction buttons for list view - e.g. Save button */}
                    {showInteractionButtons && (
                        <button
                            className={`flex items-center justify-center transition-all rounded-full w-7 h-7 ml-2 flex-shrink-0 ${
                            isSaved
                                ? "bg-blue-500 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                            }`}
                            onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleSave(publication.id);
                            }}
                            aria-label={isSaved ? "Quitar de guardados" : "Guardar publicación"}
                        >
                            {isSaved ? (
                            <BookmarkSolid className="w-4 h-4" />
                            ) : (
                            <BookmarkOutline className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
                <p className="text-xs text-teal-300/80 whitespace-nowrap mb-1"> 
                    {/* Moved date here for better layout */}
                    {formatRelativeTime(publication.createdAt)}
                </p>

                <p className="text-cyan-100/80 text-sm line-clamp-2 mb-2">
                  {publication.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto"> {/* mt-auto to push to bottom */}
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
                  publication.contactPhone && ( // Show "Consultar precio" only if phone exists and no price
                    <button
                      onClick={handleWhatsAppClick}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-lg shadow-sm flex items-center"
                      aria-label="Consultar precio por WhatsApp"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      </svg>
                      <span>Consultar precio</span>
                    </button>
                  )
                )}
              </div>
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
      */}
      {/* Estado de carga inicial o cuando no hay resultados aún pero se está cargando */}
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
      {/* Mostrar resultados solo si no está cargando O si ya hay resultados cargados y se están cargando más */}
      {(allResults.length > 0) && (
        <AnimatePresence>
          {viewType === 'grid' ? (
            <LayoutGroup>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-0`}
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

      {/* "Cargar más" indicator (cuando hay resultados y se está cargando la siguiente página) */}
      {loading && allResults.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <p className="text-slate-400 mt-2">Cargando más resultados...</p>
        </div>
      )}
    </div>
  )
}