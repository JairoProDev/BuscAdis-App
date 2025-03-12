import Image from 'next/image';
import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons';

interface ListingCardProps {
  listing: {
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

export default function ListingCard({ listing }: ListingCardProps) {
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
    let message = `Hola, estoy interesado en tu anuncio "${listing.title}" de Buscadis.`;
    
    // Personalizar el mensaje según la categoría
    if (listing.category === 'empleo') {
      message = `Hola, estoy interesado en la oferta de trabajo "${listing.title}" publicada en Buscadis.`;
    } else if (listing.category === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${listing.title}" que tienes en Buscadis.`;
    }
    
    return encodeURIComponent(message);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/anuncios/${listing.id}`}>
        <div className="relative h-48 w-full">
          {listing.media && listing.media.length > 0 ? (
            <Image
              src={listing.media[0]}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-lg">Sin imagen</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
            {formatPrice(listing.price, listing.priceType)}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/anuncios/${listing.id}`}>
          <h3 className="font-semibold text-gray-800 text-lg mb-1 hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>
        </Link>
        
        <div className="text-sm text-gray-500 mb-3">
          {listing.location.city}, {listing.location.region} • {formatDate(listing.createdAt)}
        </div>
        
        <div className="flex justify-between items-center">
          <a
            href={`https://wa.me/${listing.contact.whatsapp}?text=${formatWhatsAppMessage()}`}
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
