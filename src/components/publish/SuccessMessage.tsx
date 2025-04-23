'use client';

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SuccessMessageProps {
  publicationId?: string;
  message?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  publicationId,
  message = '¡Tu anuncio ha sido publicado exitosamente!'
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">
        <CheckCircleIcon className="h-16 w-16 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4">{message}</h2>
      <p className="text-gray-600 mb-8">Tu anuncio será revisado por nuestro equipo y estará visible pronto.</p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          href={publicationId ? `/anuncios/${publicationId}` : '/mis-anuncios'} 
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {publicationId ? 'Ver mi anuncio' : 'Mis anuncios'}
        </Link>
        <Link 
          href="/" 
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default SuccessMessage; 