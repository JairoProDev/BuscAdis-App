'use client'

import React from 'react'
import Image from 'next/image'
import { MapPinIcon, CalendarDaysIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import formatUtils from '@/utils/format'
import { getClassificationNames } from '@/data/categories-data'

// Definición del tipo de datos para el anuncio
interface GeoCoordinates {
  lat?: number;
  lng?: number;
}

interface AdData {
  title?: string;
  description?: string;
  amount?: number | null;
  currency?: string;
  negotiable?: boolean;
  categorySlug?: string;
  subcategorySlug?: string;
  subSubcategorySlug?: string;
  images?: string[];
  location?: {
    district?: string;
    province?: string;
    address?: string;
    referencePoint?: string;
    coordinates?: GeoCoordinates | null;
  };
  contact?: {
    phones?: string[];
    email?: string;
    name?: string;
    website?: string;
  };
}

interface AdPreviewProps {
  adData: AdData
  isPreview?: boolean
}

const AdPreview: React.FC<AdPreviewProps> = ({ adData, isPreview = false }) => {
  // Obtener valores usando la estructura y valores por defecto
  const title = adData?.title || 'Título del anuncio'
  const description = adData?.description || 'Descripción del anuncio...'
  const amount = adData?.amount ?? null
  const currency = adData?.currency || 'PEN'
  const negotiable = adData?.negotiable || false
  const images = adData?.images || []
  const coverImage = images.length > 0 ? images[0] : ''
  const hasImages = images.length > 0

  // Obtener nombres de categorías
  const classificationNames = getClassificationNames(
    adData?.categorySlug || '',
    adData?.subcategorySlug || '',
    adData?.subSubcategorySlug || ''
  )
  const categoryName = classificationNames.categoryName || 'Categoría'
  const subcategoryName = classificationNames.subcategoryName || ''
  const subSubcategoryName = classificationNames.subSubcategoryName || ''

  // Construir ubicación
  const locationParts = [
    adData?.location?.district || '',
    adData?.location?.province || 'Cusco',
  ].filter(Boolean)
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Ubicación no especificada'

  // Contacto (tomar el primer teléfono para WhatsApp)
  const primaryPhone = adData?.contact?.phones?.[0] || ''
  const contactEmail = adData?.contact?.email || ''

  // Función para formatear precio internamente si hay algún problema con la importación
  const formatPriceInternal = (amt: number | null, curr: string, neg: boolean) => {
    if (amt === null) return 'Consultar'
    if (amt === 0 && !neg) return 'Gratis'
    
    try {
      return formatUtils.formatCurrency(amt, curr) + (neg ? ' (Negociable)' : '')
    } catch {
      // Fallback por si falla formatCurrency
      return amt.toLocaleString('es-PE') + ' ' + curr + (neg ? ' (Negociable)' : '')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all border border-gray-200">
      <div className="relative">
        {isPreview && (
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs px-2 py-1 absolute top-2 right-2 rounded-md z-10 font-medium">
            Vista previa
          </div>
        )}

        {/* Imagen principal */}
        <div className="w-full h-48 bg-gray-100 relative">
          {hasImages ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              <span>Sin imagen</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-3">
        {/* Etiquetas de categoría */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryName !== 'Categoría' && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
              {categoryName}
            </span>
          )}
          {subcategoryName && (
            <>
              <span className="text-xs text-gray-400">&gt;</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {subcategoryName}
              </span>
            </>
          )}
          {subSubcategoryName && (
            <>
              <span className="text-xs text-gray-400">&gt;</span>
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded">
                {subSubcategoryName}
              </span>
            </>
          )}
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 hover:line-clamp-none transition-all">
          {title}
        </h3>

        {/* Precio */}
        <div className="text-xl font-bold text-primary-600">
          {formatPriceInternal(amount, currency, negotiable)}
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm line-clamp-3 hover:line-clamp-none transition-all">
          {description}
        </p>

        {/* Imágenes adicionales (miniaturas) */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {images.slice(0, 4).map((image: string, index: number) => (
              <div key={index} className="w-14 h-14 relative flex-shrink-0">
                <Image
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  fill
                  sizes="56px"
                  className="object-cover rounded-md"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ))}
            {images.length > 4 && (
              <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-md text-xs text-gray-500">
                +{images.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Información de contacto */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          {primaryPhone && (
            <div className="flex items-center text-gray-600 text-sm">
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
              {primaryPhone}
            </div>
          )}
          {contactEmail && (
            <div className="flex items-center text-gray-600 text-sm">
              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
              {contactEmail}
            </div>
          )}
        </div>

        {/* Ubicación y fecha */}
        <div className="flex items-center text-gray-500 text-xs pt-2">
          <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="mr-3 truncate">{locationString}</span>
          <CalendarDaysIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span>Publicado hoy</span>
        </div>

        {/* Botón de contacto */}
        {primaryPhone && (
          <div className="mt-4">
            <button
              className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 4.5 10 10 10h.5c5.2-.3 9.5-4.5 9.5-9.7 0-5.5-4.5-10-10-10zM8.5 14.5l1.8.5c1.2.5 2.8.8 3.5 1 1.5.5 2.7.2 3.5-.5l.5-.5c.5-.5.5-1 0-1.5L16 12c-.2-.2-.5-.5-1-.5s-1 .5-1.5 1c0 0-.3 0-.5-.5s-.5-1-1-1.5l-.5-1c-.5-.5-1-.5-1.5 0l-2 2c-.5.5-.5 1.5-.5 2 .5.5 1 1 1 1z" />
              </svg>
              Contactar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdPreview 