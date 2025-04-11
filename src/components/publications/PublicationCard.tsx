import Image from 'next/image';
import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons';
import { useMemo } from 'react';
import { generateSeoUrl } from '@/utils/url';

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
    subcategory?: string;
    subsubcategory?: string;
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
    let message = `Hola, estoy interesado en tu publicación "${publication.title}" de Buscadis.`;
    
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

  // URL amigable para SEO
  const seoUrl = useMemo(() => generateSeoUrl(
    publication.id, 
    publication.title, 
    publication.category,
    publication.subcategory,
    publication.subsubcategory
  ), [
    publication.id, 
    publication.title, 
    publication.category,
    publication.subcategory,
    publication.subsubcategory
  ]);

  return (
    <div className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${!hasImage ? 'publication-card-no-image' : 'bg-white'}`}>
      <Link href={seoUrl}>
        {hasImage ? (
          <div className="relative h-56 w-full">
            <Image
              src={publication.media[0]}
              alt={publication.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur-sm">
              {formatPrice(publication.price, publication.priceType)}
            </div>
            
            {/* Logo de Buscadis */}
            <div className="absolute top-2 left-2 z-20">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-md">
                <Image
                  src="/logo.png"
                  alt="Buscadis"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="publication-info flex flex-col justify-between h-full p-4 relative">
            <div className="flex justify-between">
              <span className="category-badge">
                {publication.category}
              </span>
              <span className="price">
                {formatPrice(publication.price, publication.priceType)}
              </span>
            </div>
            
            {/* Logo de Buscadis */}
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-md">
                <Image
                  src="/logo.png"
                  alt="Buscadis"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
            </div>
            
            <h3 className="title mt-2 line-clamp-2">
              {publication.title}
            </h3>
            <div className="location">
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
