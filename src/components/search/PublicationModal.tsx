'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ShareIcon,
  FlagIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
  CalendarIcon
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Overlay - Transparente para permitir interactividad pero capturar clics para cerrar */}
          <div 
            className="fixed inset-0 pointer-events-auto" 
            onClick={handleClose}
          ></div>
          
          {/* Modal - Añadir pointer-events-auto para asegurar interactividad */}
          <motion.div 
            className="relative w-full max-w-5xl mx-auto my-4 sm:my-8 px-2 sm:px-4 h-[calc(100vh-2rem)] sm:h-auto pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-xl max-h-full flex flex-col pointer-events-auto">
              {/* Botón de cerrar */}
              <button 
                onClick={handleClose}
                className="absolute top-3 right-3 z-[9999] bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-full shadow-md"
                aria-label="Cerrar"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              {loading ? (
                <div className="flex items-center justify-center p-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={handleClose} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cerrar
                  </button>
                </div>
              ) : publication ? (
                <div className="overflow-auto h-full publication-modal">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Columna izquierda - Imágenes */}
                    <div className="bg-gray-50">
                      {publication.images && publication.images.length > 0 ? (
                        <div className="relative h-64 sm:h-80 md:h-96">
                          <Image
                            src={publication.images[0]}
                            alt={publication.title}
                            layout="fill"
                            objectFit="contain"
                            priority={true}
                            className="p-2"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 sm:h-80 md:h-96 bg-gray-100">
                          <div className="p-8 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 mt-2">Sin imágenes</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Columna derecha - Información */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{publication.title}</h1>
                        
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                          <div className="text-xl font-bold text-blue-600">
                            {formatPrice(publication.price, publication.currency)}
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>{formatDate(publication.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>
                            {typeof publication.location === 'string' 
                              ? publication.location 
                              : publication.location?.city || 'Ubicación no especificada'}
                          </span>
                        </div>
                        
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h2>
                          <div 
                            className={`text-gray-600 whitespace-pre-line ${isExpanded ? '' : 'line-clamp-4'}`}
                          >
                            {publication.description}
                          </div>
                          {publication.description && publication.description.length > 200 && (
                            <button 
                              className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                              onClick={toggleExpanded}
                            >
                              {isExpanded ? 'Ver menos' : 'Ver más'}
                            </button>
                          )}
                        </div>
                        
                        <div className="mt-6 space-y-3">
                          {/* Contacto */}
                          <a 
                            href={`tel:${publication.contactPhone || publication.contact?.phone || ''}`}
                            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>Contactar</span>
                          </a>
                          
                          {/* WhatsApp */}
                          <a 
                            href={`https://wa.me/${(publication.contactPhone || publication.contact?.phone || '').replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            <WhatsAppIcon className="w-5 h-5 mr-2" />
                            <span>WhatsApp</span>
                          </a>
                          
                          {/* Botones adicionales */}
                          <div className="flex gap-2">
                            <button
                              onClick={handleViewFullPublication}
                              className="flex items-center justify-center flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                            >
                              <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                              <span>Ver completo</span>
                            </button>
                            
                            <button
                              onClick={handleShare}
                              className="flex items-center justify-center flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                            >
                              <ShareIcon className="w-5 h-5 mr-2" />
                              <span>Compartir</span>
                            </button>
                          </div>
                        </div>
                      </div>
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