import Image from 'next/image';
import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons';
import { useMemo } from 'react';

interface PublicationCardProps {
  publication: {
    id: string;
    title: string;
    price: number;
    priceType: string;
    location: {
      city: string;
      region: string;
    };
    media: string[];
    createdAt: string;
    contact: {
      whatsapp: string;
    };
    category: string;
  };
}

export default function PublicationCard({ publication }: PublicationCardProps) {
  const formatPrice = (price: number, type: string) => {
    if (type === 'negotiable') return 'Negociable';
    if (type === 'free') return 'Gratis';
    return `S/ ${price.toLocaleString('es-PE')}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const formatWhatsAppMessage = () => {
    let message = `Hola, estoy interesado en tu anuncio "${publication.title}" de Buscadis.`;
    
    // Personalizar el mensaje según la categoría
    if (publication.category === 'empleo') {
      message = `Hola, estoy interesado en la oferta de trabajo "${publication.title}" publicada en Buscadis.`;
    } else if (publication.category === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en Buscadis.`;
    }
    
    return encodeURIComponent(message);
  };

  // Determinar si la publicación tiene imagen
  const hasImage = useMemo(() => {
    return publication.media && publication.media.length > 0;
  }, [publication.media]);

  // Generar slug para la URL amigable
  const generateSeoUrl = () => {
    const titleSlug = publication.title
      .toLowerCase()
      .replace(/[^\w\sáéíóúñ]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    return `/anuncios/${publication.category}/${titleSlug}/${publication.id}`;
  };

  // URL amigable para SEO
  const seoUrl = useMemo(() => generateSeoUrl(), [publication.id, publication.title, publication.category]);

  return (
    <div className={`rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${!hasImage ? 'publication-card-no-image' : 'bg-white'}`}>
      <Link href={seoUrl}>
        {hasImage ? (
          <div className="relative h-48 w-full">
            <Image
              src={publication.media[0]}
              alt={publication.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
              {formatPrice(publication.price, publication.priceType)}
            </div>
          </div>
        ) : (
          <div className="publication-info flex flex-col justify-between h-40 p-4">
            <div className="flex justify-between">
              <span className="category-badge bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                {publication.category}
              </span>
              <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                {formatPrice(publication.price, publication.priceType)}
              </span>
            </div>
            <h3 className="font-semibold text-white text-lg mb-1 mt-2 line-clamp-2">
              {publication.title}
            </h3>
            <div className="text-sm text-white/80 mb-2">
              {publication.location.city}, {publication.location.region} • {formatDate(publication.createdAt)}
            </div>
          </div>
        )}
      </Link>
      
      {hasImage && (
        <div className="p-4">
          <Link href={seoUrl}>
            <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors text-lg mb-1">
              {publication.title}
            </h3>
          </Link>
          
          <div className="text-sm text-gray-500 mb-3">
            {publication.location.city}, {publication.location.region} • {formatDate(publication.createdAt)}
          </div>
          
          <div className="flex justify-between items-center">
            <a
              href={`https://wa.me/${publication.contact.whatsapp}?text=${formatWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-green-600 font-medium text-sm hover:text-green-700 transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5 mr-1" />
              Contactar
            </a>
          </div>
        </div>
      )}
      
      {!hasImage && (
        <div className="p-3 bg-white rounded-b-xl">
          <a
            href={`https://wa.me/${publication.contact.whatsapp}?text=${formatWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full text-green-600 font-medium text-sm hover:text-green-700 transition-colors py-2"
          >
            <WhatsAppIcon className="w-5 h-5 mr-1" />
            Contactar
          </a>
        </div>
      )}
    </div>
  );
}
