'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Advertisement } from '@/types/publish'
import { formatDate } from '@/utils/dates'
import { 
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

interface AdPreviewProps {
  ad: Advertisement
  className?: string
}

export default function AdPreview({ ad, className = '' }: AdPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const primaryImage = ad.media.find(m => m.isPrimary) || ad.media[0]
  const sortedMedia = [
    primaryImage,
    ...ad.media.filter(m => m !== primaryImage)
  ].filter(Boolean)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className={className}>
      {/* Desktop Preview */}
      <div className="hidden md:block">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative aspect-[21/9] bg-primary-100">
            {sortedMedia.length > 0 ? (
              <>
                <Image
                  src={sortedMedia[currentImageIndex].url}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
                {/* Image Navigation */}
                {sortedMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                    {sortedMedia.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Ver imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-primary-400">
                <Image
                  src="/placeholder-image.jpg"
                  alt="Imagen no disponible"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-white shadow-lg">
              {ad.status === 'published' ? (
                <span className="flex items-center text-green-600">
                  <CheckBadgeIcon className="w-5 h-5 mr-1" />
                  Publicado
                </span>
              ) : (
                <span className="flex items-center text-primary-600">
                  Borrador
                </span>
              )}
            </div>

            {/* Premium Badge */}
            {ad.premium && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg">
                Premium
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary-900 mb-2">
                  {ad.title}
                </h1>
                <div className="flex items-center text-primary-600">
                  <MapPinIcon className="w-5 h-5 mr-1" />
                  {ad.location.city}, {ad.location.state}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-900">
                  {formatCurrency(ad.price.amount, ad.price.currency)}
                </div>
                {ad.price.negotiable && (
                  <div className="text-sm text-primary-600">
                    Precio negociable
                  </div>
                )}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center text-primary-600">
                <ClockIcon className="w-5 h-5 mr-2" />
                Publicado {formatDate(ad.publishedAt || ad.createdAt)}
              </div>
              <div className="flex items-center text-primary-600">
                <EyeIcon className="w-5 h-5 mr-2" />
                {ad.statistics.views} vistas
              </div>
              <div className="flex items-center text-primary-600">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                {ad.price.type === 'fixed' ? 'Precio fijo' : 'Precio negociable'}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-primary max-w-none mb-8">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Descripción
              </h2>
              <div className="text-primary-600 whitespace-pre-wrap">
                {ad.description}
              </div>
            </div>

            {/* Features */}
            {Object.keys(ad.features).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-primary-900 mb-4">
                  Características
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(ad.features).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center text-primary-600"
                    >
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                      <span className="font-medium capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="ml-1">
                        {value.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Información de contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ad.contact.showEmail && (
                  <div className="flex items-center text-primary-600">
                    <EnvelopeIcon className="w-5 h-5 mr-2" />
                    {ad.contact.email}
                  </div>
                )}
                {ad.contact.showPhone && ad.contact.phone && (
                  <div className="flex items-center text-primary-600">
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    {ad.contact.phone}
                  </div>
                )}
                {ad.contact.availableHours && (
                  <div className="flex items-center text-primary-600">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    Disponible de {ad.contact.availableHours.from} a {ad.contact.availableHours.to}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-primary-100">
              <div className="flex items-center space-x-4">
                <button
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label="Me gusta"
                >
                  <HeartIcon className="w-6 h-6" />
                  <span>{ad.statistics.favorites}</span>
                </button>
                <button
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label="Comentarios"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                  <span>{ad.statistics.inquiries}</span>
                </button>
                <button
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label="Compartir"
                >
                  <ShareIcon className="w-6 h-6" />
                  <span>{ad.statistics.shares}</span>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="md:hidden">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Mobile Header */}
          <div className="relative aspect-square bg-primary-100">
            {sortedMedia.length > 0 ? (
              <>
                <Image
                  src={sortedMedia[currentImageIndex].url}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
                {/* Mobile Image Navigation */}
                {sortedMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                    {sortedMedia.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Ver imagen ${index + 1} en móvil`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-primary-400">
                <Image
                  src="/placeholder-image.jpg"
                  alt="Imagen no disponible"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Mobile Status Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-white shadow-lg">
              {ad.status === 'published' ? (
                <span className="flex items-center text-green-600">
                  <CheckBadgeIcon className="w-5 h-5 mr-1" />
                  Publicado
                </span>
              ) : (
                <span className="flex items-center text-primary-600">
                  Borrador
                </span>
              )}
            </div>

            {/* Mobile Premium Badge */}
            {ad.premium && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg">
                Premium
              </div>
            )}
          </div>

          {/* Mobile Content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              {ad.title}
            </h1>
            <div className="flex items-center text-primary-600 mb-4">
              <MapPinIcon className="w-5 h-5 mr-1" />
              {ad.location.city}, {ad.location.state}
            </div>

            <div className="text-2xl font-bold text-primary-900 mb-1">
              {formatCurrency(ad.price.amount, ad.price.currency)}
            </div>
            {ad.price.negotiable && (
              <div className="text-sm text-primary-600 mb-4">
                Precio negociable
              </div>
            )}

            {/* Mobile Description Preview */}
            <div className="text-primary-600 line-clamp-3 mb-4">
              {ad.description}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-primary-100">
              <div className="flex items-center space-x-4">
                <button
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label="Me gusta en móvil"
                >
                  <HeartIcon className="w-6 h-6" />
                </button>
                <button
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label="Comentarios en móvil"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                </button>
                <button
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                  aria-label="Compartir en móvil"
                >
                  <ShareIcon className="w-6 h-6" />
                </button>
              </div>

              <button
                className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                Contactar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 