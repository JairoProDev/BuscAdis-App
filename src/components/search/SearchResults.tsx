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
import { generateSeoUrl } from '@/utils/url'
import { toast } from 'react-hot-toast'
import { BookmarkOutline } from '@/components/icons/Bookmark'
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage';
import { getDefaultImageByCategory } from '@/utils/image-helpers';

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
  country?: string;
  reference?: string;
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

// Helper function to check if a publication is truly new (less than 24 hours old)
const isPublicationNew = (createdAt: string): boolean => {
  const publicationDate = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - publicationDate.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
};

// Helper function to check if a publication has valid images
const hasValidImages = (publication: Publication): boolean => {
  if (!publication.images || !Array.isArray(publication.images)) {
    return false;
  }
  
  return publication.images.length > 0 && 
    publication.images[0] !== '/images/placeholder-image.jpg' && 
    publication.images[0] !== '/images/defaults/default.jpg';
};

export default function SearchResults({
  results: initialResults,
  loading: initialLoading,
  highlightNew = true,
  showInteractionButtons = true,

  activeCategory,
  viewType = 'grid',
}: SearchResultsProps) {
  // Estado para interacciones del usuario (guardados)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  // Referencia para los resultados más nuevos
  const [newItemsCount, setNewItemsCount] = useState(0)

  // Nuevos estados para el scroll infinito - Managed by parent now mostly
  const [allResults, setAllResults] = useState<Publication[]>(initialResults || [])
  const [loading, setLoading] = useState(initialLoading)

  // Add state to track selected publication
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

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

  // Modify the onPublicationClick handler to set the selected publication
  const handlePublicationClick = (publication: Publication, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setSelectedPublication(publication);
  };

  // Renderizar item en vista de cuadrícula
  const renderGridItem = (publication: Publication, index: number) => {
    if (!publication || !publication.id) {
      console.warn('Publication or publication ID is missing', publication);
      return null;
    }

    const hasImages = hasValidImages(publication);
    const isPremium = publication.premium;
    const isSaved = savedItems.has(publication.id);
    const isNew = isPublicationNew(publication.createdAt);

    // Generate SEO-friendly URL
    const seoUrl = generateSeoUrl(
      publication.id,
      publication.title || '',
      publication.slug,
      publication.categorySlug || '',
      publication.subcategory || publication.subcategorySlug || '',
      publication.subsubcategory || publication.subSubcategorySlug || ''
    );

    return (
      <motion.div
        key={`grid-item-${publication.id}`}
        layoutId={`publication-${publication.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 ${
          hasImages ? 'col-span-1' : 'col-span-1'
        }`}
      >
        <Link
          href={seoUrl}
          className="block w-full h-full"
          onClick={(e) => handlePublicationClick(publication, e)}
        >
          {/* Image Container - Always show image (real or default) */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 z-10" />
            <Image
              src={hasImages && publication.images ? publication.images[0] : getDefaultImageByCategory(publication.categorySlug)}
              alt={`Imagen de ${publication.title || 'publicación'}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={index < 4}
            />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col">
            {/* Title and Save Button Row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                {publication.title}
              </h3>
              
              {showInteractionButtons && (
                <button
                  className={`flex-shrink-0 flex items-center justify-center transition-all rounded-full w-8 h-8 ${
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
                    <BookmarkSolid className="w-5 h-5" />
                  ) : (
                    <BookmarkOutline className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 line-clamp-2 mb-4 flex-1">
              {publication.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {isPremium && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/20">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  Premium
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-300 border border-orange-500/20">
                  <FireIcon className="w-3 h-3 mr-1" />
                  Nuevo
                </span>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-auto space-y-2">
              {/* Price */}
              {formatPrice(publication.price, publication.currency) && (
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-teal-400">
                    {formatPrice(publication.price, publication.currency)}
                  </span>
                </div>
              )}

              {/* Location and Date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-400 truncate">
                  <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate" title={formatFullLocation(publication.location)}>
                    {formatFullLocation(publication.location)}
                  </span>
                </div>
                <span className="text-slate-500 text-xs whitespace-nowrap ml-2">
                  {formatRelativeTime(publication.createdAt)}
                </span>
              </div>

              {/* Contact Button */}
              {(() => {
                const phone = publication.contactPhone;
                if (typeof phone !== 'string' || !phone) return null;
                
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const cleanPhone = phone.replace(/[^0-9]/g, '');
                      const message = encodeURIComponent(
                        `Hola, me interesa tu publicación "${publication.title}" en BuscaDis`
                      );
                      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                    }}
                    className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-sm flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    <span>Contactar</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

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

    // Log the publication object to inspect its structure
    if (index === 0) { // Log only the first item
        // console.log("--- Publication Data (List Item) ---", JSON.stringify(publication, null, 2));
    }

    // Ensure we have the correct category levels
    // const categorySlug = publication.categorySlug || '';
    // const subcategorySlug = publication.subcategory || publication.subcategorySlug || '';
    // const subsubcategorySlug = publication.subsubcategory || publication.subSubcategorySlug || '';

    // Generate SEO-friendly URL with all category levels
    const seoUrl = generateSeoUrl(
      publication.id,
      publication.title || '',
      publication.slug,
      publication.categorySlug || '',
      publication.subcategory || publication.subcategorySlug || '',
      publication.subsubcategory || publication.subSubcategorySlug || ''
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
        <Link
          href={seoUrl}
          className="block w-full"
          onClick={(e) => handlePublicationClick(publication, e)}
        >
          <div className="relative flex flex-row bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
            {/* Imagen - Siempre mostrar (real o por defecto) */}
            <div className="relative w-40 sm:w-48 flex-shrink-0 overflow-hidden h-auto image-container">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/60 z-10" />
              <div className="relative w-full h-full min-h-[160px]">
                <OptimizedImage
                  src={hasImages && images ? images[0] : getDefaultImageByCategory(publication.categorySlug)}
                    alt={`Imagen de ${publication.title || 'publicación'}`}
                    width={120}
                    height={120}
                    sizes="(max-width: 640px) 30vw, 120px"
                    className="transition-transform duration-500 group-hover:scale-110"
                    priority={index < 4}
                    fallbackSrc={getDefaultImageByCategory(publication.categorySlug)}
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
                    className="absolute bottom-2 left-2 z-20 bg-[#14b8a6] hover:bg-[#0d9488] text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm flex items-center"
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
                  <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-[#14b8a6] transition-colors">
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

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-2">
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
              </div>

              <div className="flex items-center justify-between mt-auto"> {/* mt-auto to push to bottom */}
                <div className="flex items-center text-cyan-300/90 text-sm">
                  <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate max-w-[150px]" title={formatFullLocation(publication.location)}>
                    {formatFullLocation(publication.location)}
                  </span>
                </div>

                {formatPrice(publication.price, publication.currency) ? (
                  <span className="bg-slate-900/80 backdrop-blur-sm text-[#14b8a6] text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                    {formatPrice(publication.price, publication.currency)}
                  </span>
                ) : (
                  publication.contactPhone && ( // Show "Consultar precio" only if phone exists and no price
                    <button
                      onClick={handleWhatsAppClick}
                      className="bg-[#14b8a6] hover:bg-[#0d9488] text-white text-xs font-medium px-3 py-1 rounded-lg shadow-sm flex items-center"
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
        </Link>
      </motion.div>
    )
  }

  // Adjust the grid layout based on whether a publication is selected
  const gridClassName = selectedPublication ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  // Adjust the list layout based on whether a publication is selected
  const listClassName = selectedPublication ? 'flex flex-col gap-2' : 'flex flex-col gap-4';

  if (loading && allResults.length === 0) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map(() => (
            <div key={`skeleton-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
              {/* Shimmer effect for image */}
              <div className="relative aspect-[4/5] bg-slate-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent shimmer" />
              </div>

              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                
                <div className="flex gap-2 mt-4">
                  <div className="h-5 bg-slate-700 rounded-full w-16"></div>
                  <div className="h-5 bg-slate-700 rounded-full w-20"></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                </div>
                
                <div className="h-8 bg-slate-700 rounded-lg w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .shimmer {
            animation: shimmer 2s infinite linear;
          }
        `}</style>
      </div>
    );
  }

  if (!loading && allResults.length === 0) {
    return (
      <div className="w-full py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
              <SearchIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron resultados</h3>
            <p className="text-slate-400 mb-6">
              Intenta con otros términos de búsqueda o ajusta los filtros.
            </p>
            {activeCategory && (
              <p className="text-sm text-teal-400">
                Estás buscando en la categoría <span className="font-semibold">{activeCategory}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence>
        {viewType === 'grid' ? (
          <LayoutGroup>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${gridClassName} gap-4 auto-rows-auto`}
              style={{
                gridAutoFlow: 'dense',
                gridTemplateRows: 'masonry',
                maxWidth: '100%'
              }}
            >
              {allResults.map((publication, index) => renderGridItem(publication, index))}
            </motion.div>
          </LayoutGroup>
        ) : (
          <LayoutGroup>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={listClassName}
            >
              {allResults.map((publication, index) => renderListItem(publication, index))}
            </motion.div>
          </LayoutGroup>
        )}
      </AnimatePresence>

      {/* Display selected publication details */}
      {selectedPublication && (
        <div className="w-full lg:w-1/2 p-4">
          <h2 className="text-xl font-bold mb-4">{selectedPublication.title}</h2>
          <p>{selectedPublication.description}</p>
          {/* Add more details as needed */}
        </div>
      )}

      {/* Loading more indicator */}
      {loading && allResults.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            </div>
          </div>
          <span className="ml-3 text-slate-400">Cargando más resultados...</span>
        </div>
      )}
    </div>
  )
}