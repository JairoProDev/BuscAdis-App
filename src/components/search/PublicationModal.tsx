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

  // Fetch publication data
  useEffect(() => {
    const fetchPublication = async () => {
      if (!publicationId || !isOpen) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Intentar obtener los datos de publicación, pasando la categoría correctamente
        console.log(`Fetching publication ${publicationId} from category ${category || 'unknown'}`);
        
        // Añadir reintento automático
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;
        let data = null;
        
        while (attempts <= maxAttempts && !success) {
          try {
            attempts++;
            data = await PublicationsService.getPublicationById(publicationId, category);
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
            // Send view event to backend (implement later)
            console.log('Publication viewed:', publicationId);
            // We'll implement the real tracking in another step
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
  }, [publicationId, isOpen, category]);

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

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
    if (publication.categorySlug === 'empleo') {
      message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en Buscadis.`;
    } else if (publication.categorySlug === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en Buscadis.`;
    }
    
    return encodeURIComponent(message);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70" onClick={onClose}></div>
          
          <motion.div 
            className="relative min-h-screen flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="relative bg-slate-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 bg-slate-800/70 hover:bg-slate-700 text-white p-2 rounded-full"
                aria-label="Cerrar"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  <div className="lg:col-span-2">
                    {/* Images */}
                    {publication.images && publication.images.length > 0 ? (
                      <div className="mb-6 overflow-hidden rounded-xl">
                        <Carousel images={publication.images} />
                      </div>
                    ) : (
                      <div className="mb-6 bg-slate-800 h-64 rounded-xl flex items-center justify-center">
                        <span className="text-slate-500 text-lg">Sin imágenes</span>
                      </div>
                    )}

                    {/* Details */}
                    <div className="bg-slate-800 rounded-xl p-6 mb-6">
                      <h1 className="text-2xl font-bold text-white mb-3">{publication.title}</h1>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-bold text-teal-400">
                          {formatPrice(publication.price, publication.currency)}
                        </div>
                        <div className="text-sm text-slate-400">
                          Publicado el {formatDate(publication.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-200 mb-2">Descripción</h2>
                        <div className="text-slate-300 whitespace-pre-line line-clamp-6 hover:line-clamp-none transition-all duration-300">
                          {publication.description}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-200 mb-2">Ubicación</h2>
                        <div className="text-slate-300">
                          {publication.location}
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button 
                          className="text-slate-300 hover:text-white flex items-center"
                          onClick={handleShare}
                        >
                          <ShareIcon className="w-5 h-5 mr-1" />
                          Compartir
                        </button>
                        
                        <button className="text-slate-300 hover:text-red-400 flex items-center">
                          <FlagIcon className="w-5 h-5 mr-1" />
                          Reportar
                        </button>
                      </div>
                    </div>

                    {/* View full details link */}
                    <div className="text-center">
                      <a 
                        href={`/anuncios/${publicationId}`}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver página completa del anuncio
                      </a>
                    </div>
                  </div>
                  
                  {/* Contact sidebar */}
                  <div>
                    <div className="bg-slate-800 rounded-xl p-6 sticky top-6">
                      <h2 className="text-xl font-bold text-white mb-4">Contactar al anunciante</h2>
                      
                      <div className="space-y-4">
                        {publication.contactName && (
                          <div className="text-slate-300 mb-4">
                            {publication.contactName}
                          </div>
                        )}
                        
                        {/* WhatsApp contact button - most important action */}
                        <a
                          href={`https://wa.me/${publication.contact?.whatsapp}?text=${formatWhatsAppMessage()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors w-full"
                        >
                          <WhatsAppIcon className="w-5 h-5 mr-2" />
                          Contactar por WhatsApp
                        </a>
                        
                        {/* Email contact button */}
                        <a
                          href={`mailto:${publication.contact?.email}?subject=Interesado en: ${publication.title}`}
                          className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors w-full"
                        >
                          Contactar por email
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 