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
import { PublicationsService } from '@/services/publications.service';
import LoadingState from '@/components/ui/LoadingState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon, FlagIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Publication {
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

export default function PublicationDetailPage() {
  const params = useParams();
  const id = params.id;
  
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cargar datos del anuncio
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        const data = await PublicationsService.getPublicationById();
        setPublication(data || []);
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError('No se pudo cargar el anuncio. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublication();
    }
  }, [id]);

  // Manejar mensajes de WhatsApp
  const handleWhatsAppClick = () => {
    if (!publication?.contact?.whatsapp) return;
    
    const message = encodeURIComponent(`Hola, estoy interesado en tu anuncio "${publication.title}" de Buscadis.`);
    const number = publication.contact.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  // Manejar compartir
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication?.title || 'Anuncio en Buscadis',
          text: publication?.description || 'Mira este anuncio en Buscadis',
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
    if (!publication?.contact) return;

    if (type === 'whatsapp' && publication.contact.whatsapp) {
      const message = encodeURIComponent(`Hola, estoy interesado en tu anuncio "${publication.title}" de Buscadis`);
      window.open(`https://wa.me/${publication.contact.whatsapp}?text=${message}`, '_blank');
    } else if (type === 'email' && publication.contact.email) {
      window.location.href = `mailto:${publication.contact.email}?subject=Interesado en: ${publication.title}`;
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

  // Extraer datos del anuncio con valores predeterminados
  const title = publication.title || 'Sin título';
  const description = publication.description || 'Sin descripción';
  const price = publication.price || 0;
  const priceType = publication.price_type || 'fixed';
  const images = publication.images || [];
  const location = publication.location || {};
  const locationText = location.city ? `${location.city}, ${location.country || ''}` : 'Ubicación no especificada';
  const contact = publication.contact || {};
  const createdAt = new Date(publication.created_at).toLocaleDateString();

  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    let message = `Hola, estoy interesado en tu anuncio "${publication.title}" de Buscadis.`;
    
    // Personalizar el mensaje según la categoría
    if (publication.category === 'empleo') {
      message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en Buscadis.`;
    } else if (publication.category === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en Buscadis.`;
    }
    
    return encodeURIComponent(message);
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Imágenes */}
          {publication.media && publication.media.length > 0 ? (
            <div className="mb-8 overflow-hidden rounded-xl">
              <Carousel images={publication.media} />
            </div>
          ) : (
            <div className="mb-8 bg-gray-200 h-96 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 text-lg">Sin imágenes</span>
            </div>
          )}

          {/* Detalles del anuncio */}
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
                onClick={() => {
                  navigator.share({
                    title: publication.title,
                    text: `Mira este anuncio en Buscadis: ${publication.title}`,
                    url: window.location.href
                  }).catch(err => console.log('Error compartiendo:', err));
                }}
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
        
        {/* Contacto */}
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
            
            <div className="text-sm text-gray-500">
              Al contactar al anunciante, menciona que viste su anuncio en Buscadis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
