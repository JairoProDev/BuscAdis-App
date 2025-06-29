'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  XMarkIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ShieldCheckIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { WhatsAppIcon } from '@/components/icons';
import { generateSeoUrl } from '@/utils/url';
import { getDefaultImageByCategory } from '@/utils/image-helpers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PublicationData } from '@/types/publication';

interface PublicationDetailSidebarProps {
  publication: PublicationData | null;
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppClick?: (publication: PublicationData) => void;
  onShare?: (publication: PublicationData) => void;
  onFavorite?: (publication: PublicationData, isFavorite: boolean) => void;
}

export default function PublicationDetailSidebar({
  publication,
  isOpen,
  onClose,
  onWhatsAppClick,
  onShare,
  onFavorite
}: PublicationDetailSidebarProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // Reset image index when publication changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [publication?.id]);

  if (!publication) return null;

  const mainImage = publication.images?.[currentImageIndex] || getDefaultImageByCategory(publication.categorySlug);
  const hasMultipleImages = publication.images && publication.images.length > 1;

  // Format price
  const formatPrice = (value: number, currency: string) => {
    if (!value || value === 0) return null;
    return `${currency === 'USD' ? '$' : 'S/'} ${value.toLocaleString()}`;
  };

  // Format location
  const formatLocation = (location: PublicationData['location']) => {
    if (!location) return 'Ubicación no especificada';
    
    const parts = [];
    if (location.reference) parts.push(location.reference);
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Ubicación no especificada';
  };

  // Format date
  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Handle image navigation
  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => 
        prev === publication.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? publication.images!.length - 1 : prev - 1
      );
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onFavorite?.(publication, newFavoriteState);
  };

  // Handle share
  const handleShare = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}${generateSeoUrl(publication.id, publication.title)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }

    onShare?.(publication);
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    onWhatsAppClick?.(publication);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Only show on mobile */}
          {false && ( // Disabled backdrop since we're using integrated layout
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
          )}
          
          {/* Sidebar - Now uses relative positioning for integrated layout */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-full w-full bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden rounded-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {publication.categorySlug.charAt(0).toUpperCase() + publication.categorySlug.slice(1)}
                  </h2>
                  {publication.subcategorySlug && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {publication.subcategorySlug}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleFavoriteToggle}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-full overflow-y-auto pb-20">
              {/* Image Gallery */}
              <div className="relative aspect-video bg-gray-100 dark:bg-slate-800">
                <Image
                  src={mainImage}
                  alt={publication.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                
                {/* Image Navigation */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {publication.images!.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex 
                              ? 'bg-white' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Publication Info */}
              <div className="p-6 space-y-6">
                {/* Title and Price */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {publication.title}
                  </h1>
                  {formatPrice(publication.value, publication.currency) && (
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(publication.value, publication.currency)}
                    </div>
                  )}
                </div>

                {/* Meta Information */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">{formatLocation(publication.location)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatDate(publication.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    <span>{publication.views} vistas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{publication.transactionType}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Descripción
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {publication.description}
                  </p>
                </div>

                {/* Additional Details */}
                {publication.size > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Detalles
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                        <span>Tipo: {publication.valueType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarIcon className="w-4 h-4 text-gray-500" />
                        <span>Tamaño: {publication.size}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium/Featured Badges */}
                {(publication.premium || publication.featured) && (
                  <div className="flex gap-2">
                    {publication.premium && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-full text-sm">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Premium</span>
                      </div>
                    )}
                    {publication.featured && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                        <StarIcon className="w-4 h-4" />
                        <span>Destacado</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Contact Actions */}
            <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
              <div className="flex gap-3">
                {publication.whatsapp && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Contactar</span>
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Toast notification */}
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
      )}
    </AnimatePresence>
  );
} 