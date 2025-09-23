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
  UserGroupIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { WhatsAppIcon } from '@/components/icons';
import { useMemo } from 'react';
import { slugify } from '@/lib/utils';
import { getDefaultImageByCategory } from '@/utils/image-helpers';

import { PublicationData } from '@/types/publication';
import { generatePublicationUrl } from '@/lib/routing';

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
    return generatePublicationUrl(publication);
  }, [publication])

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
    const whatsappUrl = `https://wa.me/${publication.contact.phone}?text=${encodedMessage}`;
    
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

  const CategoryTag = () => {
    const Icon = categoryIcons[publication.categorySlug] || PaperAirplaneIcon;
    const colors = categoryColors[publication.categorySlug] || 'bg-gray-100 text-gray-800';
    
    return (
      <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${colors}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{publication.categorySlug.charAt(0).toUpperCase() + publication.categorySlug.slice(1)}</span>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-row ${className}`}
      >
        {/* Image container */}
        <div className="w-1/3 flex-shrink-0 relative">
          <a href={seoUrl} onClick={(e) => { e.preventDefault(); onPublicationClick?.(publication); }} className="block h-full">
            <Image
              src={mainImage}
              alt={publication.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
            />
          </a>
          <CategoryTag />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <a href={seoUrl} onClick={(e) => { e.preventDefault(); onPublicationClick?.(publication); }} className="block mb-2">
              <h3 className="font-bold text-lg leading-tight hover:text-blue-600 transition-colors duration-200">
                {formatTitle(publication.title)}
              </h3>
            </a>
            
            {/* Location */}
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{formatLocation(publication.location)}</span>
            </div>
          </div>

          {/* Price and Date */}
          <div className="flex justify-between items-end">
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatPriceLocal(publication.value, publication.currency)}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {formatExactDateTime(publication.createdAt)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-center items-center p-3 border-l border-gray-200 dark:border-gray-700">
          <button onClick={handleFavorite} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors mb-2">
            {isFavorite ? <HeartSolidIcon className="w-6 h-6 text-red-500" /> : <HeartIcon className="w-6 h-6 text-gray-500" />}
          </button>
          {showWhatsApp && (
            <button onClick={createEnhancedWhatsAppMessage} className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
              <WhatsAppIcon className="w-6 h-6 text-green-500" />
            </button>
          )}
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
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col ${className}`}
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
          />
        </a>
        <CategoryTag />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button onClick={handleFavorite} className="bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors">
            {isFavorite ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
          </button>
          <button onClick={handleShare} className="bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors">
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
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <a href={seoUrl} onClick={(e) => { e.preventDefault(); onPublicationClick?.(publication); }} className="block mb-2">
            <h3 className="font-bold text-lg leading-tight hover:text-blue-600 transition-colors duration-200 truncate">
              {formatTitle(publication.title)}
            </h3>
          </a>
          
          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatLocation(publication.location)}</span>
          </div>
        </div>

        {/* Price and Date */}
        <div className="flex justify-between items-end mt-2">
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatPriceLocal(publication.value, publication.currency)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {formatExactDateTime(publication.createdAt)}
          </div>
        </div>
      </div>

      {/* WhatsApp Button (optional) */}
      {showWhatsApp && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={createEnhancedWhatsAppMessage}
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2.5 rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span>Contactar</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}