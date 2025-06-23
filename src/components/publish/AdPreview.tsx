'use client'

import React from 'react'
import Image from 'next/image'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, TagIcon, CalendarIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline'
import formatUtils from '@/utils/format'
import { getClassificationNames } from '@/data/categories-data'
import { motion } from 'framer-motion'
import { PublicationFormData } from '@/types/publication'

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
  ad: PublicationFormData;
  quality: number;
}

const AdPreview: React.FC<AdPreviewProps> = ({ ad, quality }) => {
  // Verificación defensiva para asegurar que ad esté bien definido
  if (!ad || typeof ad !== 'object') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">Datos del anuncio no disponibles</p>
      </div>
    );
  }

  const formatPrice = (amount: number | null | undefined) => {
    if (!amount) return 'Precio a consultar';
    return `S/. ${amount.toLocaleString()}`;
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 80) return { text: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (quality >= 60) return { text: 'Bueno', color: 'bg-blue-100 text-blue-800' };
    if (quality >= 40) return { text: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Básico', color: 'bg-gray-100 text-gray-800' };
  };

  const qualityBadge = getQualityBadge(quality);

  return (
    <div className="space-y-6">
      {/* Header con calidad */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Vista Previa Final</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${qualityBadge.color}`}>
            {qualityBadge.text} ({quality}%)
          </span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(quality / 20) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview card principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Imágenes placeholder */}
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          {ad.images && Array.isArray(ad.images) && ad.images.length > 0 ? (
            <div className="text-center">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm text-gray-600">{ad.images.length} imagen(es)</p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm">Sin imágenes</p>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Header del anuncio */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {ad.title || 'Título del anuncio'}
              </h2>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                {ad.categorySlug && (
                  <span className="flex items-center">
                    <TagIcon className="w-4 h-4 mr-1" />
                    {ad.categorySlug}
                  </span>
                )}
                
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Hoy
                </span>
                
                <span className="flex items-center">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  0 vistas
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPrice(ad.amount)}
              </div>
              {ad.negotiable && (
                <span className="text-sm text-green-600 font-medium">Negociable</span>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {ad.description || 'Descripción del anuncio...'}
            </p>
          </div>

          {/* Atributos específicos por categoría */}
          {ad.attributes && Object.keys(ad.attributes).length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Características</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ad.attributes).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="ml-1 font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ubicación */}
          {(ad.location?.district || ad.location?.province) && (
            <div className="mb-4 flex items-start">
              <MapPinIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {ad.location.district || ad.location.province}
                </p>
                {ad.location.address && (
                  <p className="text-sm text-gray-600">{ad.location.address}</p>
                )}
                {ad.location.referencePoint && (
                  <p className="text-xs text-gray-500">Ref: {ad.location.referencePoint}</p>
                )}
              </div>
            </div>
          )}

          {/* Información de contacto */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Información de contacto</h4>
            <div className="space-y-2">
              {ad.contact?.name && (
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-700 w-20">Nombre:</span>
                  <span className="text-gray-600">{ad.contact.name}</span>
                </div>
              )}
              
              {ad.contact?.phones?.[0] && (
                <div className="flex items-center text-sm">
                  <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700 w-16">Teléfono:</span>
                  <span className="text-blue-600">{ad.contact.phones[0]}</span>
                </div>
              )}
              
              {ad.contact?.email && (
                <div className="flex items-center text-sm">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700 w-16">Email:</span>
                  <span className="text-blue-600">{ad.contact.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Badge de premium si aplicable */}
          {ad.premium && (
            <div className="mt-4 flex justify-end">
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-sm font-medium rounded-full">
                ⭐ Anuncio Premium
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Consejos para mejorar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para mejorar tu anuncio</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          {(!ad.images || !Array.isArray(ad.images) || ad.images.length === 0) && (
            <li>• Añade al menos 2-3 imágenes para atraer más compradores</li>
          )}
          {ad.title && ad.title.length < 20 && (
            <li>• Haz el título más descriptivo y específico</li>
          )}
          {ad.description && ad.description.length < 100 && (
            <li>• Amplía la descripción con más detalles</li>
          )}
          {!ad.contact?.email && (
            <li>• Considera añadir un email para más formas de contacto</li>
          )}
          {quality < 80 && (
            <li>• Completa todos los campos para maximizar la visibilidad</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default AdPreview 