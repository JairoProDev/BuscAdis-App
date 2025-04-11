'use client';

import { useState, useEffect } from 'react';
import { 
  ShareIcon,
  FlagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Publication } from '@/components/search/SearchResults';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract just the ID portion if it contains a slug
  const cleanId = publicationId ? publicationId.split('-')[0] : '';

  // Fetch publication data
  useEffect(() => {
    const fetchPublication = async () => {
      if (!publicationId || !isOpen) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Asegurar que el body tiene la clase modal-open
        document.body.classList.add('modal-open');
        
        // Intentar obtener los datos de publicación, pasando la categoría correctamente
        console.log(`Fetching publication ${cleanId} from category ${category || 'unknown'}`);
        
        // Añadir reintento automático
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;
        let data = null;
        
        while (attempts <= maxAttempts && !success) {
          try {
            attempts++;
            data = await PublicationsService.getPublicationById(cleanId, category);
            success = true;
          } catch (err) {
            console.warn(`Attempt ${attempts}/${maxAttempts} failed:`, err);
            // Esperar un poco antes de reintentar
            if (attempts <= maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (!success || !data) {
          throw new Error('No se pudo obtener la información del anuncio después de varios intentos');
        }
        
        console.log('Publication data fetched successfully:', data);
        setPublication(data || null);
        
        // Track view in analytics
        if (data) {
          try {
            // Send view event to backend
            console.log('Publication viewed:', cleanId);
            // We'll implement the real tracking in another step
            
            // También actualizar la URL para reflejar el slug si está disponible
            if (data.title && !window.location.pathname.includes('-') && window.history) {
              const slug = data.title
                .toLowerCase()
                .replace(/[^\w\sáéíóúüñ]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[áàäâ]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöô]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/-+/g, '-')
                .trim()
                .substring(0, 80);
                
              const newPath = window.location.pathname.replace(cleanId, `${cleanId}-${slug}`);
              window.history.replaceState(null, '', newPath);
            }
          } catch (err) {
            console.error('Error tracking view:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError('No se pudo cargar el anuncio. Por favor, intenta nuevamente más tarde.');
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
    
    // Cleanup function
    return () => {
      // Restaurar overflow del body cuando el componente se desmonta
      document.body.classList.remove('modal-open');
    };
  }, [publicationId, cleanId, isOpen, category]);

  // Handle ESC key to close modal
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

  // Prevent body scroll when modal is open
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

  // Handle modal close
  const handleClose = () => {
    document.body.classList.remove('modal-open');
    onClose();
  };

  // Handle sharing
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication?.title || 'Anuncio en Buscadis',
          text: publication?.description || 'Mira este anuncio en Buscadis',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  // Format WhatsApp message based on category
  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    let message = `Hola, estoy interesado en tu anuncio "${publication.title}" de Buscadis.`;
    
    // Customize message based on category
    if (publication.categorySlug === 'empleo' || publication.category === 'empleos') {
      message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en Buscadis.`;
    } else if (publication.categorySlug === 'inmuebles' || publication.category === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en Buscadis.`;
    }
    
    return encodeURIComponent(message);
  };

  // Toggle expanded state (more text)
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if in standalone mode (direct URL access)
  const isStandalone = !isOpen;

  // If it's in standalone mode (being accessed directly via URL), render a page instead of a modal
  if (isStandalone) {
    return (
      <div className="container py-8">
        {/* You can place the same content here, but styled for a full page */}
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error || !publication ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-slate-300">{error || 'Anuncio no encontrado'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Images */}
              {publication.images && publication.images.length > 0 ? (
                <div className="mb-6 overflow-hidden rounded-xl">
                  <Carousel images={publication.images} />
                </div>
              ) : (
                <div className="mb-6 bg-gray-100 h-64 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Sin imágenes</span>
                </div>
              )}

              {/* Details */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{publication.title}</h1>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xl font-bold text-primary-600">
                    {formatPrice(publication.price, publication.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Publicado el {formatDate(publication.createdAt)}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h2>
                  <div className="text-gray-600 whitespace-pre-line">
                    {publication.description}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Ubicación</h2>
                  <div className="text-gray-600">
                    {publication && formatLocation(publication.location)}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    className="text-gray-500 hover:text-gray-700 flex items-center"
                    onClick={handleShare}
                  >
                    <ShareIcon className="w-5 h-5 mr-1" />
                    Compartir
                  </button>
                  
                  <button className="text-gray-500 hover:text-red-600 flex items-center">
                    <FlagIcon className="w-5 h-5 mr-1" />
                    Reportar
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contact sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Contactar al anunciante</h2>
                
                <div className="space-y-4 mb-6">
                  {publication.contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${publication.contact.whatsapp}?text=${formatWhatsAppMessage()}`}
                      className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon className="w-5 h-5 mr-2" />
                      Contactar por WhatsApp
                    </a>
                  )}
                  
                  {publication.contact?.email && (
                    <a
                      href={`mailto:${publication.contact.email}?subject=Interesado en tu anuncio: ${publication.title}`}
                      className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      Contactar por Email
                    </a>
                  )}
                  
                  {publication.contact?.phone && (
                    <a
                      href={`tel:${publication.contact.phone}`}
                      className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      Llamar
                    </a>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>ID de anuncio: {publication.id}</p>
                  <p>Categoría: {publication.category || publication.categorySlug || 'General'}</p>
                  {publication.subcategory && (
                    <p>Subcategoría: {publication.subcategory}</p>
                  )}
                </div>
              </div>

              {/* Stats card */}
              <div className="bg-white rounded-xl shadow-md p-6 mt-4">
                <h3 className="font-semibold text-gray-800 mb-4">Estadísticas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vistas</span>
                    <span className="font-medium">{publication.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contactos</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publicado</span>
                    <span className="font-medium">{formatDate(publication.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="fixed inset-0 bg-black/80" onClick={handleClose}></div>
          
          <motion.div 
            className="relative w-full max-w-4xl mx-auto my-8 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-xl">
              {/* Close button */}
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 z-[9999] bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full"
                aria-label="Cerrar"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              {loading ? (
                <div className="flex items-center justify-center p-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
                  <p className="text-slate-600">{error}</p>
                </div>
              ) : publication ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
                  <div className="lg:col-span-2 overflow-hidden">
                    {/* Images */}
                    {publication.images && publication.images.length > 0 ? (
                      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                        <Carousel images={publication.images} />
                      </div>
                    ) : (
                      <div className="bg-gray-100 h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">Sin imágenes</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-1 p-6">
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-gray-900 mb-3">{publication.title}</h1>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-bold text-primary-600">
                          {formatPrice(publication.price, publication.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Publicado el {formatDate(publication.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h2>
                        <div 
                          className={`text-gray-600 whitespace-pre-line ${isExpanded ? '' : 'line-clamp-4'}`}
                          onClick={toggleExpanded}
                        >
                          {publication.description}
                        </div>
                        {publication.description && publication.description.length > 200 && (
                          <button 
                            className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                            onClick={toggleExpanded}
                          >
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Ubicación</h2>
                        <div className="text-gray-600">
                          {publication && formatLocation(publication.location)}
                        </div>
                      </div>
                      
                      <div className="mt-8 space-y-3">
                        {/* WhatsApp contact button */}
                        {publication.contactPhone && (
                          <a 
                            href={`https://wa.me/${publication.contactPhone.replace(/\D/g, '')}?text=${formatWhatsAppMessage()}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center w-full transition-colors"
                          >
                            <WhatsAppIcon className="w-5 h-5 mr-2" />
                            Contactar por WhatsApp
                          </a>
                        )}
                        
                        {/* Share and report buttons */}
                        <div className="flex space-x-3">
                          <button 
                            onClick={handleShare}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center flex-1 transition-colors"
                          >
                            <ShareIcon className="w-5 h-5 mr-2" />
                            Compartir
                          </button>
                          
                          <button className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center flex-1 transition-colors">
                            <FlagIcon className="w-5 h-5 mr-2" />
                            Reportar
                          </button>
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

// Método para formatear la ubicación correctamente
const formatLocation = (location: any): string => {
  if (typeof location === 'string') {
    return location;
  }
  
  if (location && typeof location === 'object') {
    if (location.city && location.region) {
      return `${location.city}, ${location.region}`;
    } else if (location.city) {
      return location.city;
    } else if (location.region) {
      return location.region;
    }
  }
  
  return 'Ubicación no especificada';
} 