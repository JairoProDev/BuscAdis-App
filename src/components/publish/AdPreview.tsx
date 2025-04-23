'use client'

import React from 'react'
import Image from 'next/image'
import { MapPinIcon, CalendarDaysIcon, PhoneIcon, EnvelopeIcon, TagIcon, ClockIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
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
  const addressDetail = adData?.location?.address || ''
  const referencePoint = adData?.location?.referencePoint || ''

  // Contacto (tomar el primer teléfono para WhatsApp)
  const primaryPhone = adData?.contact?.phones?.[0] || ''
  const contactName = adData?.contact?.name || ''
  const contactEmail = adData?.contact?.email || ''
  const contactWebsite = adData?.contact?.website || ''

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

  const formatPriceValue = formatPriceInternal(amount, currency, negotiable)

  // Función para crear URL de WhatsApp
  const getWhatsAppUrl = () => {
    if (!primaryPhone) return '#';
    const message = `Hola, estoy interesado en tu anuncio: ${title}`;
    return `https://wa.me/${primaryPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all border border-gray-200 hover:shadow-2xl transform hover:-translate-y-1 duration-300">
      {/* Banner superior */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-white text-blue-600 rounded-full p-1">
            <CheckCircleIcon className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium">Anuncio destacado</div>
        </div>
        {isPreview && (
          <div className="bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold shadow-md">
            VISTA PREVIA
          </div>
        )}
      </div>

      <div className="relative">
        {/* Galería de imágenes con indicador de cantidad */}
        <div className="w-full h-64 md:h-80 bg-gray-100 relative group">
          {hasImages ? (
            <>
              <Image
                src={coverImage}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                  <span className="font-medium">{images.length}</span> imágenes
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Añade imágenes para destacar tu anuncio</span>
            </div>
          )}
          
          {/* Precio destacado */}
          <div className="absolute top-3 left-3">
            <div className="bg-white text-gray-900 font-bold text-lg px-4 py-2 rounded-lg shadow-lg">
              {formatPriceValue}
            </div>
          </div>
        </div>

        {/* Miniaturas de imágenes adicionales */}
        {images.length > 1 && (
          <div className="flex gap-1 px-3 mt-2 overflow-x-auto custom-scrollbar py-2">
            {images.map((image: string, index: number) => (
              <div key={index} className="w-20 h-16 relative flex-shrink-0 border-2 border-transparent hover:border-primary-500 rounded-md overflow-hidden transition-all duration-200">
                <Image
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Etiquetas de categoría con estilo mejorado */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryName !== 'Categoría' && (
            <span className="text-xs bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-1 rounded-full font-semibold shadow-sm flex items-center">
              <TagIcon className="h-3 w-3 mr-1" />
              {categoryName}
            </span>
          )}
          {subcategoryName && (
            <span className="text-xs bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
              {subcategoryName}
            </span>
          )}
          {subSubcategoryName && (
            <span className="text-xs bg-gradient-to-r from-purple-600 to-purple-800 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
              {subSubcategoryName}
            </span>
          )}
        </div>

        {/* Título con diseño destacado */}
        <h3 className="text-2xl font-extrabold text-gray-800 leading-tight hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {/* Meta información con iconos */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-y-2">
          <div className="flex items-center mr-4">
            <MapPinIcon className="w-4 h-4 mr-1.5 text-primary-500" />
            <span>{locationString}</span>
          </div>
          <div className="flex items-center mr-4">
            <CalendarDaysIcon className="w-4 h-4 mr-1.5 text-primary-500" />
            <span>Publicado hoy</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1.5 text-primary-500" />
            <span>Anuncio destacado</span>
          </div>
        </div>

        {/* Descripción con formato mejorado */}
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
          <h4 className="font-semibold text-gray-700 mb-2">Descripción</h4>
          <p className="text-gray-600 whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Detalles adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ubicación detallada */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1.5 text-primary-500" />
              Ubicación
            </h4>
            <p className="text-gray-600 mb-1">{locationString}</p>
            {addressDetail && (
              <p className="text-gray-600 text-sm">Dirección: {addressDetail}</p>
            )}
            {referencePoint && (
              <p className="text-gray-600 text-sm">Referencia: {referencePoint}</p>
            )}
          </div>

          {/* Información de contacto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <PhoneIcon className="w-4 h-4 mr-1.5 text-primary-500" />
              Contacto
            </h4>
            {contactName && (
              <p className="text-gray-600 mb-1">{contactName}</p>
            )}
            {primaryPhone && (
              <p className="text-gray-600 text-sm flex items-center mb-1">
                <PhoneIcon className="w-3 h-3 mr-1 text-gray-400" />
                {formatUtils.formatPhoneNumber(primaryPhone)}
              </p>
            )}
            {contactEmail && (
              <p className="text-gray-600 text-sm flex items-center mb-1">
                <EnvelopeIcon className="w-3 h-3 mr-1 text-gray-400" />
                {contactEmail}
              </p>
            )}
            {contactWebsite && (
              <p className="text-gray-600 text-sm flex items-center">
                <ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1 text-gray-400" />
                {contactWebsite}
              </p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {primaryPhone && (
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 4.5 10 10 10h.5c5.2-.3 9.5-4.5 9.5-9.7 0-5.5-4.5-10-10-10zM8.5 14.5l1.8.5c1.2.5 2.8.8 3.5 1 1.5.5 2.7.2 3.5-.5l.5-.5c.5-.5.5-1 0-1.5L16 12c-.2-.2-.5-.5-1-.5s-1 .5-1.5 1c0 0-.3 0-.5-.5s-.5-1-1-1.5l-.5-1c-.5-.5-1-.5-1.5 0l-2 2c-.5.5-.5 1.5-.5 2 .5.5 1 1 1 1z" />
              </svg>
              Contactar por WhatsApp
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}?subject=Interesado en: ${encodeURIComponent(title)}`}
              className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              Contactar por Email
            </a>
          )}
        </div>
      </div>

      {/* Sello de calidad */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Anuncio verificado por BuscAdis</span>
          </div>
          <div className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-bold">
            ID: {isPreview ? 'VISTA PREVIA' : 'NUEVO'}
          </div>
        </div>
      </div>
      
      {/* Estilos CSS adicionales */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}

export default AdPreview 