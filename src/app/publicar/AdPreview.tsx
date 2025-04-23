// src/components/publish/AdPreview.tsx
import React from 'react';
import Image from 'next/image';
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'; // Cambiado CalendarIcon
import { WhatsAppIcon } from '@/components/icons'; // Asumiendo que existe
import { Publication } from '@/types/publication'; // Importa la interfaz final
import { getClassificationNames } from '@/data/categories-data'; // Importa helper
import { formatCurrency } from '@/utils/format'; // Asumiendo helper de formato de moneda

interface AdPreviewProps {
  // Usa la interfaz Publication o un Partial si los datos pueden estar incompletos durante la creación
  adData: Partial<Publication>;
}

const AdPreview: React.FC<AdPreviewProps> = ({ adData }) => {
  // Obtener valores usando la nueva estructura y valores por defecto
  const title = adData?.title || 'Título del anuncio';
  const description = adData?.description || 'Descripción del anuncio...';
  const amount = adData?.amount ?? null; // Usar nullish coalescing
  const currency = adData?.currency || 'PEN';
  const negotiable = adData?.negotiable || false;
  const images = adData?.images || [];
  const coverImage = adData?.coverImage || (images.length > 0 ? images[0] : '');
  const hasImages = images.length > 0;

  // Obtener nombres de categorías usando el helper
  const classificationNames = getClassificationNames(
    adData?.categorySlug || '',
    adData?.subcategorySlug,
    adData?.subSubcategorySlug
  );
  const categoryName = classificationNames.categoryName || 'Categoría';
  const subcategoryName = classificationNames.subcategoryName || '';
  const subSubcategoryName = classificationNames.subSubcategoryName || ''; // Para mostrar si se desea

  // Construir ubicación
  const locationParts = [
      adData?.location?.district,
      adData?.location?.province, // Siempre 'Cusco'
  ].filter(Boolean); // Filtra partes nulas o vacías
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Ubicación no especificada';

  // Contacto (tomar el primer teléfono como WhatsApp principal para el preview)
  const primaryPhone = adData?.contact?.phones?.[0] || '';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all border border-gray-200">
      <div className="relative">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs px-2 py-1 absolute top-2 right-2 rounded-md z-10 font-medium">
          Vista previa
        </div>

        {/* Imagen */}
        <div className="w-full h-48 bg-gray-100 relative">
          {hasImages ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Ayuda a Next/Image a optimizar
              className="object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')} // Ocultar si la imagen falla
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              <span>Sin imagen</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-3">
        {/* Etiquetas de categoría */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryName !== 'Categoría' && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
              {categoryName}
            </span>
          )}
          {subcategoryName && (
            <>
              <span className="text-xs text-gray-400">&gt;</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {subcategoryName}
              </span>
            </>
          )}
           {subSubcategoryName && (
            <>
               <span className="text-xs text-gray-400">&gt;</span>
               <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded">
                 {subSubcategoryName}
               </span>
            </>
           )}
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 hover:line-clamp-none transition-all">
          {title}
        </h3>

        {/* Precio */}
        <div className="text-xl font-bold text-primary-600">
          {amount !== null ? (
            <>
              {formatCurrency(amount, currency)}
              {negotiable && <span className="text-sm font-normal text-gray-500 ml-2">(Negociable)</span>}
            </>
          ) : amount === 0 && !negotiable ? ( // Asumiendo que 0 significa Gratis si no es negociable
            <span className="text-green-600">Gratis</span>
          ) : (
            <span className="text-gray-500">Consultar</span>
          )}
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm line-clamp-3 hover:line-clamp-none transition-all">
          {description}
        </p>

        {/* Ubicación y fecha */}
        <div className="flex items-center text-gray-500 text-xs pt-2 border-t border-gray-100">
          <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="mr-3 truncate">{locationString}</span>
          <CalendarDaysIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span>Publicado hoy</span> {/* O usar publicationDate si existe */}
        </div>

        {/* Botón de contacto */}
        {primaryPhone && (
          <div className="mt-4">
            {/* El href real se pondría en la vista del anuncio publicado */}
            <a
              href={`https://wa.me/${primaryPhone.replace(/[^0-9]/g, '')}`} // Enlace funcional (simplificado)
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              Contactar por WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdPreview;