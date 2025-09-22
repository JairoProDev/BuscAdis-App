import React from 'react';
import { Metadata } from 'next';
import MagazineCategoriesGrid from '@/components/magazine/MagazineCategoriesGrid';

export const metadata: Metadata = {
  title: 'Revista Digital | Buscadis',
  description: 'Revistas digitales por categorías - Descarga la última edición con todos los adisos clasificados',
};

export default function RevistaMagazinePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Revistas Digitales Buscadis
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-6">
              Explora nuestras revistas digitales por categoría con todos los adisos clasificados actualizados.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 inline-block">
              <p className="text-blue-800 text-sm">
                Nuestras revistas se actualizan automáticamente cuando se publican nuevos adisos.
              </p>
            </div>
          </div>
        </div>
        
        {/* Sección de categorías de revistas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-gray-200">
            Categorías de Revistas
          </h2>
          
          <MagazineCategoriesGrid />
        </div>
        
        {/* Sección informativa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              Descarga y Comparte
            </h3>
            <p className="text-gray-600">
              Todas nuestras revistas están disponibles en formato PDF, optimizadas para su lectura en 
              dispositivos electrónicos. Descárgalas y compártelas con quien quieras.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              Revistas Actualizadas
            </h3>
            <p className="text-gray-600">
              Las revistas se actualizan automáticamente cuando se publican nuevos adisos.
              Encuentra siempre la información más reciente sin esfuerzo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 