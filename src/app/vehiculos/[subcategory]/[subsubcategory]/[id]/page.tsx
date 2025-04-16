'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ShareIcon,
  FlagIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { slugify } from '@/utils/url';
import RelatedPublications from '@/components/publication/RelatedPublications';

interface PublicationData {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  images: string[];
  location: {
    city: string;
    region?: string;
    country?: string;
  };
  contact: {
    whatsapp?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  created_at: string;
  views?: number;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subsubcategory?: string;
  attributes?: Record<string, any>;
}

export default function VehiculoDetailPageContent({ publication: initialPublication }: { publication: PublicationData }) {
  const router = useRouter();
  const params = useParams();
  const [publication, setPublication] = useState<PublicationData | null>(initialPublication);
  const [relatedPublications, setRelatedPublications] = useState<PublicationData[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!publication) return;
      try {
        const relatedData = await PublicationsService.getRelatedPublications(
          publication.id,
          publication.categorySlug || publication.category || 'general'
        );
        setRelatedPublications(relatedData || []);
      } catch (err) {
        console.error('Error al obtener publicaciones relacionadas:', err);
      }
    };

    fetchRelated();
  }, [publication]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication?.title || 'Vehículo en BuscaDis',
          text: publication?.description || 'Mira este vehículo en BuscaDis',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    return encodeURIComponent(`Hola, estoy interesado en el vehículo "${publication.title}" que tienes en BuscaDis.`);
  };
  
  if (!publication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { 
    title, description, price, price_type: priceType, images, 
    location, contact, created_at: createdAt, views, attributes 
  } = publication;
  const formattedDate = formatDate(createdAt);
  const formattedPrice = formatPrice(price, priceType);
  const city = typeof location === 'string' ? location : location?.city || '';
  const region = typeof location === 'string' ? '' : location?.region || '';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Volver
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Carousel 
                images={images || []} 
                category="vehiculos" 
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="text-2xl font-bold text-blue-600">
                  {formattedPrice}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{city}{region ? `, ${region}` : ''}</span>
                  </div>
                  {views !== undefined && (
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{views} {views === 1 ? 'vista' : 'vistas'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="prose max-w-none text-gray-700 mb-6">
                <h2 className="text-xl font-semibold mb-2">Descripción</h2>
                <p>{description}</p>
              </div>
              
              {attributes && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Características</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {Object.entries(attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center text-gray-600">
                        {key === 'marca' && <span className="mr-2">🚗</span>}
                        {key === 'modelo' && <span className="mr-2">🏷️</span>}
                        {key === 'año' && <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />}
                        {key === 'kilometraje' && <span className="mr-2">🛣️</span>}
                        {key === 'combustible' && <span className="mr-2">⛽</span>}
                        {key === 'transmision' && <span className="mr-2">⚙️</span>}
                        {key === 'estado_mecanico' && <WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-blue-500" />}
                        {key === 'estado_pintura' && <PaintBrushIcon className="w-4 h-4 mr-2 text-blue-500" />}
                        
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="ml-1">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Contactar</h2>
              {contact.name && (
                <p className="text-lg font-medium text-gray-800 mb-2">{contact.name}</p>
              )}
              <div className="space-y-3">
                {contact.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <WhatsAppIcon className="w-5 h-5 mr-2" /> WhatsApp
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> Llamar
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 space-y-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-gray-200"
              >
                <ShareIcon className="w-5 h-5 mr-2" /> Compartir
              </button>
              <button
                className="flex items-center justify-center w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-red-100"
              >
                <FlagIcon className="w-5 h-5 mr-2" /> Reportar Aviso
              </button>
            </div>
          </div>
        </div>

        {relatedPublications.length > 0 && (
          <RelatedPublications publications={relatedPublications} />
        )}
      </div>
    </div>
  );
} 