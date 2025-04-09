'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ShareIcon,
  FlagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Publication {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  images: string[];
  location: {
    city: string;
    country?: string;
  };
  contact: {
    whatsapp?: string;
    email?: string;
    phone?: string;
  };
  created_at: string;
  views?: number;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subsubcategory?: string;
}

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract publication ID from the URL
  // The ID can be in formats like "123-title-with-hyphens" or just "123"
  const publicationId = params.id as string;
  const id = publicationId.split('-')[0]; // Extract just the ID portion
  
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPublications, setRelatedPublications] = useState<Publication[]>([]);

  // Fetch publication data
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Log fetching attempt
        console.log(`Fetching publication with ID: ${id}`);
        
        // Implement retry logic for better reliability
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;
        let data = null;
        
        while (attempts <= maxAttempts && !success) {
          try {
            attempts++;
            data = await PublicationsService.getPublicationById(id);
            success = true;
          } catch (err) {
            console.warn(`Attempt ${attempts}/${maxAttempts} failed:`, err);
            if (attempts <= maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (!success || !data) {
          throw new Error('No se pudo cargar la publicación después de varios intentos');
        }
        
        setPublication(data);
        
        // Also try to fetch related publications if we have a category
        if (data.category || data.categorySlug) {
          try {
            const relatedData = await PublicationsService.getRelatedPublications(
              id, 
              data.category || data.categorySlug
            );
            setRelatedPublications(relatedData || []);
          } catch (err) {
            console.error('Error fetching related publications:', err);
          }
        }
        
        // Track view in analytics
        if (data) {
          try {
            // Send view event to backend (implement later)
            console.log('Publication viewed:', id);
            
            // Also track localStorage for analysis
            try {
              const viewedItems = JSON.parse(localStorage.getItem('viewedItems') || '[]');
              if (!viewedItems.includes(id)) {
                viewedItems.push(id);
                localStorage.setItem('viewedItems', JSON.stringify(viewedItems));
              }
            } catch (e) {
              console.error('Error tracking local view:', e);
            }
            
            // Update URL with slug if URL doesn't already have one
            if (data.title && !window.location.pathname.includes('-') && window.history) {
              const slug = data.title
                .toLowerCase()
                .replace(/[^\w\sáéíóúñ]/g, '')
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
                
              const category = data.category || data.categorySlug || '';
              const newPath = `/${category}/${id}-${slug}`;
              window.history.replaceState(null, '', newPath);
            }
          } catch (err) {
            console.error('Error tracking view:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError('No se pudo cargar la publicación. Inténtalo de nuevo más tarde.');
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublication();
    }
  }, [id]);

  // Handle sharing
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication?.title || 'Publicación en Buscadis',
          text: publication?.description || 'Mira esta publicación en Buscadis',
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

  // Handle back button
  const handleBack = () => {
    if (publication?.categorySlug) {
      router.push(`/${publication.categorySlug}`);
    } else if (publication?.category) {
      router.push(`/${publication.category}`);
    } else {
      router.push('/');
    }
  };

  // Render dynamic metadata for SEO
  useEffect(() => {
    if (publication && typeof document !== 'undefined') {
      // Set page title for SEO
      document.title = `${publication.title} | Buscadis`;
      
      // Set meta description for SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          'content', 
          publication.description.substring(0, 160) + '...'
        );
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = publication.description.substring(0, 160) + '...';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      
      // Set Open Graph meta tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.getElementsByTagName('head')[0].appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', publication.title);
      
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.getElementsByTagName('head')[0].appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', publication.description.substring(0, 160) + '...');
      
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.getElementsByTagName('head')[0].appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', window.location.href);
      
      // Set image if available
      if (publication.images && publication.images.length > 0) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
          ogImage = document.createElement('meta');
          ogImage.setAttribute('property', 'og:image');
          document.getElementsByTagName('head')[0].appendChild(ogImage);
        }
        ogImage.setAttribute('content', publication.images[0]);
      }
    }
  }, [publication]);

  if (loading) {
    return (
      <div className="container py-16 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="container py-16 min-h-screen">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-600">{error || 'Publicación no encontrada'}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
            aria-label="Volver a inicio"
          >
            Volver a inicio
          </button>
        </div>
      </div>
    );
  }

  // Format WhatsApp message based on category
  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    let message = `Hola, estoy interesado en tu publicación "${publication.title}" de Buscadis.`;
    
    // Customize message based on category
    if (publication.category === 'empleo') {
      message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en Buscadis.`;
    } else if (publication.category === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en Buscadis.`;
    }
    
    return encodeURIComponent(message);
  };

  // Extract default values
  const title = publication.title || 'Sin título';
  const description = publication.description || 'Sin descripción';
  const price = publication.price || 0;
  const priceType = publication.price_type || 'fixed';
  const location = publication.location || {};
  const locationText = location.city ? `${location.city}, ${location.country || ''}` : 'Ubicación no especificada';
  const createdAt = publication.created_at ? new Date(publication.created_at).toLocaleDateString() : '';

  return (
    <div className="container py-8 md:py-12">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="mb-6 flex items-center text-primary-600 hover:text-primary-700"
        aria-label="Volver a la categoría"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver a {publication.category || 'inicio'}
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Images */}
          {publication.images && publication.images.length > 0 ? (
            <div className="mb-8 overflow-hidden rounded-xl">
              <Carousel images={publication.images} />
            </div>
          ) : (
            <div className="mb-8 bg-gray-200 h-96 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 text-lg">Sin imágenes</span>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{title}</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl md:text-2xl font-bold text-primary-600">
                {formatPrice(price, priceType)}
              </div>
              <div className="text-sm text-gray-500">
                Publicado {createdAt ? `el ${formatDate(createdAt)}` : ''}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h2>
              <div className="text-gray-600 whitespace-pre-line">{description}</div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Ubicación</h2>
              <div className="text-gray-600">
                {locationText}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                className="text-gray-500 hover:text-gray-700 flex items-center"
                onClick={handleShare}
                aria-label="Compartir publicación"
              >
                <ShareIcon className="w-5 h-5 mr-1" />
                Compartir
              </button>
              
              <button 
                className="text-gray-500 hover:text-red-600 flex items-center"
                aria-label="Reportar publicación"
              >
                <FlagIcon className="w-5 h-5 mr-1" />
                Reportar
              </button>
            </div>
          </div>
          
          {/* Related publications */}
          {relatedPublications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Publicaciones similares</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPublications.slice(0, 4).map((relatedPub) => (
                  <div key={relatedPub.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <a href={`/${relatedPub.category || 'categoria'}/${relatedPub.id}-${relatedPub.title?.toLowerCase().replace(/\s+/g, '-').substring(0, 80)}`}>
                      {relatedPub.images && relatedPub.images.length > 0 ? (
                        <div className="aspect-video relative bg-gray-100">
                          {/* Use next/image in a real implementation */}
                          <img 
                            src={relatedPub.images[0]} 
                            alt={relatedPub.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{relatedPub.title}</h3>
                        <p className="text-primary-600 font-bold mt-1">
                          {formatPrice(relatedPub.price, relatedPub.price_type)}
                        </p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Contact sidebar */}
        <div className="sticky top-24 h-fit">
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
                  href={`mailto:${publication.contact.email}?subject=Interesado en tu publicación: ${publication.title}`}
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
              <p>ID de publicación: {publication.id}</p>
              <p>Categoría: {publication.category || publication.categorySlug || 'General'}</p>
              {publication.subcategory && (
                <p>Subcategoría: {publication.subcategory}</p>
              )}
              {publication.subsubcategory && (
                <p>Tipo: {publication.subsubcategory}</p>
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
                <span className="font-medium">{formatDate(createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Safety tips */}
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-6 mt-4">
            <h3 className="font-semibold text-yellow-800 mb-3">Consejos de seguridad</h3>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• Revisa el producto antes de comprarlo</li>
              <li>• Reúnete en lugares públicos y seguros</li>
              <li>• No envíes dinero por adelantado</li>
              <li>• Desconfía de ofertas demasiado buenas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 