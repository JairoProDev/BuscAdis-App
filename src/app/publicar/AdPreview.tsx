// AdPreview.tsx
import React from 'react';
import { formatPrice } from '@/utils/format';
import { WhatsAppIcon } from '@/components/icons';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface AdPreviewProps {
  adData: any;
}

const AdPreview: React.FC<AdPreviewProps> = ({ adData }) => {
  // Obtener valores para la vista previa
  const title = adData?.title || 'Título del anuncio';
  const description = adData?.description || 'Descripción del anuncio...';
  const price = adData?.price?.amount || 0;
  const currency = adData?.price?.currency || 'PEN';
  const priceType = adData?.price?.type || 'fixed';
  const location = adData?.location?.city 
    ? `${adData.location.city}, ${adData.location.country || ''}` 
    : 'Ubicación';
  const categoryName = adData?.category?.name || 'Categoría';
  const subcategoryName = adData?.category?.subcategories?.find((sub: any) => sub.selected)?.name || '';
  const contactWhatsapp = adData?.contact?.whatsapp || '';
  
  // Obtener la primera imagen si existe
  const hasImages = adData?.media && adData.media.length > 0;
  const firstImage = hasImages ? adData.media[0] : '';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all">
      <div className="relative">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs px-2 py-1 absolute top-2 right-2 rounded-md z-10">
          Vista previa
        </div>
        
        {/* Imagen */}
        <div className="w-full h-48 bg-gray-200 relative">
          {hasImages ? (
            <Image 
              src={firstImage} 
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>Sin imagen</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5">
        {/* Etiquetas de categoría */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
            {categoryName}
          </span>
          {subcategoryName && (
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
              {subcategoryName}
            </span>
          )}
        </div>
        
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        {/* Precio */}
        <div className="text-xl font-bold text-primary-600 mb-3">
          {formatPrice(price, priceType, currency)}
        </div>
        
        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        
        {/* Ubicación y fecha */}
        <div className="flex items-center text-gray-500 text-xs mb-5">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="mr-3">{location}</span>
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>Hoy</span>
        </div>
        
        {/* Botón de contacto */}
        {contactWhatsapp && (
          <div className="mt-2">
            <a 
              href="#"
              className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              Contactar
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdPreview;