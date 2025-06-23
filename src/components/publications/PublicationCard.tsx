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

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  };

  // Create personalized WhatsApp message
  const createWhatsAppMessage = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const adUrl = `${baseUrl}${seoUrl}`;
    
    let message = '';
    switch (publication.categorySlug) {
      case 'empleos':
        message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" que vi en BuscaDis: ${adUrl}`;
        break;
      case 'inmuebles':
        message = `Hola, me interesa el inmueble "${publication.title}" que tienes publicado en BuscaDis: ${adUrl}`;
        break;
      case 'vehiculos':
        message = `Hola, me interesa el vehículo "${publication.title}" que tienes en BuscaDis: ${adUrl}`;
        break;
      case 'servicios':
        message = `Hola, necesito información sobre el servicio "${publication.title}" que ofreces en BuscaDis: ${adUrl}`;
        break;
      default:
        message = `Hola, me interesa tu anuncio "${publication.title}" en BuscaDis: ${adUrl}`;
    }
    return encodeURIComponent(message);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Aquí iría la lógica para guardar/quitar de favoritos
  };

  // Handle share
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: publication.title,
      text: publication.description,
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}${seoUrl}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      // TODO: Show toast notification
    }
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (publication.whatsapp) {
      const cleanPhone = publication.whatsapp.replace(/[^0-9]/g, '');
      const message = createWhatsAppMessage();
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

  // Card classes based on view mode
  const cardClasses = viewMode === 'list' 
    ? `
        publication-card list-mode group relative bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg 
        transition-all duration-300 cursor-pointer border border-gray-200 dark:border-slate-700 
        hover:border-gray-300 dark:hover:border-slate-600 flex flex-row h-32 ${className}
        ${variant === 'featured' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `.trim()
    : `
        publication-card group relative bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg 
        transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-slate-700 
        hover:border-gray-300 dark:hover:border-slate-600 ${className}
        ${variant === 'featured' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `.trim();

  return (
    <motion.div 
      className={cardClasses} 
      onClick={handleClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={seoUrl} className={viewMode === 'list' ? 'flex flex-row w-full h-full' : 'block h-full'}>
        {/* Image Container */}
        <div className={`image-container relative overflow-hidden ${
          viewMode === 'list' 
            ? 'w-40 h-32 flex-shrink-0 rounded-l-lg' 
            : 'h-48 rounded-t-lg'
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
          
          {/* Premium Badge */}
          {publication.premium && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              ⭐ Premium
            </div>
          )}
          
          {/* Featured Badge */}
          {publication.featured && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              🚀 Destacado
            </div>
          )}

          {/* Views Badge - Solo en grid mode */}
          {viewMode === 'grid' && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <EyeIcon className="w-3 h-3" />
              {publication.views || 0}
            </div>
          )}

          {/* Favorite Button - Solo en grid mode */}
          {viewMode === 'grid' && (
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 z-10"
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

        {/* Content */}
        <div className={`content flex flex-col ${
          viewMode === 'list' 
            ? 'flex-1 p-3 justify-between' 
            : 'p-4 flex-1'
        }`}>
          {/* Title */}
          <div className="flex-1">
            <h3 className={`title font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors ${
              viewMode === 'list' 
                ? 'text-sm mb-1 line-clamp-1' 
                : 'text-base mb-2 line-clamp-2'
            }`}>
              {publication.title}
            </h3>

            {/* Description - Solo en grid mode o versión compacta en list */}
            <p className={`description text-gray-600 dark:text-gray-400 ${
              viewMode === 'list' 
                ? 'text-xs line-clamp-1 mb-2' 
                : 'text-sm mb-3 line-clamp-2'
            }`}>
              {publication.description}
            </p>

            {/* Price */}
            {formatPrice(publication.value, publication.currency) && (
              <div className={`font-bold text-blue-600 dark:text-blue-400 ${
                viewMode === 'list' ? 'text-sm mb-2' : 'text-lg mb-3'
              }`}>
                {formatPrice(publication.value, publication.currency)}
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="space-y-2">
            {/* Top Row: Location, Time, Views (en list mode) */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center max-w-[60%]">
                <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{formatLocation(publication.location)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  <span>{formatRelativeTime(publication.createdAt)}</span>
                </div>
                
                {viewMode === 'list' && (
                  <div className="flex items-center">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    <span>{publication.views || 0}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Category Badge and Action Buttons */}
            <div className="flex items-center justify-between">
              {/* Category Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                <CategoryIcon className="w-3 h-3" />
                <span className="capitalize">
                  {publication.subcategorySlug || publication.categorySlug}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Favorite Button - Solo en list mode */}
                {viewMode === 'list' && (
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
                )}

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Compartir"
                >
                  <ShareIcon className="w-4 h-4 text-gray-500" />
                </button>

                {/* WhatsApp Button */}
                {showWhatsApp && publication.whatsapp && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1.5 rounded-full shadow-sm transition-all hover:scale-105"
                    aria-label="Contactar por WhatsApp"
                  >
                    <WhatsAppIcon className="w-3 h-3" />
                    {viewMode === 'grid' && <span className="hidden sm:inline">WhatsApp</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}