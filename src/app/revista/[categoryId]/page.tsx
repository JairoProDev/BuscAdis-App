import React from 'react';
import { Metadata } from 'next';
import MagazineCategoryViewer from '@/components/magazine/MagazineCategoryViewer';
import { notFound } from 'next/navigation';

interface RouteParams {
  params: Promise<{
    categoryId: string;
  }>;
}

// Lista de categorías válidas
const VALID_CATEGORIES = [
  'inmuebles', 'vehiculos', 'empleos', 'servicios', 
  'productos', 'eventos', 'negocios', 'comunidad'
];

// Nombres legibles de categorías
const CATEGORY_NAMES: Record<string, string> = {
  'inmuebles': 'Inmuebles',
  'vehiculos': 'Vehículos',
  'empleos': 'Empleos',
  'servicios': 'Servicios',
  'productos': 'Productos',
  'eventos': 'Eventos',
  'negocios': 'Negocios',
  'comunidad': 'Comunidad'
};

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { categoryId } = await params;
  
  // Verificar si la categoría existe
  if (!VALID_CATEGORIES.includes(categoryId)) {
    return {
      title: 'Categoría no encontrada | Buscadis'
    };
  }
  
  const categoryName = CATEGORY_NAMES[categoryId] || categoryId;
  
  return {
    title: `Revista de ${categoryName} | Buscadis`,
    description: `Explora y descarga nuestra revista digital de anuncios clasificados de ${categoryName.toLowerCase()} - Buscadis`
  };
}

export default async function RevistaCategoryPage({ params }: RouteParams) {
  const { categoryId } = await params;
  
  // Verificar si la categoría existe
  if (!VALID_CATEGORIES.includes(categoryId)) {
    return notFound();
  }
  
  const categoryName = CATEGORY_NAMES[categoryId] || categoryId;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Revista de {categoryName}
        </h1>
        
        <MagazineCategoryViewer categoryId={categoryId} />
      </div>
    </div>
  );
} 