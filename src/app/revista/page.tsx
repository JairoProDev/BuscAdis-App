import React from 'react';
import { Metadata } from 'next';
import MagazineViewer from '@/components/magazine/MagazineViewer';

export const metadata: Metadata = {
  title: 'Revista Digital | Buscadis',
  description: 'Revista digital de clasificados - Descarga la última edición de nuestra revista con todos los anuncios clasificados',
};

export default function RevistaMagazinePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Revista Digital Buscadis</h1>
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Explora y descarga nuestra revista digital con todos los anuncios clasificados actualizados.
          </p>
        </div>
        
        <MagazineViewer />
      </div>
    </div>
  );
} 