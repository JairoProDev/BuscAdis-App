'use client';

import React from 'react';
import Image from 'next/image';
import { Publication } from '@/types/publication'; // Importa la interfaz final
import { formatCurrency } from '@/utils/format'; // Asumiendo helper
import { getClassificationNames } from '@/data/categories-data';
import AdPreview from './AdPreview';
import { PublicationFormData } from '@/types/publication';

interface LivePreviewProps {
   // Usar Partial porque los datos pueden estar incompletos durante la creación
  ad: PublicationFormData;
}

const LivePreview: React.FC<LivePreviewProps> = ({ ad }) => {
    const images = ad.images || [];
    const primaryPhone = ad.contact?.phones?.[0] || 'No especificado';
    const classificationNames = getClassificationNames(ad.categorySlug || '', ad.subcategorySlug);
    const categoryString = `${classificationNames.categoryName || ''}${classificationNames.subcategoryName ? ` > ${classificationNames.subcategoryName}` : ''}`;
    const locationString = `${ad.location?.district || ''}, ${ad.location?.province || ''}`.replace(/^, /, ''); // Limpiar si distrito es nulo

    return (
        <div className="relative">
            {/* Indicador de vista en vivo */}
            <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                <span className="animate-pulse h-2 w-2 bg-white rounded-full"></span>
                <span className="font-medium">EN VIVO</span>
            </div>
            
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <AdPreview adData={ad} isPreview={true} />
            </div>
        </div>
    );
};

export default LivePreview; 