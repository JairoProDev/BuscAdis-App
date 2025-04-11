import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { generateSeoUrl } from '@/utils/url';

export default function AdisoCard({ adiso, featured = false }) {
  // Si adiso es undefined o null, mostrar un placeholder
  if (!adiso) {
    return (
      <div className="rounded-xl overflow-hidden bg-white shadow-md h-64">
        <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  // Extraer propiedades con validación segura
  const id = adiso.id || 'unknown';
  const title = adiso.title || 'Sin título';
  const priceValue = typeof adiso.price === 'number' ? adiso.price : 
                    (adiso.price?.amount || 0);
  
  // Manejar ubicación con validación
  let locationText = 'Ubicación no especificada';
  if (adiso.location) {
    if (typeof adiso.location === 'string') {
      locationText = adiso.location;
    } else if (adiso.location.city) {
      locationText = adiso.location.city;
      if (adiso.location.country) {
        locationText += `, ${adiso.location.country}`;
      }
    }
  }

  // Demás propiedades con valores predeterminados
  const image = adiso.image || '/images/placeholder.jpg';
  const isPremium = !!adiso.is_premium || featured;
  const isVerified = !!adiso.is_verified;
  const rating = adiso.rating || 0;

  return (
    <Link href={generateSeoUrl(
      id, 
      title, 
      adiso.category || adiso.categorySlug || 'general'
    )} className="block">
      <div className="rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-video">
          <div className="w-full h-full bg-gray-200">
            <Image
              src={image}
              alt={title}
              width={400}
              height={225}
              layout="responsive"
              className="object-cover"
              onError={(e) => {
                // Fallback a una imagen predeterminada en caso de error
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
            />
          </div>
          
          {isPremium && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded">
              Premium
            </div>
          )}
          
          {isVerified && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">{title}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{locationText}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              ${priceValue.toLocaleString()}
            </span>
            
            {rating > 0 && (
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
