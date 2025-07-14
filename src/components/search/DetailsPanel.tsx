'use client'

import { useState, useEffect } from 'react'
import { HeartIcon, BookmarkIcon, ShareIcon, EnvelopeIcon, PhoneIcon, ChatBubbleOvalLeftEllipsisIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'
import LocationMap from '@/components/publication/LocationMap'

export interface Publication {
  id: string
  title: string
  description?: string
  price?: number
  priceUnit?: string
  currency?: string
  location?: string
  province?: string
  date?: string
  updatedAt?: string
  images?: string[]
  seller?: {
    id: string
    name: string
    avatar?: string
    phone?: string
    email?: string
    rating?: number
  }
  attributes?: Record<string, unknown>
  category?: string
  subcategory?: string
  coordinates?: {
    lat: number;
    lng: number;
  }
  [key: string]: unknown
}

interface DetailsPanelProps {
  publication?: Publication
  className?: string
  isLiked?: boolean
  isSaved?: boolean
  onLike?: (id: string, liked: boolean) => void
  onSave?: (id: string, saved: boolean) => void
  onContact?: (userId: string) => void
  onShare?: (publicationId: string) => void
  onClose?: () => void
}

export default function DetailsPanel({
  publication,
  className,
  isLiked: initialIsLiked,
  isSaved: initialIsSaved,
  onLike,
  onSave,
  onContact,
  onShare,
  onClose
}: DetailsPanelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [liked, setLiked] = useState(initialIsLiked || false)
  const [saved, setSaved] = useState(initialIsSaved || false)
  
  // Reset states when publication changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setLiked(initialIsLiked || false)
    setSaved(initialIsSaved || false)
  }, [publication, initialIsLiked, initialIsSaved])
  
  if (!publication) {
    return (
      <div className={clsx("flex flex-col items-center justify-center h-full bg-slate-800 p-6 text-slate-400", className)}>
        <p>Seleccione una publicación para ver sus detalles</p>
      </div>
    )
  }
  
  const images = publication.images || []
  
  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }
  
  const handlePrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }
  
  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    onLike?.(publication.id, newLiked)
  }
  
  const handleSave = () => {
    const newSaved = !saved
    setSaved(newSaved)
    onSave?.(publication.id, newSaved)
  }
  
  const handleContact = () => {
    if (publication.seller?.id) {
      onContact?.(publication.seller.id)
    }
  }
  
  const handleShare = () => {
    onShare?.(publication.id)
  }
  
  const formatCurrency = (price?: number, currency?: string) => {
    if (price === undefined) return 'Consultar'
    
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 0
    })
    
    return formatter.format(price)
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es
    })
  }
  
  return (
    <div className={clsx("flex flex-col h-full bg-slate-800 overflow-auto", className)}>
      {/* Header with close button on mobile */}
      {onClose && (
        <div className="flex justify-between items-center p-4 border-b border-slate-700 md:hidden">
          <h2 className="text-white font-medium truncate">{publication.title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Image gallery */}
      <div className="relative w-full aspect-square">
        {images.length > 0 ? (
          <Image
            src={images[currentImageIndex]}
            alt={publication.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentImageIndex === 0}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            <span className="text-slate-400">Sin imágenes</span>
          </div>
        )}
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
              aria-label="Imagen anterior"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
              aria-label="Imagen siguiente"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            
            {/* Image counter */}
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between px-4 py-3 bg-slate-700">
        <div className="flex space-x-2">
          <button
            onClick={handleLike}
            className={clsx(
              "p-2 rounded-full transition-colors",
              liked ? "bg-red-100 text-red-500" : "bg-slate-600 text-slate-300 hover:bg-slate-500"
            )}
            aria-label={liked ? "Quitar me gusta" : "Me gusta"}
          >
            {liked ? (
              <HeartIconSolid className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={handleSave}
            className={clsx(
              "p-2 rounded-full transition-colors",
              saved ? "bg-indigo-100 text-indigo-500" : "bg-slate-600 text-slate-300 hover:bg-slate-500"
            )}
            aria-label={saved ? "Quitar de guardados" : "Guardar"}
          >
            {saved ? (
              <BookmarkIconSolid className="w-5 h-5" />
            ) : (
              <BookmarkIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"
            aria-label="Compartir"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Publication details */}
      <div className="p-4 flex-1 overflow-auto">
        {/* Title and price */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white mb-2">{publication.title}</h1>
          {publication.price !== undefined && (
            <div className="text-2xl font-bold text-white">
              {formatCurrency(publication.price, publication.currency)}
              {publication.priceUnit && (
                <span className="text-base font-normal text-slate-400 ml-1">/{publication.priceUnit}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Location and date */}
        <div className="flex flex-wrap justify-between items-start mb-4 text-sm">
          <div className="text-slate-300">
            {publication.location && <span>{publication.location}</span>}
            {publication.province && publication.location && <span>, </span>}
            {publication.province && <span>{publication.province}</span>}
          </div>
          
          {(publication.date || publication.updatedAt) && (
            <div className="text-slate-400">
              {formatDate(publication.updatedAt || publication.date)}
            </div>
          )}
        </div>
        
        {/* Location Map */}
        {(publication.coordinates?.lat && publication.coordinates?.lng) && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Ubicación</h2>
            <LocationMap 
              latitude={publication.coordinates.lat}
              longitude={publication.coordinates.lng}
              address={publication.location}
              height="200px"
              className="rounded-lg overflow-hidden"
            />
          </div>
        )}
        
        {/* Description */}
        {publication.description && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Descripción</h2>
            <p className="text-slate-300 whitespace-pre-line">{publication.description}</p>
          </div>
        )}
        
        {/* Attributes grid */}
        {publication.attributes && Object.keys(publication.attributes).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Características</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(publication.attributes).map(([key, value]) => (
                <div key={key} className="bg-slate-700 p-2 rounded">
                  <div className="text-xs text-slate-400">{key}</div>
                  <div className="text-sm text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Seller info */}
        {publication.seller && (
          <div className="border-t border-slate-700 pt-4 mt-4">
            <h2 className="text-lg font-medium text-white mb-3">Contacto</h2>
            <div className="flex items-center mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-700 mr-3">
                {publication.seller.avatar ? (
                  <Image
                    src={publication.seller.avatar}
                    alt={publication.seller.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    {publication.seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-white font-medium">{publication.seller.name}</div>
                {publication.seller.rating && (
                  <div className="text-yellow-400 text-sm">
                    {'★'.repeat(Math.round(publication.seller.rating))}
                    <span className="text-slate-400 ml-1">{publication.seller.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact buttons */}
            <div className="grid grid-cols-3 gap-2">
              {publication.seller.phone && (
                <button 
                  className="flex items-center justify-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                  onClick={handleContact}
                >
                  <PhoneIcon className="w-5 h-5 mr-1" />
                  <span>Llamar</span>
                </button>
              )}
              
              {publication.seller.email && (
                <button 
                  className="flex items-center justify-center py-2 bg-slate-600 hover:bg-slate-700 text-white rounded"
                  onClick={handleContact}
                >
                  <EnvelopeIcon className="w-5 h-5 mr-1" />
                  <span>Email</span>
                </button>
              )}
              
              <button 
                className="flex items-center justify-center py-2 bg-slate-600 hover:bg-slate-700 text-white rounded"
                onClick={handleContact}
              >
                <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 mr-1" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}