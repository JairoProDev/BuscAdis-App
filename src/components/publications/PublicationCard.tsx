// /components/publications/PublicationCard.tsx

import React from 'react'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
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

import { PublicationData } from '@/types/publication';

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
    return generateSeoUrl(publication.id, publication.title);
  }, [publication.id, publication.title]);

  // Format price locally
  const formatPriceLocal = (value: number, currency: string) => {
    if (!value || value === 0) return null;
    return `${currency === 'USD' ? '$' : 'S/'} ${value.toLocaleString()}`;
  };

  // Format location - mostrar ubicación completa
  const formatLocation = (location: PublicationData['location']) => {
    if (!location) return 'Ubicación no especificada';
    
    // Mostrar ubicación completa: Referencia → Distrito → Provincia → Departamento → País
    const parts = [];
    if (location.reference) parts.push(location.reference);
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Ubicación no especificada';
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
    // Funcionalidad de favoritos simulada localmente por ahora
    try {
      // Guardar en localStorage temporalmente
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (isFavorite) {
        const updatedFavorites = favorites.filter((id: string) => id !== publication.id);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      } else {
        favorites.push(publication.id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
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

  const handleClick = (e: React.MouseEvent) => {
    // Prevent any default link behavior if nested
    e.preventDefault();
    e.stopPropagation();
    
    // Call the parent handler if provided
    if (onPublicationClick) {
      onPublicationClick(publication);
    }
  };

  // Get category info
  const CategoryIcon = categoryIcons[publication.categorySlug] || ShoppingBagIcon;
  const categoryColor = categoryColors[publication.categorySlug] || 'bg-gray-100 text-gray-800';

  // Diseño optimizado para modo lista con altura suficiente para todo el contenido
  const cardClasses = viewMode === 'list' 
    ? `
        publication-card-list group relative bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md 
        transition-all duration-200 cursor-pointer border border-gray-200 dark:border-slate-700 
        hover:border-gray-300 dark:hover:border-slate-600 flex flex-row overflow-hidden ${className}
        ${publication.premium ? 'ring-1 ring-cyan-400 shadow-cyan-400/20' : ''}
        ${variant === 'featured' ? 'ring-1 ring-blue-500 ring-opacity-50' : ''}
      `.trim()
    : `
        publication-card group relative bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg 
        transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-slate-700 
        hover:border-gray-300 dark:hover:border-slate-600 flex flex-col ${className}
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
        style={{ cursor: 'pointer' }} // Explicitly set cursor
      >
        <div className={viewMode === 'list' ? 'flex flex-row w-full h-full' : 'block h-full w-full flex flex-col'}>
          {/* Image Container */}
          <div className={`image-container relative overflow-hidden ${
            viewMode === 'list' 
              ? 'flex-shrink-0 rounded-l-lg' 
              : 'rounded-t-lg flex-shrink-0'
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
                          {formatPriceLocal(publication.value, publication.currency) && (
                <div className={`absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-full shadow-lg backdrop-blur-sm price-element ${
                  viewMode === 'list' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
                }`}>
                  {formatPriceLocal(publication.value, publication.currency)}
                </div>
              )}

            {/* Category Badge - Para ambos modos */}
            <div className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColor} shadow-md backdrop-blur-sm`}>
              <CategoryIcon className="w-3 h-3" />
              <span className="capitalize hidden sm:inline">
                {publication.subcategorySlug || publication.categorySlug}
              </span>
            </div>
            
            {/* Featured Badge - Solo en grid */}
            {viewMode === 'grid' && publication.featured && !publication.premium && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white font-bold rounded-full shadow-md px-2 py-1 text-xs favorite-element">
                🚀 Destacado
              </div>
            )}

            {/* Views Badge removido - solo en el footer ahora */}



          </div>

          {/* Content - Layout completamente diferente para lista */}
          <div className={`content flex ${
            viewMode === 'list' 
              ? 'flex-1 flex-col justify-between min-h-0' 
              : 'flex-1 min-h-0 flex-col'
          }`}>
            {viewMode === 'list' ? (
              /* Lista optimizada - Layout responsive perfecto */
              <>
                <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                  {/* Fila 1: Título y favorito */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2">
                      {formatTitle(publication.title)}
                    </h3>
                    
                    {/* Botón favorito */}
                    <button
                      onClick={handleFavoriteToggle}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                      aria-label="Favorito"
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Fila 2: Descripción */}
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-1 md:line-clamp-2 mb-2 md:mb-3 flex-1">
                    {formatDescription(publication.description)}
                  </p>
                  
                  {/* Fila 3: Metadatos */}
                  <div className="flex items-center text-xs text-gray-500 space-x-2 md:space-x-4 mb-2">
                    {/* Ubicación completa - solo una línea */}
                    <div className="flex items-center location-element">
                      <MapPinIcon className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="truncate">
                        {formatLocation(publication.location)}
                      </span>
                    </div>
                    
                    {/* Fecha */}
                    <div className="flex items-center">
                      {/* ClockIcon removed as per edit hint */}
                      <span className="whitespace-nowrap">{formatExactDateTime(publication.createdAt)}</span>
                    </div>
                    
                    {/* Vistas */}
                    <div className="flex items-center">
                      <EyeIcon className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="hidden md:inline">
                        {publication.views || 0} {(publication.views || 0) === 1 ? 'vista' : 'vistas'}
                      </span>
                      <span className="md:hidden">{publication.views || 0}</span>
                    </div>
                  </div>
                  
                  {/* Fila 4: Botones de acción */}
                  <div className="flex items-center justify-between">
                    {/* Botones de redes sociales - Desktop (lado izquierdo) */}
                    <div className="hidden md:flex items-center gap-1">
                      {/* Facebook */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = encodeURIComponent(`${window.location.origin}${seoUrl}`);
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                        }}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        aria-label="Compartir en Facebook"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>
                      
                      {/* Instagram */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}${seoUrl}`);
                          // Instagram no tiene URL de compartir directo, copiamos el enlace
                        }}
                        className="p-1.5 hover:bg-pink-50 text-pink-600 rounded-lg transition-colors"
                        aria-label="Copiar enlace para Instagram"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.070-4.85.070-3.204 0-3.584-.012-4.849-.070-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </button>
                      
                      {/* TikTok */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}${seoUrl}`);
                          // TikTok no tiene URL de compartir web directo
                        }}
                        className="p-1.5 hover:bg-gray-100 text-black rounded-lg transition-colors"
                        aria-label="Copiar enlace para TikTok"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </button>
                      
                      {/* X (Twitter) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const text = encodeURIComponent(`${publication.title} - ${formatPriceLocal(publication.value, publication.currency) || 'Ver precio'}`);
                          const url = encodeURIComponent(`${window.location.origin}${seoUrl}`);
                          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                        }}
                        className="p-1.5 hover:bg-gray-100 text-black rounded-lg transition-colors"
                        aria-label="Compartir en X"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                      
                      {/* LinkedIn */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = encodeURIComponent(`${window.location.origin}${seoUrl}`);
                          const title = encodeURIComponent(publication.title);
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
                        }}
                        className="p-1.5 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors"
                        aria-label="Compartir en LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </button>
                      
                      {/* WhatsApp para compartir */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const text = encodeURIComponent(`${publication.title} - ${formatPriceLocal(publication.value, publication.currency) || 'Ver precio'}`);
                          window.open(`https://wa.me/?text=${text}`, '_blank');
                        }}
                        className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                        aria-label="Compartir por WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488"/>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Lado derecho - Botón Contactar para Modo Lista */}
                    <div className="flex items-center gap-2">
                      {/* Botón Contactar - CTA principal (Desktop) */}
                      {showWhatsApp && publication.whatsapp && (
                        <button
                          onClick={handleWhatsAppClick}
                          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg hover:scale-105"
                          aria-label="Contactar por WhatsApp"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Contactar</span>
                        </button>
                      )}
                      
                                              {/* Botones móviles - Solo iconos */}
                        <div className="md:hidden flex items-center gap-1">
                          {/* Botón Contactar - Móvil */}
                          {showWhatsApp && publication.whatsapp && (
                            <button
                              onClick={handleWhatsAppClick}
                              className="flex items-center justify-center p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-all duration-200 hover:scale-105"
                              aria-label="Contactar por WhatsApp"
                            >
                              <WhatsAppIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </button>
                          )}
                          
                          {/* Botón compartir móvil */}
                          <button
                            onClick={handleShare}
                            className="flex items-center justify-center p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-all duration-200 hover:scale-105"
                            aria-label="Compartir"
                          >
                            <CurvedShareIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Grid mode - Estilo posts de redes sociales */
              <>
                <div className="p-0 flex flex-col h-full">
                  {/* Título */}
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 px-2">
                    {formatTitle(publication.title)}
                  </h3>

                  {/* Descripción */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow px-2">
                    {formatDescription(publication.description)}
                  </p>

                  {/* Footer de interacciones - Tres botones hermanos iguales */}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <div className="grid grid-cols-3 gap-1 px-2">
                      {/* Guardar */}
                      <button
                        onClick={handleFavoriteToggle}
                        className="flex flex-col items-center justify-center gap-1 py-3 px-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                        aria-label="Guardar"
                        title="Guardar"
                      >
                        {isFavorite ? (
                          <HeartSolidIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                        ) : (
                          <HeartIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                        )}
                        <span className="text-xs font-medium text-red-500 dark:text-red-400 hidden sm:block">
                          Guardar
                        </span>
                      </button>

                      {/* Contactar */}
                      <button
                        onClick={showWhatsApp && publication.whatsapp ? handleWhatsAppClick : undefined}
                        disabled={!showWhatsApp || !publication.whatsapp}
                        className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg transition-all duration-200 group ${
                          showWhatsApp && publication.whatsapp 
                            ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500' 
                            : 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                        }`}
                        aria-label="Contactar por WhatsApp"
                        title="Contactar por WhatsApp"
                      >
                        <WhatsAppIcon className={`w-5 h-5 ${
                          showWhatsApp && publication.whatsapp 
                            ? 'text-white' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`} />
                        <span className={`text-xs font-medium hidden sm:block ${
                          showWhatsApp && publication.whatsapp 
                            ? 'text-white' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>
                          Contactar
                        </span>
                      </button>
                      
                      {/* Compartir */}
                      <button
                        onClick={handleShare}
                        className="flex flex-col items-center justify-center gap-1 py-3 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
                        aria-label="Compartir"
                        title="Compartir"
                      >
                        <CurvedShareIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-500 dark:text-blue-400 hidden sm:block">
                          Compartir
                        </span>
                      </button>

                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
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