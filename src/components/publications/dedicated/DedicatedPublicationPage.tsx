'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, ShareIcon, EyeIcon, MapPinIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { WhatsAppIcon } from '@/components/icons';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDefaultImageByCategory } from '@/utils/image-helpers';
import Image from 'next/image';
import Link from 'next/link';
import EmpleoDetail from './categories/EmpleoDetail';
import InmuebleDetail from './categories/InmuebleDetail';
import VehiculoDetail from './categories/VehiculoDetail';
import ServicioDetail from './categories/ServicioDetail';
import ProductoDetail from './categories/ProductoDetail';
import EventoDetail from './categories/EventoDetail';
import NegocioDetail from './categories/NegocioDetail';
import ComunidadDetail from './categories/ComunidadDetail';

interface DedicatedPublicationPageProps {
  publication: PublicationData;
  relatedPublications?: PublicationData[];
  onWhatsAppClick?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
}

// Category-specific configurations
const categoryConfigs = {
  empleos: {
    title: 'Empleo',
    icon: '💼',
    color: 'blue',
    primaryAction: 'Postular',
    secondaryAction: 'Guardar Empleo',
    fields: ['salary', 'workType', 'requirements', 'benefits']
  },
  inmuebles: {
    title: 'Inmueble',
    icon: '🏠',
    color: 'green',
    primaryAction: 'Contactar',
    secondaryAction: 'Programar Visita',
    fields: ['rooms', 'bathrooms', 'area', 'parking']
  },
  vehiculos: {
    title: 'Vehículo',
    icon: '🚗',
    color: 'red',
    primaryAction: 'Contactar',
    secondaryAction: 'Ver Detalles',
    fields: ['year', 'mileage', 'fuel', 'transmission']
  },
  servicios: {
    title: 'Servicio',
    icon: '🔧',
    color: 'purple',
    primaryAction: 'Contratar',
    secondaryAction: 'Consultar',
    fields: ['duration', 'availability', 'experience']
  },
  productos: {
    title: 'Producto',
    icon: '📦',
    color: 'orange',
    primaryAction: 'Comprar',
    secondaryAction: 'Preguntar',
    fields: ['condition', 'brand', 'warranty']
  },
  eventos: {
    title: 'Evento',
    icon: '🎉',
    color: 'pink',
    primaryAction: 'Participar',
    secondaryAction: 'Más Info',
    fields: ['date', 'location', 'capacity']
  },
  negocios: {
    title: 'Negocio',
    icon: '💼',
    color: 'indigo',
    primaryAction: 'Contactar',
    secondaryAction: 'Ver Más',
    fields: ['investment', 'roi', 'experience']
  },
  comunidad: {
    title: 'Comunidad',
    icon: '🤝',
    color: 'teal',
    primaryAction: 'Unirse',
    secondaryAction: 'Compartir',
    fields: ['members', 'activity', 'location']
  }
};

export default function DedicatedPublicationPage({
  publication,
  relatedPublications = [],
  onWhatsAppClick,
  onShare,
  onFavorite
}: DedicatedPublicationPageProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const categoryConfig = categoryConfigs[publication.categorySlug as keyof typeof categoryConfigs] || categoryConfigs.productos;
  const images = publication.images?.length > 0 ? publication.images : [getDefaultImageByCategory(publication.categorySlug)];

  // Format price
  const formatPrice = (value: number, currency: string) => {
    if (!value || value === 0) return 'Precio a consultar';
    return `${currency === 'USD' ? '$' : 'S/'} ${value.toLocaleString()}`;
  };

  // Format location
  const formatLocation = (location: PublicationData['location']) => {
    if (!location) return 'Ubicación no especificada';
    
    const parts = [];
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.city) parts.push(location.city);
    
    return parts.length > 0 ? parts.join(', ') : 'Ubicación no especificada';
  };

  // Format date
  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'Hace algunos días';
    }
  };

  // Handle image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.();
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.description,
          url: window.location.href
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
    onShare?.();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {categoryConfig.icon} {categoryConfig.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatLocation(publication.location)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleFavoriteToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={handleShareClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:w-2/3">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden">
                <Image
                  src={images[currentImageIndex]}
                  alt={publication.title}
                  fill
                  className="object-cover"
                  priority
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title and Price */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {publication.title}
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-teal-600">
                  {formatPrice(publication.value || 0, publication.currency || 'PEN')}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDate(publication.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    {publication.views || 0} vistas
                  </span>
                </div>
              </div>
            </div>

            {/* Category-Specific Content */}
            <div className="mb-8">
              {(() => {
                switch (publication.categorySlug) {
                  case 'empleos':
                    return <EmpleoDetail publication={publication} />;
                  case 'inmuebles':
                    return <InmuebleDetail publication={publication} />;
                  case 'vehiculos':
                    return <VehiculoDetail publication={publication} />;
                  case 'servicios':
                    return <ServicioDetail publication={publication} />;
                  case 'productos':
                    return <ProductoDetail publication={publication} />;
                  case 'eventos':
                    return <EventoDetail publication={publication} />;
                  case 'negocios':
                    return <NegocioDetail publication={publication} />;
                  case 'comunidad':
                    return <ComunidadDetail publication={publication} />;
                  default:
                    /* Default Description for unknown categories */
                    return (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Descripción
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                          <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
                            !showFullDescription && publication.description.length > 300 ? 'line-clamp-4' : ''
                          }`}>
                            {publication.description}
                          </p>
                          {publication.description.length > 300 && (
                            <button
                              onClick={() => setShowFullDescription(!showFullDescription)}
                              className="text-teal-600 hover:text-teal-700 font-medium mt-2"
                            >
                              {showFullDescription ? 'Ver menos' : 'Ver más'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                }
              })()}
            </div>

            {/* Related Publications */}
            {relatedPublications.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Publicaciones relacionadas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPublications.slice(0, 4).map((related) => (
                    <Link
                      key={related.id}
                      href={`/${related.categorySlug}/${related.subcategorySlug || 'general'}/${related.subSubcategorySlug || 'general'}/${related.id}`}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0">
                          <Image
                            src={related.images?.[0] || getDefaultImageByCategory(related.categorySlug)}
                            alt={related.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {related.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {formatPrice(related.value || 0, related.currency || 'PEN')}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {formatLocation(related.location)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact and Actions */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              {/* Contact Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Información de contacto
                </h3>
                
                {publication.whatsapp && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <p className="font-medium text-gray-900 dark:text-white">{publication.whatsapp}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={onWhatsAppClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    Contactar por WhatsApp
                  </button>
                  
                  <button
                    onClick={handleFavoriteToggle}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      isFavorite
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    {isFavorite ? 'Guardado' : 'Guardar'}
                  </button>
                </div>
              </div>

              {/* Location Card */}
              {publication.location && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-500" />
                    Ubicación
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {formatLocation(publication.location)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 