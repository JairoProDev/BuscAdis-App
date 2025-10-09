// /components/publications/PublicationCard.tsx

import React from 'react'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  MapPinIcon,
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { WhatsAppIcon } from '@/components/icons';
import { useMemo } from 'react';
import { getDefaultImageByCategory } from '@/utils/image-helpers';
import { PlanBadge, BoostBadge, FeaturedBadge } from '@/components/premium/PremiumBadge';

import { PublicationData } from '@/types/publication';
import { generatePublicationUrl } from '@/lib/routing';

interface PublicationCardProps {
  publication: PublicationData;
  onPublicationClick?: (publication: PublicationData) => void;
  className?: string;
  showWhatsApp?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  viewMode?: 'grid' | 'list';
  index?: number; // Add index for priority loading
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

// Componente SVG para flecha curveada de compartir (estilo Facebook/TikTok)
const CurvedShareIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth={2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
)

interface CategoryTagProps {
  categorySlug: string;
}

const CategoryTag: React.FC<CategoryTagProps> = ({ categorySlug }) => {
  const Icon = categoryIcons[categorySlug] || PaperAirplaneIcon;
  
  return (
    <div className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 bg-slate-800/90 text-white border border-slate-700/50 backdrop-blur-sm">
      <Icon className="w-3.5 h-3.5" />
      <span>{categorySlug.toUpperCase()}</span>
    </div>
  );
};

export default function PublicationCard({
  publication,
  onPublicationClick,
  className = '',
  showWhatsApp = true,
  viewMode = 'grid',
  index = 0
}: PublicationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Hook para detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      // setIsDesktop(window.innerWidth >= 768); // Removed as per edit hint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); // Removed setIsDesktop from dependency array

  // Generate SEO-friendly URL
  const seoUrl = useMemo(() => {
    return generatePublicationUrl(publication);
  }, [publication])

  // Format price locally
  const formatPriceLocal = (value: number, currency: string) => {
    if (!value || value === 0) return null;
    return `${currency === 'USD' ? '$' : 'S/'} ${value.toLocaleString()}`;
  };

  // Handle price inquiry message
  const handlePriceInquiry = () => {
    // Track price inquiry click for analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'price_inquiry', {
        'publication_id': publication.id,
        'category': publication.categorySlug,
        'location': publication.location?.district || 'unknown'
      });
      
      fetch('/api/analytics/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationId: publication.id,
          category: publication.categorySlug,
          action: 'price_inquiry',
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.log('Analytics error:', err));
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const adUrl = `${baseUrl}${seoUrl}`;
    const categoryName = publication.categorySlug.charAt(0).toUpperCase() + publication.categorySlug.slice(1);
    
    let priceType = 'precio';
    switch (publication.categorySlug) {
      case 'empleos':
        priceType = 'sueldo';
        break;
      case 'inmuebles':
        priceType = 'alquiler o precio';
        break;
      case 'vehiculos':
        priceType = 'precio';
        break;
      case 'servicios':
        priceType = 'costo del servicio';
        break;
      default:
        priceType = 'precio';
        break;
    }

    const message = `👋 ¡Hola! Vi su adiso de *${categoryName}* en BuscaDis.com y me interesa mucho:\n\n"${publication.title}"\n\nMe gustaría saber cuál es el ${priceType}. ¿Podría brindarme esa información?\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias! 😊`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${publication.whatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Format location - solo mostrar distrito en el card para optimizar clicks
  const formatLocation = (location: PublicationData['location']) => {
    if (!location) return 'Distrito no especificado';
    
    // En el card solo mostrar el distrito para maximizar clicks
    // El usuario verá la ubicación completa al hacer click
    return location.district || 'Distrito no especificado';
  };

  // Format title - siempre en mayúsculas
  const formatTitle = (title: string) => {
    return title.toUpperCase();
  };

  // Format description - primera letra mayúscula y remover números de teléfono
  const formatDescription = (description: string) => {
    if (!description) return '';
    
    // Remover números de teléfono (patrones comunes)
    const cleanDescription = description
      .replace(/(\+?51\s?)?9\d{8}/g, '') // Celulares peruanos
      .replace(/(\+?51\s?)?\d{2,3}[-\s]?\d{6,7}/g, '') // Teléfonos fijos peruanos
      .replace(/\b\d{9,12}\b/g, '') // Números largos
      .replace(/\b\d{3}[-\s]?\d{3}[-\s]?\d{3,4}\b/g, '') // Formatos con guiones/espacios
      .replace(/whatsapp\s*:?\s*\d+/gi, '') // "WhatsApp: 123456789"
      .replace(/celular\s*:?\s*\d+/gi, '') // "Celular: 123456789"
      .replace(/teléfono\s*:?\s*\d+/gi, '') // "Teléfono: 123456789"
      .replace(/contacto\s*:?\s*\d+/gi, '') // "Contacto: 123456789"
      .trim()
      .replace(/\s+/g, ' '); // Limpiar espacios múltiples
    
    // Primera letra mayúscula
    if (cleanDescription.length > 0) {
      return cleanDescription.charAt(0).toUpperCase() + cleanDescription.slice(1);
    }
    
    return cleanDescription;
  };

  // Get main image with proper validation
  const getMainImage = () => {
    // If image failed to load, use default
    if (imageError) {
      return getDefaultImageByCategory(publication.categorySlug);
    }
    
    const firstImage = publication.images?.[0];
    
    // Check if we have a valid image URL
    if (firstImage && 
        firstImage.trim() !== '' && 
        !firstImage.includes('undefined') && 
        !firstImage.includes('null')) {
      return firstImage;
    }
    
    // Fallback to category default image
    return getDefaultImageByCategory(publication.categorySlug);
  };
  
  const mainImage = getMainImage();
  
  // Handle image load error
  const handleImageError = () => {
    console.log('[PublicationCard] Image load error, falling back to default');
    setImageError(true);
  };

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

  // Create enhanced personalized WhatsApp message with analytics tracking
  const createEnhancedWhatsAppMessage = () => {
    // Track contact click for analytics
    if (typeof window !== 'undefined') {
      // Send analytics event
      window.gtag?.('event', 'contact_click', {
        'publication_id': publication.id,
        'category': publication.categorySlug,
        'location': publication.location?.district || 'unknown'
      });
      
      // Custom analytics for BuscaDis
      fetch('/api/analytics/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationId: publication.id,
          category: publication.categorySlug,
          action: 'contact_click',
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.log('Analytics error:', err));
    }
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const adUrl = `${baseUrl}${seoUrl}`;
    
    let message = '';
    const categoryName = publication.categorySlug.charAt(0).toUpperCase() + publication.categorySlug.slice(1);
    
    switch (publication.categorySlug) {
      case 'empleos':
        message = `🔍 Hola, vi su adiso de *${categoryName}* en BuscaDis.com y me interesó mucho la oportunidad:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre los requisitos y el proceso de selección? Estoy muy interesado/a en aplicar.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias por su tiempo! 😊`;
        break;
      case 'inmuebles':
        message = `🏠 ¡Hola! Estoy interesado/a en el inmueble que publicó en BuscaDis.com:\n\n"${publication.title}"\n\n¿Estaría disponible para una visita o podría compartir más detalles sobre la propiedad (precio, área, etc.)?\n\n🔗 Link del adiso: ${adUrl}\n\n¡Quedo a la espera, gracias! 👍`;
        break;
      case 'vehiculos':
        message = `🚗 ¡Hola! Me interesa el vehículo que vi en BuscaDis.com:\n\n"${publication.title}"\n\nMe gustaría saber más sobre el estado del vehículo, el kilometraje y si es posible coordinar una prueba de manejo.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias! 🏁`;
        break;
      case 'servicios':
        message = `🛠️ ¡Hola! Encontré su servicio de *${categoryName}* en BuscaDis.com y me gustaría solicitar una cotización para lo siguiente:\n\n[Describe brevemente tu necesidad aquí]\n\nPor favor, hágame saber los próximos pasos.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias! 🤝`;
        break;
      case 'productos':
        message = `🛍️ ¡Hola! Vi su producto en BuscaDis.com y tengo una pregunta:\n\n"${publication.title}"\n\n¿Todavía está disponible? ¿Cuál es el precio final y dónde podría recogerlo?\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias! 🛒`;
        break;
      default:
        message = `👋 ¡Hola! Vi su adiso en BuscaDis.com y me gustaría obtener más información:\n\n"${publication.title}"\n\n¿Podría darme más detalles, por favor?\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias! ✨`;
        break;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${publication.whatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${seoUrl}`;
    const text = `¡Echa un vistazo a este adiso en BuscaDis!: ${publication.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: text,
          url: url,
        });
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(url);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí iría la lógica para guardar en localStorage o en el backend
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-row ${className}`}
      >
        {/* Image container - Más ancho para evitar que se vea aplastada */}
        <div className="w-1/3 flex-shrink-0 relative min-h-[140px]">
          <a href={seoUrl} onClick={(e) => { e.preventDefault(); onPublicationClick?.(publication); }} className="block h-full">
            <Image
              src={mainImage}
              alt={publication.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 40vw, (max-width: 1024px) 30vw, 200px"
              onError={handleImageError}
            />
          </a>
          <CategoryTag categorySlug={publication.categorySlug} />
          
          {/* Botones de interacción - Mejor posicionamiento para evitar superposición */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button onClick={handleFavorite} className="bg-black/40 p-1.5 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-sm">
              {isFavorite ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
            </button>
            <button onClick={handleShare} className="bg-black/40 p-1.5 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-sm">
              <CurvedShareIcon className="w-4 h-4" />
            </button>
          </div>
          {showCopiedMessage && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
              ¡Enlace copiado!
            </div>
          )}
        </div>

        {/* Content - Ajustado a la nueva altura de imagen */}
        <div className="p-4 flex-1 flex flex-col justify-between min-h-[140px]">
          <div className="flex-1">
            {/* Title - Solo 1 línea en vista de lista */}
            <a href={seoUrl} onClick={(e) => { e.preventDefault(); onPublicationClick?.(publication); }} className="block mb-2">
              <h3 className="font-bold text-lg leading-tight hover:text-[#14b8a6] transition-colors duration-200 line-clamp-1">
                {formatTitle(publication.title)}
              </h3>
            </a>
            
            {/* Premium Badges */}
            <div className="flex items-center gap-2 mb-2">
              {publication.premium && (
                <PlanBadge plan="premium" size="sm" />
              )}
              {publication.featured && (
                <FeaturedBadge size="sm" />
              )}
              {publication.premium && (
                <BoostBadge size="sm" />
              )}
            </div>
            
            {/* Description - Solo 2 líneas en vista de lista */}
            {publication.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {formatDescription(publication.description)}
              </p>
            )}
            
            {/* Location and Date */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{formatLocation(publication.location)}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                {formatExactDateTime(publication.createdAt)}
              </div>
            </div>
          </div>

          {/* Price y Contact Button en la misma línea */}
          <div className="flex items-center justify-between">
            <div>
              {formatPriceLocal(publication.value, publication.currency) ? (
                <div className="text-xl font-extrabold text-[#14b8a6] dark:text-[#14b8a6]">
                  {formatPriceLocal(publication.value, publication.currency)}
                </div>
              ) : (
                <button
                  onClick={handlePriceInquiry}
                  className="text-xl font-extrabold text-[#14b8a6] dark:text-[#14b8a6] hover:text-[#0d9488] dark:hover:text-[#0d9488] transition-colors cursor-pointer"
                >
                  {publication.categorySlug === 'empleos' ? '¿Sueldo?' : '¿Precio?'}
                </button>
              )}
            </div>
            
            {/* Contact Button al lado del precio */}
            {showWhatsApp && (
              <button 
                onClick={createEnhancedWhatsAppMessage} 
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Contactar
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-slate-800 dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-700/50 ${className}`}
    >
      {/* Image container */}
      <div className="relative w-full" style={{ paddingBottom: '75%' /* 4:3 aspect ratio */ }}>
        <a href={seoUrl} onClick={(e) => { e.preventDefault(); onPublicationClick?.(publication); }} className="block h-full">
          <Image
            src={mainImage}
            alt={publication.title}
            fill
            className="object-cover absolute top-0 left-0 w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={index < 6} // Priority loading for first 6 images
            loading={index < 6 ? 'eager' : 'lazy'}
            onError={handleImageError}
          />
        </a>
        <CategoryTag categorySlug={publication.categorySlug} />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button onClick={handleFavorite} className="bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors" aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}>
            {isFavorite ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
          </button>
          <button onClick={handleShare} className="bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors" aria-label="Compartir publicación">
            <CurvedShareIcon className="w-5 h-5" />
          </button>
        </div>
        {showCopiedMessage && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
            ¡Enlace copiado!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-slate-800 dark:bg-slate-900">
        <div>
          {/* Title */}
          <a href={seoUrl} onClick={(e) => { e.preventDefault(); onPublicationClick?.(publication); }} className="block mb-2">
            <h3 className="font-bold text-sm leading-tight text-white hover:text-[#14b8a6] transition-colors duration-200 line-clamp-2">
              {formatTitle(publication.title)}
            </h3>
          </a>
          
          {/* Premium Badges */}
          <div className="flex items-center gap-2 mb-2">
            {publication.premium && (
              <PlanBadge plan="premium" size="sm" />
            )}
            {publication.featured && (
              <FeaturedBadge size="sm" />
            )}
            {/* Add boost badge if publication is boosted */}
            {publication.premium && (
              <BoostBadge size="sm" />
            )}
          </div>
          
          {/* Description */}
          {/*
          {publication.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {formatDescription(publication.description)}
            </p>
          )}
          */}
          {/* Location and Date */}
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{formatLocation(publication.location)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-400 flex-shrink-0">
              <CalendarIcon className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
              {formatExactDateTime(publication.createdAt)}
            </div>
          </div>
        </div>

        {/* Price and WhatsApp Button (side by side on desktop) */}
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Price */}
          {formatPriceLocal(publication.value, publication.currency) ? (
            <div className="text-sm font-extrabold text-[#14b8a6] dark:text-[#14b8a6]">
              {formatPriceLocal(publication.value, publication.currency)}
            </div>
          ) : (
            <button
              onClick={handlePriceInquiry}
              className="text-base font-extrabold text-[#14b8a6] dark:text-[#14b8a6] hover:text-[#0d9488] dark:hover:text-[#0d9488] transition-colors cursor-pointer px-2 py-1 rounded"
              style={{ minWidth: '90px' }}
            >
              {publication.categorySlug === 'empleos' ? '¿Sueldo?' : '¿Precio?'}
            </button>
          )}

          {/* WhatsApp Button (side by side on desktop, full width on mobile) */}
          {showWhatsApp && (
            <button 
              onClick={createEnhancedWhatsAppMessage}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#14b8a6] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#0d9488] active:bg-[#0f766e] transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg mt-2 sm:mt-0"
              style={{ minWidth: '110px' }}
            >
              <WhatsAppIcon className="w-6 h-6 min-w-[1.5rem] min-h-[1.5rem]" />
              <span className="text-base">Contactar</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}