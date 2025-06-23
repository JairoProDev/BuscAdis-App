'use client';

import React from 'react';
import MediaUploader from './MediaUploader';
import { Publication } from '@/types/publication';

interface MediaStepProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  formData?: Partial<Publication>;
}

const MediaStep: React.FC<MediaStepProps> = ({ images, onImagesChange, formData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Imágenes del anuncio
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Las imágenes de buena calidad aumentan las probabilidades de venta.
          Puedes subir hasta 8 imágenes.
        </p>
      </div>
      
      <MediaUploader 
        images={images}
        onImagesChange={onImagesChange}
        maxImages={8}
      />
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
          Consejos para mejores fotos
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc pl-5 space-y-1">
          <li>Utiliza un fondo neutro y buena iluminación</li>
          <li>Muestra el artículo desde diferentes ángulos</li>
          <li>Incluye fotos de detalles importantes o defectos</li>
          <li>Evita usar filtros que alteren la apariencia real</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaStep; 