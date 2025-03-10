'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPinIcon, 
  PhoneIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { ListingsService } from '@/services/listings.service';
import LoadingState from '@/components/ui/LoadingState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';

interface Listing {
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
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cargar datos del anuncio
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await ListingsService.getListing(id);
        setListing(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('No se pudo cargar el anuncio');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Manejar mensajes de WhatsApp
  const handleWhatsAppClick = () => {
    if (!listing?.contact?.whatsapp) return;
    
    const message = encodeURIComponent(`Hola, Me interesa su anuncio "${listing.title}" en BuscAdis.`);
    const number = listing.contact.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  // Manejar compartir
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title || 'Anuncio en BuscAdis',
          text: listing?.description || 'Mira este anuncio en BuscAdis',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error compartiendo:', err);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleContactClick = (type: 'whatsapp' | 'email' | 'phone') => {
    if (!listing?.contact) return;

    if (type === 'whatsapp' && listing.contact.whatsapp) {
      const message = encodeURIComponent(`Hola, me interesa tu anuncio "${listing.title}" en BuscAdis`);
      window.open(`https://wa.me/${listing.contact.whatsapp}?text=${message}`, '_blank');
    } else if (type === 'email' && listing.contact.email) {
      window.location.href = `mailto:${listing.contact.email}?subject=Interés en tu anuncio: ${listing.title}`;
    }
  };

  if (loading) {
    return <LoadingState text="Cargando anuncio..." />;
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error || 'No se encontró el anuncio'} />
      </div>
    );
  }

  // Extraer datos del anuncio con valores predeterminados
  const title = listing.title || 'Sin título';
  const description = listing.description || 'Sin descripción';
  const price = listing.price || 0;
  const priceType = listing.price_type || 'fixed';
  const images = listing.images || [];
  const location = listing.location || {};
  const locationText = location.city ? `${location.city}, ${location.country || ''}` : 'Ubicación no especificada';
  const contact = listing.contact || {};
  const createdAt = new Date(listing.created_at).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Galería de imágenes */}
          <div className="relative aspect-video">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[activeImageIndex]}
                  alt={title}
                  layout="fill"
                  objectFit="cover"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === activeImageIndex ? 'bg-primary-500' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Título y ubicación */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-1" />
                  {locationText}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(price, priceType)}
                </div>
                <div className="text-sm text-gray-600">
                  {priceType === 'negotiable' ? 'Precio negociable' : 'Precio fijo'}
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-5 h-5 mr-2" />
                Publicado el {formatDate(createdAt)}
              </div>
              <div className="flex items-center text-gray-600">
                <EyeIcon className="w-5 h-5 mr-2" />
                {listing.views || 0} vistas
              </div>
              <div className="flex items-center text-gray-600">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                {priceType === 'fixed' ? 'Precio fijo' : 'Precio negociable'}
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Descripción
              </h2>
              <div className="text-gray-700 whitespace-pre-wrap">
                {description}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col md:flex-row gap-4">
              {contact.whatsapp && (
                <button
                  onClick={() => handleContactClick('whatsapp')}
                  className="flex-1 flex items-center justify-center py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                  Contactar por WhatsApp
                </button>
              )}
              
              {contact.phone && (
                <button
                  onClick={() => window.location.href = `tel:${contact.phone}`}
                  className="flex-1 flex items-center justify-center py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Llamar
                </button>
              )}
              
              {contact.email && (
                <button
                  onClick={() => handleContactClick('email')}
                  className="flex-1 flex items-center justify-center py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                  Contactar por Email
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="flex items-center justify-center py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
