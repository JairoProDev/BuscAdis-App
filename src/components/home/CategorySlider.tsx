'use client'

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Importar iconos específicos
import { 
  BriefcaseIcon, HomeIcon, TruckIcon
} from '@heroicons/react/24/outline';

const iconMap: Record<string, React.ComponentType<any>> = {
  'Empleos': BriefcaseIcon,
  'Inmuebles': HomeIcon,
  'Vehículos': TruckIcon,
};

export default function CategorySlider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos estáticos para pruebas
  const categories = {
    'Empleos': {
      gradient: 'from-blue-500 to-blue-700',
    },
    'Inmuebles': {
      gradient: 'from-green-500 to-green-700',
    },
    'Vehículos': {
      gradient: 'from-red-500 to-red-700',
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {Object.entries(categories).map(([key, category]) => {
            // Obtener el componente de icono del mapa
            const IconComponent = iconMap[key] || null;
            
            return (
              <Link
                key={key}
                href={`/buscar?category=${key.toLowerCase()}`}
                className={`flex flex-col items-center justify-center h-32 rounded-xl bg-gradient-to-br ${category.gradient} text-white p-4 transform hover:scale-105 transition-all duration-300 shadow-md`}
              >
                {IconComponent && (
                  <IconComponent className="w-10 h-10 mb-2" />
                )}
                <span className="font-medium text-center">{key}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 