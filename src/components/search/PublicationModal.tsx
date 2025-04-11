'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShareIcon,
  FlagIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Publication } from '@/components/search/SearchResults';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSeoUrl, slugify } from '@/utils/url';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
}

interface PublicationModalProps {
  publicationId: string;
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function PublicationModal({ 
  publicationId, 
  isOpen, 
  onClose,
  category 
}: PublicationModalProps) {
  const router = useRouter();
  const [publication, setPublication] = useState<PublicationWithContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Extraer solo la parte del ID si contiene un slug
  const cleanId = useMemo(() => 
    publicationId ? publicationId.split('-')[0] : '', 
    [publicationId]
  );

  // Obtener datos de la publicación con pre-carga rápida
  useEffect(() => {
    if (!isOpen || !publicationId) return;
    
    let isMounted = true;
    
    const fetchPublication = async () => {
      if (!cleanId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Asegurar que el body tiene la clase modal-open
        document.body.classList.add('modal-open');
        
        console.log(`Obteniendo publicación ${cleanId} de categoría ${category || 'desconocida'}`);
        
        // Implementar reintento automático
        let attempts = 0;
        const maxAttempts = 1; // Reducir a 1 para acelerar
        let success = false;
        let data = null;
        
        while (attempts <= maxAttempts && !success && isMounted) {
          try {
            attempts++;
            // Usar Promise.race para limitar el tiempo de espera
            data = await Promise.race([
              PublicationsService.getPublicationById(cleanId, category),
              new Promise<any>((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 3000)
              )
            ]);
            success = true;
          } catch (err) {
            console.warn(`Intento ${attempts}/${maxAttempts} fallido:`, err);
            if (attempts <= maxAttempts && isMounted) {
              await new Promise(resolve => setTimeout(resolve, 100)); // Reducir tiempo de espera
            }
          }
        }
        
        if (!success || !data) {
          throw new Error('No se pudo obtener la información después de varios intentos');
        }
        
        if (isMounted) {
          console.log('Datos obtenidos correctamente:', data);
          setPublication(data);
        }
      } catch (err) {
        console.error('Error al obtener publicación:', err);
        if (isMounted) {
          setError('No se pudo cargar la publicación. Intenta de nuevo.');
          setPublication(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublication();
    
    // Cleanup function
    return () => {
      isMounted = false;
      document.body.classList.remove('modal-open');
    };
  }, [publicationId, cleanId, isOpen, category]);

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

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Cerrar modal
  const handleClose = () => {
    document.body.classList.remove('modal-open');
    onClose();
  };

  // Ver publicación completa
  const handleViewFullPublication = () => {
    if (!publication) return;
    
    const url = generateSeoUrl(
      publication.id,
      publication.title,
      publication.categorySlug,
      publication.subcategory,
      publication.subsubcategory,
      true // Incluir el título en la URL para la página completa
    );
    
    router.push(url);
  };

  // Exportar modal como imagen
  const handleExportAsImage = async () => {
    if (!modalContentRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Añadir clase para mejorar renderizado durante la captura
      modalContentRef.current.classList.add('exporting');
      
      const canvas = await html2canvas(modalContentRef.current, {
        scale: 2, // Mayor resolución
        useCORS: true, // Permitir carga de imágenes de otros dominios
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Crear enlace para descargar
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `buscadis-${publication?.id || 'anuncio'}.png`;
      link.click();
      
      // Mostrar mensaje de éxito brevemente
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      
      // Eliminar clase de exportación
      modalContentRef.current.classList.remove('exporting');
    } catch (err) {
      console.error('Error al exportar como imagen:', err);
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

  // Manejar clic en el modal sin cerrarlo
  const handleModalClick = (e: React.MouseEvent) => {
    // Evitar que el clic se propague al overlay
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center">
          {/* Overlay - Solo el fondo oscuro es clickeable para cerrar */}
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          ></motion.div>
          
          {/* Modal container - Centrado vertical y horizontal */}
          <motion.div 
            className="relative w-full max-w-5xl mx-auto my-4 px-2 sm:px-4 max-h-[90vh] flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 350,
              mass: 0.5
            }}
          >
            {/* Modal content */}
            <div 
              ref={modalContentRef}
              className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-full flex flex-col pointer-events-auto w-full relative"
              onClick={handleModalClick}
            >
              {/* Imagen de marca de agua para exportación */}
              <div className="absolute bottom-3 right-3 opacity-70 z-10 exporting-only hidden">
                <Image 
                  src="/logo.png" 
                  alt="BuscaDis" 
                  width={80} 
                  height={20}
                />
              </div>
              
              {/* Botón de cerrar */}
              <button 
                onClick={handleClose}
                className="absolute top-3 right-3 z-20 bg-white/80 dark:bg-slate-700/80 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-800 dark:text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 border border-gray-200 dark:border-slate-600"
                aria-label="Cerrar"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {loading ? (
                // Skeleton loader durante la carga
                <div className="p-6 max-h-[90vh] overflow-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Skeleton para imagen */}
                    <div className="bg-gray-50 dark:bg-slate-900 relative rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LoadingSpinner size="lg" color="primary" className="opacity-20" />
                      </div>
                      <Skeleton 
                        height={400} 
                        width="100%" 
                        baseColor={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#1e293b' : '#f9fafb'}
                        highlightColor={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#334155' : '#f3f4f6'} 
                      />
                    </div>
                    
                    {/* Skeleton para contenido */}
                    <div className="space-y-5">
                      <Skeleton height={40} width="80%" />
                      <Skeleton height={28} width="40%" />
                      <div className="flex items-center gap-2">
                        <Skeleton height={24} width={100} />
                        <Skeleton height={24} width={120} />
                      </div>
                      <Skeleton count={3} height={16} />
                      
                      <div className="pt-5 space-y-3">
                        <Skeleton height={50} width="100%" />
                        <Skeleton height={50} width="100%" />
                        <div className="grid grid-cols-2 gap-3">
                          <Skeleton height={40} width="100%" />
                          <Skeleton height={40} width="100%" />
                        </div>
                        <Skeleton height={40} width="100%" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-lg mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error al cargar</h2>
                    <p className="text-gray-600 dark:text-slate-300 mb-4">{error}</p>
                  </div>
                  <button 
                    onClick={handleClose} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Volver
                  </button>
                </div>
              ) : publication ? (
                <div className="overflow-auto max-h-[90vh] publication-modal">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Columna izquierda - Imágenes */}
                    <div className="bg-gray-50 dark:bg-slate-900 relative">
                      {publication.premium && (
                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span>Premium</span>
                        </div>
                      )}
                      
                      {publication.images && publication.images.length > 0 ? (
                        <div className="relative h-64 sm:h-80 md:h-[500px]">
                          <Image
                            src={publication.images[0]}
                            alt={publication.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={true}
                            className="object-contain transition-all duration-500"
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 sm:h-80 md:h-[500px] bg-gray-100 dark:bg-slate-800">
                          <div className="p-8 text-center">
                            <PhotoIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-slate-500" />
                            <p className="text-gray-500 dark:text-slate-400 mt-2">Sin imágenes</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Columna derecha - Información */}
                    <div className="p-6 dark:bg-slate-800 dark:text-white">
                      <div className="mb-5">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">{publication.title}</h1>
                        
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                            {formatPrice(publication.price, publication.currency)}
                          </div>
                          
                          <div className="flex items-center text-gray-500 dark:text-slate-400 text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>{formatDate(publication.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600 dark:text-slate-300 text-sm mb-4 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg inline-block">
                          <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>
                            {typeof publication.location === 'string' 
                              ? publication.location 
                              : publication.location?.city || 'Ubicación no especificada'}
                          </span>
                        </div>
                        
                        <div className="mb-6 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Descripción</h2>
                          <div 
                            className={`text-gray-600 dark:text-slate-300 whitespace-pre-line ${isExpanded ? '' : 'line-clamp-4'}`}
                          >
                            {publication.description}
                          </div>
                          {publication.description && publication.description.length > 200 && (
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
                        
                        <div className="mt-6 space-y-3">
                          {/* Contacto */}
                          <motion.a 
                            href={`tel:${publication.contactPhone || publication.contact?.phone || ''}`}
                            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors shadow-md"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <PhoneIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">Llamar ahora</span>
                          </motion.a>
                          
                          {/* WhatsApp */}
                          <motion.a 
                            href={`https://wa.me/${(publication.contactPhone || publication.contact?.phone || '').replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors shadow-md"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <WhatsAppIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">WhatsApp</span>
                          </motion.a>
                          
                          {/* Botones adicionales */}
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleViewFullPublication}
                              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 px-4 rounded-lg transition-colors shadow-md"
                            >
                              <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                              <span className="font-medium">Ver completo</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleShare}
                              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 px-4 rounded-lg transition-colors shadow-md"
                            >
                              <ShareIcon className="w-5 h-5 mr-2" />
                              <span className="font-medium">Compartir</span>
                            </motion.button>
                          </div>
                          
                          {/* Botón de exportar como imagen */}
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleExportAsImage}
                            disabled={isExporting}
                            className={`flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-colors shadow-md ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                          <div className="flex justify-center space-x-4 mt-4">
                            <motion.button
                              onClick={shareOnFacebook}
                              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                              aria-label="Compartir en Facebook"
                              whileHover={{ scale: 1.1, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                              </svg>
                            </motion.button>
                            <motion.button
                              onClick={shareOnTwitter}
                              className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors shadow-md"
                              aria-label="Compartir en Twitter"
                              whileHover={{ scale: 1.1, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                              </svg>
                            </motion.button>
                            <motion.button
                              onClick={shareOnWhatsApp}
                              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                              aria-label="Compartir en WhatsApp"
                              whileHover={{ scale: 1.1, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.593.371 3.097 1.031 4.438l-1.002 3.666 3.736-.982A9.962 9.962 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.49 0-2.946-.38-4.222-1.089l-.3-.18-3.126.815.834-3.05-.2-.32A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" clipRule="evenodd" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer con marca de agua */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 py-2 px-4 text-center text-sm text-gray-500 dark:text-slate-400">
                    <div className="flex items-center justify-center">
                      <Image 
                        src="/logo.png" 
                        alt="BuscaDis" 
                        width={60} 
                        height={15} 
                        className="mr-2"
                      />
                      <span>ID: {publication.id} • {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Necesitamos añadir un poco de CSS para mejorar la experiencia de exportación
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
`;

// Insertar estilos en el documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = modalStyles;
  document.head.appendChild(style);
} 