import Image from 'next/image';
import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons';

interface ClassifiedadCardProps {
  classifiedad: {
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

export default function ClassifiedadCard({ classifiedad }: ClassifiedadCardProps) {
  const formatPrice = (price: number, type: string) => {
    if (type === 'negotiable') return 'Negociable';
    if (type === 'free') return 'Gratis';
    return `S/ ${price.toLocaleString('es-PE')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatWhatsAppMessage = () => {
    let message = `Hola, estoy interesado en tu anuncio "${classifiedad.title}" de Buscadis.`;
    
    // Personalizar el mensaje según la categoría
    if (classifiedad.category === 'empleo') {
      message = `Hola, estoy interesado en la oferta de trabajo "${classifiedad.title}" publicada en Buscadis.`;
    } else if (classifiedad.category === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${classifiedad.title}" que tienes en Buscadis.`;
    }
    
    return encodeURIComponent(message);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/anuncios/${classifiedad.id}`}>
        <div className="relative h-48 w-full">
          {classifiedad.media && classifiedad.media.length > 0 ? (
            <Image
              src={classifiedad.media[0]}
              alt={classifiedad.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-lg">Sin imagen</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
            {formatPrice(classifiedad.price, classifiedad.priceType)}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/anuncios/${classifiedad.id}`}>
          <h3 className="font-semibold text-gray-800 text-lg mb-1 hover:text-primary-600 transition-colors">
            {classifiedad.title}
          </h3>
        </Link>
        
        <div className="text-sm text-gray-500 mb-3">
          {classifiedad.location.city}, {classifiedad.location.region} • {formatDate(classifiedad.createdAt)}
        </div>
        
        <div className="flex justify-between items-center">
          <a
            href={`https://wa.me/${classifiedad.contact.whatsapp}?text=${formatWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-green-600 font-medium text-sm hover:text-green-700 transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5 mr-1" />
            Contactar
          </a>
        </div>
      </div>
    </div>
  );
}
