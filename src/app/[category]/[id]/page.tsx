'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ShareIcon,
  FlagIcon
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
  subcategory?: string;
  subsubcategory?: string;
}

export default function PublicationDetailPage() {
  const params = useParams();
  const category = params.category as string;
  
  // Extract publication ID from the URL
  // The ID can be in formats like "123-title-with-hyphens" or just "123"
  const idParam = params.id as string;
  const id = idParam.split('-')[0]; // Extract just the ID portion
  
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPublications, setRelatedPublications] = useState([]);

  // Fetch publication data
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        const data = await PublicationsService.getPublicationById(id, category);
        setPublication(data || null);
        
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
          } catch (err) {
            console.error('Error tracking view:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError('No se pudo cargar el anuncio. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    // Fetch related publications
    const fetchRelatedPublications = async () => {
      try {
        // Implement later - get publications from same category and similar attributes
        // const relatedData = await PublicationsService.getRelatedPublications(id, category);
        // setRelatedPublications(relatedData || []);
      } catch (err) {
        console.error('Error fetching related publications:', err);
      }
    };

    if (id) {
      fetchPublication();
      fetchRelatedPublications();
    }
  }, [id, category]);

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
          <p className="text-red-600">{error || 'Anuncio no encontrado'}</p>
        </div>
      </div>
    );
  }

  // Format WhatsApp message based on category
  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    let message = `Hola, estoy interesado en tu anuncio "${publication.title}" de Buscadis.`;
    
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
  const createdAt = new Date(publication.created_at).toLocaleDateString();

  return (
    <div className="container py-8 md:py-12">
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
                Publicado el {formatDate(createdAt)}
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
        <div className="sticky top-24 h-fit">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contactar al anunciante</h2>
            
            <div className="space-y-4 mb-6">
              {publication.contact?.whatsapp && (
                <a
                  href={`https://wa.me/${publication.contact.whatsapp}?text=${formatWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors w-full"
                >
                  <WhatsAppIcon className="w-5 h-5 mr-2" />
                  Contactar por WhatsApp
                </a>
              )}
              
              {publication.contact?.email && (
                <a
                  href={`mailto:${publication.contact.email}?subject=Interesado en: ${publication.title}`}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-700 py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors w-full"
                >
                  Contactar por email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Related listings */}
      {relatedPublications.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Anuncios similares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Implement related listings cards here */}
          </div>
        </div>
      )}
    </div>
  );
} 