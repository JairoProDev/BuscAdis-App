// /components/publications/PublicationCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  ShareIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { WhatsAppIcon } from '@/components/icons';
import { useMemo } from 'react';
import { generateSeoUrl } from '@/utils/url';
import { getDefaultImageByCategory } from '@/utils/image-helpers';

interface PublicationData {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string | null;
  subSubcategorySlug: string | null;
  transactionType: string;
  value: number;
  currency: string;
  valueType: string;
  size: number;
  location: {
    district: string;
    province: string;
    city: string;
    country: string;
  };
  images: string[];
  whatsapp: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
}

interface PublicationCardProps {
  publication: PublicationData;
  onPublicationClick?: (publication: PublicationData) => void;
  className?: string;
  showWhatsApp?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  viewMode?: 'grid' | 'list';
}

// Mapping de iconos de categorías
const categoryIcons: Record<string, React.ElementType> = {
  empleos: BriefcaseIcon,
  inmuebles: HomeIcon,
  vehiculos: TruckIcon,
  servicios: WrenchScrewdriverIcon,
  productos: ShoppingBagIcon,
  eventos: CalendarIcon,
  negocios: ChartBarIcon,
  comunidad: UserGroupIcon,
}

// Colores de categorías
const categoryColors: Record<string, string> = {
  empleos: 'bg-blue-100 text-blue-800',
  inmuebles: 'bg-green-100 text-green-800',
  vehiculos: 'bg-orange-100 text-orange-800',
  servicios: 'bg-purple-100 text-purple-800',
  productos: 'bg-pink-100 text-pink-800',
  eventos: 'bg-yellow-100 text-yellow-800',
  negocios: 'bg-indigo-100 text-indigo-800',
  comunidad: 'bg-teal-100 text-teal-800',
}

export default function PublicationCard({
  publication,
  onPublicationClick,
  className = '',
  showWhatsApp = true,
  variant = 'default',
  viewMode = 'grid'
}: PublicationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // Generate SEO-friendly URL
  const seoUrl = useMemo(() => {
    return generateSeoUrl(publication.id, publication.title);
  }, [publication.id, publication.title]);

  // Format price
  const formatPrice = (value: number, currency: string) => {
    if (!value || value === 0) return null;
    return `${currency === 'USD' ? '$' : 'S/'} ${value.toLocaleString()}`;
  };

  // Format location
  const formatLocation = (location: PublicationData['location']) => {
    return `${location.district}, ${location.province}`;
  };

  // Get main image
  const mainImage = publication.images?.[0] || getDefaultImageByCategory(publication.categorySlug);

  // Format exact date and time with precise relative time
  const formatExactDateTime = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    // Mobile responsive: formato corto
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    if (diffInMinutes < 1) return isMobile ? 'Ahora' : 'Publicado ahora';
    if (diffInMinutes < 60) return isMobile ? `${diffInMinutes}min` : `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return isMobile ? `${diffInHours}h` : `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return isMobile ? `${diffInDays}d` : `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    // Para fechas más antiguas, mostrar fecha exacta
    return created.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: diffInDays > 365 ? 'numeric' : undefined 
    });
  };

  // Create enhanced personalized WhatsApp message
  const createEnhancedWhatsAppMessage = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const adUrl = `${baseUrl}${seoUrl}`;
    
    let message = '';
    const categoryName = publication.categorySlug.charAt(0).toUpperCase() + publication.categorySlug.slice(1);
    
    switch (publication.categorySlug) {
      case 'empleos':
        message = `🔍 Hola, vi su anuncio de *${categoryName}* en BuscaDis.com y me interesó mucho la oportunidad:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre los requisitos y el proceso de selección? Estoy muy interesado/a en aplicar.\n\n🔗 Link del anuncio: ${adUrl}\n\n¡Gracias por su tiempo! 😊`;
        break;
      case 'inmuebles':
        message = `🏠 Hola, vi su publicación de *${categoryName}* en BuscaDis.com y me interesó el inmueble:\n\n"${publication.title}"\n\n¿Podría proporcionarme más detalles sobre las características, disponibilidad y condiciones? Me gustaría coordinar una visita si es posible.\n\n🔗 Link del anuncio: ${adUrl}\n\n¡Quedo atento/a a su respuesta! 😊`;
        break;
      case 'vehiculos':
        message = `🚗 Hola, vi su anuncio de *${categoryName}* en BuscaDis.com y me interesó el vehículo:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre el estado, historial y documentación? Me gustaría conocer más detalles para una posible compra.\n\n🔗 Link del anuncio: ${adUrl}\n\n¡Gracias por su atención! 😊`;
        break;
      case 'servicios':
        message = `🛠️ Hola, vi su oferta de *${categoryName}* en BuscaDis.com y necesito información sobre:\n\n"${publication.title}"\n\n¿Podría contarme más sobre su experiencia, tarifas y disponibilidad? Estoy interesado/a en contratar este servicio.\n\n🔗 Link del anuncio: ${adUrl}\n\n¡Espero su respuesta! 😊`;
        break;
      case 'productos':
        message = `🛍️ Hola, vi su producto en BuscaDis.com y me interesó:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre las especificaciones, garantía y formas de pago disponibles?\n\n🔗 Link del anuncio: ${adUrl}\n\n¡Gracias! 😊`;
        break;
      default:
        message = `👋 Hola, vi su anuncio de *${categoryName}* en BuscaDis.com y me interesó:\n\n"${publication.title}"\n\n¿Podría brindarme más información al respecto? Estoy muy interesado/a.\n\n🔗 Link del anuncio: ${adUrl}\n\n¡Quedo atento/a a su respuesta! 😊`;
    }
    return encodeURIComponent(message);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    // TODO: Integrar con la base de datos de favoritos
    try {
      const response = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId: publication.id })
      });
      
      if (!response.ok) {
        // Revertir el estado si hay error
        setIsFavorite(isFavorite);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      setIsFavorite(isFavorite);
    }
  };

  // Enhanced share function with automatic copy
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}${seoUrl}`;
    
    const shareData = {
      title: `${publication.title} - BuscaDis`,
      text: `${publication.description}\n\nEncuentra más oportunidades en BuscaDis.com`,
      url: shareUrl
    };

    // Always copy to clipboard first
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }

    // Then try native sharing if available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User canceled sharing or error occurred
        console.log('Sharing cancelled or failed:', err);
      }
    }
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (publication.whatsapp) {
      const cleanPhone = publication.whatsapp.replace(/[^0-9]/g, '');
      const message = createEnhancedWhatsAppMessage();
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    }
  };

  const handleClick = () => {
    if (onPublicationClick) {
      onPublicationClick(publication);
    }
  };

  // Get category info
  const CategoryIcon = categoryIcons[publication.categorySlug] || ShoppingBagIcon;
  const categoryColor = categoryColors[publication.categorySlug] || 'bg-gray-100 text-gray-800';

  // Diseño optimizado para modo lista con mejor aprovechamiento del espacio
  const cardClasses = viewMode === 'list' 
    ? `
        publication-card-list group relative bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md 
        transition-all duration-200 cursor-pointer border border-gray-200 dark:border-slate-700 
        hover:border-gray-300 dark:hover:border-slate-600 flex flex-row h-32 overflow-hidden ${className}
        ${publication.premium ? 'ring-1 ring-cyan-400 shadow-cyan-400/20' : ''}
        ${variant === 'featured' ? 'ring-1 ring-blue-500 ring-opacity-50' : ''}
      `.trim()
    : `
        publication-card group relative bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg 
        transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-slate-700 
        hover:border-gray-300 dark:hover:border-slate-600 h-80 flex flex-col ${className}
        ${publication.premium ? 'ring-2 ring-cyan-400 shadow-cyan-400/30 shadow-xl' : ''}
        ${variant === 'featured' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `.trim();

  return (
    <>
      <motion.div 
        className={cardClasses} 
        onClick={handleClick}
        whileHover={{ y: viewMode === 'list' ? 0 : -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={seoUrl} className={viewMode === 'list' ? 'flex flex-row w-full h-full' : 'block h-full w-full flex flex-col'}>
          {/* Image Container */}
          <div className={`image-container relative overflow-hidden ${
            viewMode === 'list' 
              ? 'w-32 h-32 flex-shrink-0 rounded-l-lg' 
              : 'h-48 rounded-t-lg flex-shrink-0'
          }`}>
            <Image
              src={mainImage}
              alt={publication.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultImageByCategory(publication.categorySlug);
              }}
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Price Badge - Para ambos modos */}
            {formatPrice(publication.value, publication.currency) && (
              <div className={`absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-full shadow-lg backdrop-blur-sm ${
                viewMode === 'list' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
              }`}>
                {formatPrice(publication.value, publication.currency)}
              </div>
            )}
            
            {/* Featured Badge */}
            {publication.featured && !publication.premium && (
              <div className={`absolute top-2 right-2 bg-blue-500 text-white font-bold rounded-full shadow-md ${
                viewMode === 'list' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'
              }`}>
                {viewMode === 'list' ? '🚀' : '🚀 Destacado'}
              </div>
            )}

            {/* Views Badge - Solo en grid mode */}
            {viewMode === 'grid' && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <EyeIcon className="w-3 h-3" />
                {publication.views || 0}
              </div>
            )}

            {/* Favorite Button en imagen - Solo para grid mode */}
            {viewMode === 'grid' && (
              <button
                onClick={handleFavoriteToggle}
                className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 z-10"
                aria-label="Agregar a favoritos"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Content - Layout completamente diferente para lista */}
          <div className={`content flex ${
            viewMode === 'list' 
              ? 'flex-1 p-2 flex-col justify-between min-h-0' 
              : 'p-4 flex-1 min-h-0 flex-col'
          }`}>
            {viewMode === 'list' ? (
              /* Lista completa - Toda la información organizada */
              <>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Fila superior: Título, categoría y favorito */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                        {publication.title}
                      </h3>
                      
                      {/* Categoría badge */}
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                        <CategoryIcon className="w-3 h-3" />
                        <span className="capitalize">
                          {publication.subcategorySlug || publication.categorySlug}
                        </span>
                      </div>
                    </div>
                    
                    {/* Botón favorito */}
                    <button
                      onClick={handleFavoriteToggle}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                      aria-label="Favorito"
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Descripción */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                    {publication.description}
                  </p>
                  
                  {/* Precio destacado - Solo si no hay precio en la imagen o para dar énfasis */}
                  {formatPrice(publication.value, publication.currency) && (
                    <div className="text-blue-600 font-bold text-lg mb-3">
                      {formatPrice(publication.value, publication.currency)}
                    </div>
                  )}
                  
                  {/* Fila inferior: Metadatos y botón contactar */}
                  <div className="flex items-center justify-between">
                    {/* Metadatos izquierda */}
                    <div className="flex items-center text-xs text-gray-500 space-x-2 sm:space-x-4 flex-wrap">
                      {/* Ubicación */}
                      <div className="flex items-center">
                        <MapPinIcon className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="truncate max-w-20 sm:max-w-24">{formatLocation(publication.location)}</span>
                      </div>
                      
                      {/* Fecha */}
                      <div className="flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="whitespace-nowrap">{formatExactDateTime(publication.createdAt)}</span>
                      </div>
                      
                      {/* Vistas */}
                      <div className="flex items-center">
                        <EyeIcon className="w-3 h-3 mr-1 text-gray-400" />
                        <span>{publication.views || 0}</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción derecha */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Botón compartir */}
                      <button
                        onClick={handleShare}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Compartir"
                      >
                        <ShareIcon className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {/* Botón WhatsApp con texto */}
                      {showWhatsApp && publication.whatsapp && (
                        <button
                          onClick={handleWhatsAppClick}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          aria-label="Contactar por WhatsApp"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Contactar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Grid mode - Layout original */
              <>
                <div className="flex-1 min-h-0">
                  <h3 className="title font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors text-base mb-2 line-clamp-2">
                    {publication.title}
                  </h3>

                  <p className="description text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {publication.description}
                  </p>
                </div>
              </>
            )}

            {/* Footer Section - Solo para grid mode */}
            {viewMode === 'grid' && (
              <div className="space-y-1 mt-auto">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center max-w-[50%]">
                    <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{formatLocation(publication.location)}</span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>{formatExactDateTime(publication.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                    <CategoryIcon className="w-3 h-3" />
                    <span className="capitalize">
                      {publication.subcategorySlug || publication.categorySlug}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleShare}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Compartir"
                    >
                      <ShareIcon className="w-4 h-4 text-gray-500" />
                    </button>

                    {showWhatsApp && publication.whatsapp && (
                      <button
                        onClick={handleWhatsAppClick}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1.5 rounded-full shadow-sm transition-all hover:scale-105"
                        aria-label="Contactar por WhatsApp"
                      >
                        <WhatsAppIcon className="w-3 h-3" />
                        <span>Contactar</span>
                      </button>
                    )}

                    <button
                      onClick={handleFavoriteToggle}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Agregar a favoritos"
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Toast notification for copied link */}
      {showCopiedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ¡Enlace copiado al portapapeles!
        </motion.div>
      )}
    </>
  );
}