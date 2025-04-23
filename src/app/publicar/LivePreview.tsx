// src/components/publish/LivePreview.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Publication } from '@/types/publication'; // Importa la interfaz final
import { formatCurrency } from '@/utils/format'; // Asumiendo helper
import { getClassificationNames } from '@/data/categories-data';

interface LivePreviewProps {
   // Usar Partial porque los datos pueden estar incompletos durante la creación
  ad: Partial<Publication>;
}

const LivePreview: React.FC<LivePreviewProps> = ({ ad }) => {
    const images = ad.images || [];
    const primaryPhone = ad.contact?.phones?.[0] || 'No especificado';
    const classificationNames = getClassificationNames(ad.categorySlug || '', ad.subcategorySlug);
    const categoryString = `${classificationNames.categoryName || ''}${classificationNames.subcategoryName ? ` > ${classificationNames.subcategoryName}` : ''}`;
    const locationString = `${ad.location?.district || ''}, ${ad.location?.province || ''}`.replace(/^, /, ''); // Limpiar si distrito es nulo


    return (
        <div className="border rounded-xl p-4 text-sm">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Vista Previa Rápida</h2>
            <p className="font-semibold mb-1">{ad.title || 'Sin Título'}</p>
            <p className="text-gray-600 mb-2 text-xs">({categoryString || 'Sin Categoría'})</p>
            <p className="text-gray-700 mb-3 line-clamp-4">{ad.description || 'Sin Descripción'}</p>

            {images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                    {images.map((imageUrl, index) => (
                        <div key={index} className="w-16 h-16 relative flex-shrink-0">
                             <Image
                                 src={imageUrl}
                                 alt={`Imagen ${index + 1}`}
                                 fill
                                 sizes="64px"
                                 className="object-cover rounded-md"
                                 onError={(e) => (e.currentTarget.style.display = 'none')}
                             />
                        </div>
                    ))}
                </div>
            )}

            <p className="text-gray-600 mb-1">📞 Teléfono Principal: {primaryPhone}</p>
            <p className="text-gray-600 mb-1">📍 Ubicación: {locationString || 'No especificada'}</p>
            {ad.amount !== null && ad.amount !== undefined && (
                 <p className="text-gray-800 font-medium">Precio: {formatCurrency(ad.amount, ad.currency || 'PEN')} {ad.negotiable ? '(Negociable)' : ''}</p>
            )}
             {ad.amount === 0 && !ad.negotiable && (
                 <p className="text-green-600 font-medium">Precio: Gratis</p>
             )}
        </div>
    );
};

export default LivePreview;