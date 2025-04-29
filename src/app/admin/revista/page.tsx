import React from 'react';
import { Metadata } from 'next';
import AdminMagazineManager from '@/components/magazine/AdminMagazineManager';

export const metadata: Metadata = {
  title: 'Administrar Revista Digital | Buscadis',
  description: 'Panel de administración para la revista digital - Gestiona la revista de clasificados',
};

export default function AdminMagazinePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Administración de Revista Digital</h1>
        
        <AdminMagazineManager />
      </div>
    </div>
  );
} 