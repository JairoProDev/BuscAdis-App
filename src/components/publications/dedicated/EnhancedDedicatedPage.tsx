'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShareIcon, 
  MapPinIcon, 
  ArrowLeftIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  EyeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon
} from '@heroicons/react/24/solid';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDefaultImageByCategory } from '@/utils/image-helpers';
import PublicationAttributes from '../PublicationAttributes';
import PublicationContact from '../PublicationContact';
import { useToast } from '@/components/ui/use-toast';

interface EnhancedDedicatedPageProps {
  publication: PublicationData;
  relatedPublications?: PublicationData[];
  onShare?: () => void;
  onFavorite?: () => void;
  onWhatsAppClick?: () => void;
}

export default function EnhancedDedicatedPage({
  publication,
  relatedPublications = [],
  onWhatsAppClick,
  onShare,
  onFavorite
}: EnhancedDedicatedPageProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [viewCount, setViewCount] = useState(publication.views || 0);
  const [isLoading, setIsLoading] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const imageModalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const images = publication.images?.length > 0 ? publication.images : [getDefaultImageByCategory(publication.categorySlug)];

  // Format price with enhanced styling
  const formatPrice = (value: number, currency: string) => {
    if (!value || value === 0) return 'Precio a consultar';
    return `${currency === 'USD' ? '$' : 'S/'} ${value.toLocaleString()}`;
  };

  // Format location with enhanced display
  const formatLocation = (location: PublicationData['location']) => {
    if (!location) return 'Ubicación no especificada';
    
    const parts = [];
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.city) parts.push(location.city);
    
    return parts.length > 0 ? parts.join(', ') : 'Ubicación no especificada';
  };

  // Format date with relative time
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

  // Handle favorite toggle with animation
  const handleFavoriteToggle = async () => {
    setIsFavorite(!isFavorite);
    onFavorite?.();
    
    // Simulate API call
    try {
      await fetch(`/api/publications/${publication.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite })
      });
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  // Enhanced share functionality
  const handleShareClick = async () => {
    setIsLoading(true);
    
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
      // Enhanced clipboard fallback with toast
      await navigator.clipboard.writeText(window.location.href);
      // Show success toast
      toast({
        title: "Éxito",
        description: "Enlace copiado al portapapeles",
        type: "default"
      });
    }
    onShare?.();
    setIsLoading(false);
  };

  // WhatsApp contact handler
  const handleWhatsAppContact = () => {
    if (!publication.whatsapp) return;
    
    const cleanPhone = publication.whatsapp.replace(/[^0-9]/g, '');
    const baseUrl = window.location.origin;
    const adUrl = `${baseUrl}/adiso/${publication.id}`;
    const message = `Hola! Vi tu anuncio "${publication.title}" en BuscAdis y me interesa. ¿Podrías darme más información? ${adUrl}`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    onWhatsAppClick?.();
  };

  // Toast notification is now handled by useToast hook

  // Handle sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        const rect = stickyRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 80);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track view count
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/publications/${publication.id}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'view' })
        });
        setViewCount(prev => prev + 1);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [publication.id]);

  // Enhanced image modal
  const ImageModal = () => (
    <AnimatePresence>
      {showImageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
            ref={imageModalRef}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <Image
              src={images[currentImageIndex]}
              alt={publication.title}
              width={800}
              height={600}
              className="object-contain max-w-full max-h-full rounded-lg"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Enhanced contact modal
  const ContactModal = () => (
    <AnimatePresence>
      {showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Contactar al vendedor
            </h3>
            
            <div className="space-y-3">
              {publication.whatsapp && (
                <button
                  onClick={handleWhatsAppContact}
                  className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  <ChatSolidIcon className="w-6 h-6" />
                  WhatsApp
                </button>
              )}
              
              {publication.phone && (
                <button
                  onClick={() => window.open(`tel:${publication.phone}`, '_self')}
                  className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  <PhoneIcon className="w-6 h-6" />
                  Llamar
                </button>
              )}
              
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Report modal
  const ReportModal = () => (
    <AnimatePresence>
      {showReportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Reportar anuncio
            </h3>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="font-semibold text-gray-900 dark:text-white">Contenido inapropiado</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">El anuncio contiene contenido ofensivo o inapropiado</div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="font-semibold text-gray-900 dark:text-white">Información falsa</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">La información del anuncio es incorrecta o engañosa</div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="font-semibold text-gray-900 dark:text-white">Spam</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Este anuncio es spam o contenido no deseado</div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="font-semibold text-gray-900 dark:text-white">Otro motivo</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tengo otro motivo para reportar este anuncio</div>
              </button>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast({
                    title: "Reporte enviado",
                    description: "Tu reporte ha sido enviado correctamente",
                    type: "default"
                  });
                  setShowReportModal(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Reportar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Enhanced Header with Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Inicio
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <Link href={`/${publication.categorySlug}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 capitalize">
                {publication.categorySlug}
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
                {publication.title}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver
            </button>

            {/* Enhanced Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="relative w-full aspect-[4/3] group">
                <Image
                  src={images[currentImageIndex]}
                  alt={publication.title}
                  fill
                  className="object-cover cursor-pointer transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
                  priority
                  onClick={() => setShowImageModal(true)}
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                
                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage} 
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
                
                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${publication.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              {/* Title and Meta */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {publication.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{formatLocation(publication.location)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(publication.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{viewCount} vistas</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formatPrice(publication.value, publication.currency)}
                </div>
                {publication.value > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Precio {publication.currency === 'USD' ? 'en dólares' : 'en soles'}
                  </div>
                )}
              </div>

              {/* Enhanced Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  Descripción
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${!showFullDescription && 'line-clamp-4'}`}>
                    {publication.description}
                  </p>
                  {publication.description.length > 200 && (
                    <button 
                      onClick={() => setShowFullDescription(!showFullDescription)} 
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {showFullDescription ? 'Leer menos' : 'Leer más'}
                    </button>
                  )}
                </div>
              </div>

              {/* Enhanced Attributes */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  Características
                </h2>
                <PublicationAttributes attributes={publication.attributes} />
              </div>

              {/* Enhanced Contact Section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Información del vendedor
                </h2>
                <PublicationContact publication={publication} />
              </div>
            </div>

            {/* Related Publications */}
            {relatedPublications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <StarIcon className="w-6 h-6 text-yellow-500" />
                  Anuncios similares
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPublications.map((relatedPub) => (
                    <Link key={relatedPub.id} href={`/adiso/${relatedPub.id}`} className="group">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="relative w-full h-40">
                          <Image
                            src={relatedPub.images?.[0] || getDefaultImageByCategory(relatedPub.categorySlug)}
                            alt={relatedPub.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {relatedPub.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{formatLocation(relatedPub.location)}</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatPrice(relatedPub.value, relatedPub.currency)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div 
              ref={stickyRef}
              className={`space-y-6 ${isSticky ? 'lg:sticky lg:top-24' : ''}`}
            >
              {/* Contact Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contactar al vendedor
                </h3>
                
                <div className="space-y-3">
                  {publication.whatsapp && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleWhatsAppContact}
                      className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-xl font-semibold transition-colors shadow-lg"
                    >
                      <ChatSolidIcon className="w-6 h-6" />
                      WhatsApp
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowContactModal(true)}
                    className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-4 px-4 rounded-xl font-semibold transition-colors shadow-lg"
                  >
                    <PhoneIcon className="w-6 h-6" />
                    Contactar
                  </motion.button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFavoriteToggle}
                    className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold transition-all ${
                      isFavorite 
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isFavorite ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                    {isFavorite ? 'Guardado' : 'Guardar'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShareClick}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 py-3 px-4 rounded-xl font-semibold transition-all"
                  >
                    <ShareIcon className="w-5 h-5" />
                    Compartir
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 py-3 px-4 rounded-xl font-semibold transition-all"
                  >
                    <FlagIcon className="w-5 h-5" />
                    Reportar
                  </motion.button>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  Consejos de seguridad
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Revisa el producto antes de pagar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>No envíes dinero por adelantado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Usa lugares públicos para encuentros</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImageModal />
      <ContactModal />
      <ReportModal />
    </div>
  );
}
