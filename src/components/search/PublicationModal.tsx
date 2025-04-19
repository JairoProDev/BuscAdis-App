'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ShareIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Publication } from '@/components/search/SearchResults';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSeoUrl } from '@/utils/url';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-hot-toast';
import { toPng } from 'html-to-image';
import { getDefaultImageByCategory } from '@/utils/image-helpers';

// Declarar tipo global para la caché de publicaciones
declare global {
  interface Window {
    preloadedPublications?: Record<string, PublicationWithContact>;
  }
}

// Extender la interfaz Publication para incluir las propiedades de contacto
interface PublicationWithContact extends Publication {
  contactPhone?: string;
  contact?: {
    phone?: string;
    email?: string;
    name?: string;
  };
  subcategory?: string;
  subsubcategory?: string;
  // Database field names
  subcategorySlug?: string;
  subSubcategorySlug?: string;
}

interface PublicationModalProps {
  publicationId: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: PublicationWithContact;
}

export default function PublicationModal({ publicationId, isOpen, onClose, initialData }: PublicationModalProps) {
  const router = useRouter();
  const [publication, setPublication] = useState<PublicationWithContact | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [userScrollPosition, setUserScrollPosition] = useState(0);

  // Extraer solo la parte del ID si contiene un slug
  const cleanId = useMemo(() => 
    publicationId ? publicationId.split('-')[0] : '', 
    [publicationId]
  );

  // Fetch publication data - memoized to prevent recreation
  const fetchPublicationData = useCallback(async () => {
    if (!publicationId) return;
      
    try {
      setLoading(true);
      setError('');
        
      // Parse URL to get category information from URL path segments
      const url = window.location.href;
      const urlParts = url.split('/').filter(part => part);
      
      // Define valid categories
      const validCategories = [
        'inmuebles', 'vehiculos', 'empleos', 'servicios', 
        'productos', 'negocios', 'comunidad', 'eventos'
      ];
      
      // Extract category, subcategory, and subsubcategory from URL path
      let category, subcategory, subsubcategory;
      
      // Find where the category starts in the URL path
      const categoryIndex = urlParts.findIndex(part => validCategories.includes(part));
      
      if (categoryIndex !== -1) {
        // Get category
        category = urlParts[categoryIndex];
        
        // Check if there's a subcategory after the category
        if (categoryIndex + 1 < urlParts.length) {
          subcategory = urlParts[categoryIndex + 1];
          
          // Check if there's a subsubcategory after the subcategory
          if (categoryIndex + 2 < urlParts.length) {
            // The last part might be the title-slug, so we need to check if there's another part after it
            if (categoryIndex + 3 < urlParts.length) {
              subsubcategory = urlParts[categoryIndex + 2];
            }
          }
        }
      }
      
      console.log("Fetching publication with params extracted from URL path:", { 
        id: cleanId, 
        category, 
        subcategory, 
        subsubcategory 
      });
      
      // Pass the category information to the service
      const data = await PublicationsService.getPublicationById(
        cleanId, 
        category, 
        subcategory, 
        subsubcategory
      );
      
      console.log("Received publication data:", data);
      
      // Normalize fields from DB to match frontend naming
      const enhancedData = {
        ...data,
        // Support both naming conventions for compatibility
        subcategory: data.subcategory || data.subcategorySlug || subcategory,
        subsubcategory: data.subsubcategory || data.subSubcategorySlug || subsubcategory,
        categorySlug: data.categorySlug || category
      };
      
      setPublication(enhancedData);
      
      // Cache the publication data for future use
      if (typeof window !== 'undefined') {
        window.preloadedPublications = window.preloadedPublications || {};
        window.preloadedPublications[cleanId] = enhancedData;
        }
      } catch (err) {
      console.error('Error fetching publication:', err);
      setError('Error al cargar la publicación');
      } finally {
          setLoading(false);
        }
  }, [publicationId, cleanId]);

  // When the modal is opened, store the current scroll position
  useEffect(() => {
    if (isOpen) {
      setUserScrollPosition(window.scrollY);
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Compensate for scrollbar disappearing
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Restore scroll position when modal closes
      if (userScrollPosition) {
        window.scrollTo(0, userScrollPosition);
      }
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, userScrollPosition]);

  // Obtener datos de la publicación con pre-carga rápida
  useEffect(() => {
    // Skip fetching if we already have initialData
    if (initialData && publicationId === initialData.id) {
      setPublication(initialData);
      setLoading(false);
      return;
    }
    
    // If we have preloaded data, use it immediately
    if (typeof window !== 'undefined' && 
        window.preloadedPublications && 
        window.preloadedPublications[cleanId]) {
      setPublication(window.preloadedPublications[cleanId]);
      setLoading(false);
      return;
    }
    
    // If no initialData or different publication, fetch data
    if (isOpen && publicationId) {
      fetchPublicationData();
    }
  }, [isOpen, publicationId, cleanId, initialData, fetchPublicationData]);

  // Manejar tecla ESC para cerrar modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Cerrar modal
  const handleCloseModal = () => {
    // No manipular classList aquí para evitar doble manejo con el useEffect
    onClose();
  };

  // Ver publicación completa
  const handleViewFullPublication = () => {
    if (!publication) {
      console.error("No hay datos de publicación disponibles para navegar");
      toast.error("No se pudo abrir la página de detalles");
      return;
    }
    
    // Asegurar que tenemos valores válidos para todas las categorías
    const categorySlug = publication.categorySlug || 'publicaciones';
    
    // Verificar que no estamos pasando "undefined" o "null" como strings a la función de generación de URL
    const subcategorySlug = publication.subcategory && publication.subcategory !== "undefined" && publication.subcategory !== "null" 
      ? publication.subcategory 
      : '';
      
    const subsubcategorySlug = publication.subsubcategory && publication.subsubcategory !== "undefined" && publication.subsubcategory !== "null" 
      ? publication.subsubcategory 
      : '';
    
    // Validar ID
    if (!publication.id) {
      console.error("ID de publicación no válido");
      toast.error("No se pudo abrir la página de detalles");
      return;
    }
    
    // Log para diagnosticar problemas
    console.log("Generando URL con parámetros:", {
      id: publication.id,
      title: publication.title,
      categorySlug,
      subcategorySlug,
      subsubcategorySlug
    });
    
    // Generar URL con todos los parámetros necesarios, sin incluir query params
    const url = generateSeoUrl(
      publication.id,
      publication.title,
      undefined, // No usar slug específico
      categorySlug,
      subcategorySlug,
      subsubcategorySlug,
      true // Incluir título en el slug
    );
    
    // Cerrar el modal primero
    onClose();
    
    // Navegar a la página completa
    router.push(url);
  };

  // Exportar modal como imagen
  const handleExportAsImage = async () => {
    if (!exportRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Añadir clase para mejorar renderizado durante la captura
      exportRef.current.classList.add('exporting');
      
      // Use html-to-image instead of html2canvas
      const dataUrl = await toPng(exportRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        canvasWidth: exportRef.current.clientWidth * 2,
        canvasHeight: exportRef.current.clientHeight * 2,
        pixelRatio: 2, // For higher resolution
      });
      
      // Crear enlace para descargar
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `buscadis-${publication?.id || 'anuncio'}.png`;
      link.click();
      
      // Mostrar mensaje de éxito brevemente
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      
      // Eliminar clase de exportación
      exportRef.current.classList.remove('exporting');
    } catch (err) {
      console.error('Error al exportar como imagen:', err);
      toast.error('Hubo un problema al generar la imagen');
    } finally {
      setIsExporting(false);
    }
  };

  // Compartir
  const handleShare = async () => {
    if (!publication) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.description,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  // Formatear mensaje de WhatsApp según la categoría
  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    
    let message = `Hola, estoy interesado en tu publicación "${publication.title}" de BuscaDis.`;
    
    // Personalizar mensaje según categoría
    if (publication.categorySlug === 'empleos') {
      message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en BuscaDis.`;
    } else if (publication.categorySlug === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en BuscaDis.`;
    } else if (publication.categorySlug === 'vehiculos') {
      message = `Hola, estoy interesado en el vehículo "${publication.title}" que tienes en BuscaDis.`;
    }
    
    return encodeURIComponent(message);
  };

  // Alternar estado expandido (más texto)
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Compartir en redes sociales específicas
  const shareOnFacebook = () => {
    if (!publication) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    if (!publication) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Mira este anuncio en BuscaDis: ${publication.title}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    if (!publication) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`¡Mira este anuncio en BuscaDis: ${publication.title} ${window.location.href}`)}`, '_blank');
  };

  // Renderizar contenido de la publicación
  const renderPublicationContent = (pub: PublicationWithContact | null) => {
    if (!pub) {
      return (
        <div className="p-8 text-center text-red-500">
          <p>No se encontraron datos de la publicación.</p>
        </div>
      );
    }

    // Handle fallback publication cases
    const isFallback = '_fallback' in pub;
    
    // Log useful debugging information
    console.log('Rendering publication content:', {
      id: pub.id,
      title: pub.title,
      isFallback: isFallback
    });
    
    // Ensure we have valid data
    const publicationId = pub.id || 'unknown';
    const publicationTitle = pub.title || 'Título no disponible';
    const publicationDesc = pub.description || 'Sin descripción';
    const publicationPrice = pub.price || 0;
    const publicationCurrency = pub.currency || 'PEN';
    const publicationCategory = pub.categorySlug || '';
    
    // Check if publication has images
    const hasImages = pub.images && pub.images.length > 0;
    
    // Obtener imagen predeterminada según la categoría
    const defaultImage = getDefaultImageByCategory(publicationCategory);
    
    // Use a safe image URL
    const imageUrl = hasImages && pub.images && pub.images[0] 
      ? pub.images[0] 
      : defaultImage;

    return (
      <div ref={exportRef} className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Columna izquierda - Imágenes (mostrar solo si hay imágenes) */}
        {hasImages ? (
          <div className="bg-gray-50 dark:bg-slate-900 relative group flex flex-col justify-between">
            {/* Badge premium */}
            {pub.premium && (
              <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Premium</span>
              </div>
            )}
            
            {/* Indicador de carga para la imagen */}
            {loading && (
              <div className="absolute top-2 right-2 z-10">
                <LoadingSpinner size="sm" color="primary" />
              </div>
            )}
            
            <div className="flex-grow flex items-center justify-center">
              <div className="relative h-64 sm:h-80 md:h-[400px] w-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={publicationTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={true}
                  className="object-contain transition-all duration-500 hover:scale-105 transform-gpu"
                  style={{ objectFit: 'contain' }}
                />
                
                {/* Botones de navegación para más imágenes */}
                {pub.images && pub.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {pub.images.slice(0, 5).map((_, idx) => (
                      <button 
                        key={idx} 
                        className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        aria-label={`Ir a imagen ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* BuscaDis branding in the left column bottom */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-800/50 py-4 px-4 text-center border-t border-gray-100 dark:border-slate-700/50">
              <div className="flex items-center justify-center">
                <Image
                  src="/logo.png" 
                  alt="BuscaDis" 
                  width={80} 
                  height={20} 
                  className="mr-2"
                />
                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                  Tu marketplace de confianza
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Placeholder when no images are available
          <div className="bg-gray-50 dark:bg-slate-800 flex flex-col items-center justify-center p-6 border-r border-gray-100 dark:border-slate-700/50 h-auto">
            <div className="p-8 text-center">
              <PhotoIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
              <p className="text-gray-500 dark:text-slate-400 mb-2">Sin imágenes disponibles</p>
              <p className="text-sm text-gray-400 dark:text-slate-500">Este anuncio no contiene imágenes</p>
            </div>
            
            {/* BuscaDis branding when no images */}
            <div className="mt-auto bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-800/50 py-4 px-4 text-center border-t border-gray-100 dark:border-slate-700/50 w-full">
              <div className="flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="BuscaDis" 
                  width={80} 
                  height={20} 
                  className="mr-2"
                />
                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                  Tu marketplace de confianza
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Columna derecha - Información */}
        <div className={`p-6 dark:bg-slate-800 dark:text-white overflow-y-auto max-h-[80vh] md:max-h-[600px] flex flex-col ${!hasImages ? 'md:col-span-2' : ''}`}>
          <div className="flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">{publicationTitle}</h1>
            
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                {formatPrice(publicationPrice, publicationCurrency)}
              </div>
              
              <div className="flex items-center text-gray-500 dark:text-slate-400 text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>{formatDate(pub.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-slate-300 text-sm mb-4 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg inline-block">
              <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>
                {typeof pub.location === 'string' 
                  ? pub.location 
                  : pub.location?.city || 'Ubicación no especificada'}
              </span>
            </div>
            
            <div className="mb-6 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                Descripción
                {loading && <LoadingSpinner size="sm" className="ml-2 opacity-70" />}
              </h2>
              <div 
                className={`text-gray-600 dark:text-slate-300 whitespace-pre-line ${isExpanded ? '' : 'line-clamp-4'}`}
              >
                {publicationDesc}
              </div>
              {publicationDesc && publicationDesc.length > 200 && (
                <button 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-2 font-medium flex items-center"
                  onClick={toggleExpanded}
                >
                  {isExpanded ? 'Ver menos' : 'Ver más'}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-auto space-y-3">
            {/* Contacto */}
            <motion.a 
              href={`tel:${pub.contactPhone || pub.contact?.phone || ''}`}
              className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg transition-all shadow-md"
              whileHover={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Llamar ahora</span>
            </motion.a>
            
            {/* WhatsApp with explicit SVG icon */}
            <motion.a 
              href={`https://wa.me/${(pub.contactPhone || pub.contact?.phone || '').replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg transition-all shadow-md"
              whileHover={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.593.371 3.097 1.031 4.438l-1.002 3.666 3.736-.982A9.962 9.962 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.49 0-2.946-.38-4.222-1.089l-.3-.18-3.126.815.834-3.05-.2-.32A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">WhatsApp</span>
            </motion.a>
            
            {/* Botones adicionales */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFullPublication();
                }}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 px-4 rounded-lg transition-all shadow-md"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Ver completo</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 px-4 rounded-lg transition-all shadow-md"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Compartir</span>
              </motion.button>
            </div>

            {/* Botón de exportar como imagen */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                handleExportAsImage();
              }}
              disabled={isExporting}
              className={`flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-4 rounded-lg transition-all shadow-md ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isExporting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span>Generando imagen...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  <span>¡Imagen descargada!</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  <span>Descargar como imagen</span>
                </>
              )}
            </motion.button>
            
            {/* Compartir en redes sociales */}
            <div className="flex justify-center space-x-4 mt-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  shareOnFacebook();
                }}
                className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md"
                aria-label="Compartir en Facebook"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  background: "linear-gradient(to right, #1e40af, #1e3a8a)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  shareOnTwitter();
                }}
                className="p-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-full shadow-md"
                aria-label="Compartir en Twitter"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  background: "linear-gradient(to right, #0284c7, #0369a1)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  shareOnWhatsApp();
                }}
                className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-md"
                aria-label="Compartir en WhatsApp"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  background: "linear-gradient(to right, #16a34a, #15803d)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.593.371 3.097 1.031 4.438l-1.002 3.666 3.736-.982A9.962 9.962 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.49 0-2.946-.38-4.222-1.089l-.3-.18-3.126.815.834-3.05-.2-.32A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
            
            {/* Publication ID information */}
            <div className="text-center text-xs text-gray-500 dark:text-slate-400 mt-2">
              <span className="flex items-center justify-center">
                <span className="mr-1">ID: {publicationId}</span>
                <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs text-blue-700 dark:text-blue-400">
                  {new Date().toLocaleDateString()}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          onClick={(e) => {
            // Only close if the click was directly on this container
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          {/* Backdrop with lighter opacity - no longer has a click handler */}
          <div 
            className="fixed inset-0 bg-black/50" 
            aria-hidden="true"
          />
          
          {/* Modal container with improved animation and styles */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="publication-modal bg-white dark:bg-slate-900 rounded-2xl overflow-hidden relative z-60 w-full max-w-4xl mx-4 shadow-xl max-h-[90vh]"
            id="publication-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'auto' }}
          >
            {/* Close button with improved positioning and appearance */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseModal();
              }}
              className="absolute top-4 right-4 z-70 bg-white/90 dark:bg-slate-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
            
            {/* Content */}
            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>Error al cargar la publicación: {error}</p>
                <button 
                  onClick={() => fetchPublicationData()}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Intentar nuevamente
                </button>
              </div>
            ) : (
              renderPublicationContent(publication)
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Función para el componente de esqueleto de carga mejorado
const SkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
    <div className="w-full bg-gray-200 h-64 md:h-[320px] flex items-center justify-center">
      <CameraIcon className="h-20 w-20 text-gray-300" />
    </div>
    <div className="w-full p-6 space-y-4">
      <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
      </div>
    </div>
  </div>
);

// Necesitamos añadir un poco de CSS para mejorar la experiencia
const modalStyles = `
  /* Estilos para mostrar durante la exportación */
  .exporting-only {
    display: none;
  }
  
  .exporting .exporting-only {
    display: block;
  }
  
  /* Asegurar que no se muestre el scrollbar durante la exportación */
  .exporting {
    overflow: hidden !important;
    max-height: none !important;
  }

  /* Prevenir scroll cuando el modal está abierto */
  body.modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
  }

  /* Mejorar la apariencia de las imágenes en el modal */
  .publication-modal img {
    transition: transform 0.3s ease;
  }

  /* Añadir efecto de iluminación al hacer hover en las imágenes */
  .publication-modal .group:hover::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
    z-index: 5;
  }

  /* Mejorar la sombra del modal */
  .publication-modal {
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
    overflow: auto;
    pointer-events: auto !important;
  }

  /* Animación para el skeleton */
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  /* Fix para asegurar que los botones y enlaces del modal sean clickeables */
  .publication-modal a,
  .publication-modal button,
  .publication-modal .modal-content {
    pointer-events: auto !important;
    cursor: pointer !important;
    z-index: 10 !important;
  }

  /* Asegurarnos que el modal no se cierre al hacer click en él */
  .publication-modal {
    cursor: default !important;
  }
  
  /* Grid layout for desktop and mobile */
  @media (min-width: 768px) {
    .publication-modal .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-height: 85vh;
    }
    
    .publication-modal .overflow-y-auto {
      max-height: 85vh;
    }
  }
  
  @media (max-width: 767px) {
    .publication-modal .grid {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
  }
`;

// Insertar estilos en el documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = modalStyles;
  document.head.appendChild(style);
} 