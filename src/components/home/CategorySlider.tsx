'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { categories as staticCategories } from '@/data/categories';
import { useEffect, useState } from 'react';
import { CategoriesService } from '@/services/categories.service';
import { supabase } from '@/supabaseClient';

// Importar todos los iconos necesarios
import { 
  BriefcaseIcon, HomeIcon, TruckIcon, WrenchIcon, 
  ShoppingBagIcon, GlobeAltIcon, CalendarIcon, 
  AcademicCapIcon, HeartIcon, QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export default function CategorySlider() {
  // Usamos el objeto estático inicialmente
  const [categories] = useState(staticCategories);

  // Definimos un icono predeterminado para fallback
  const DefaultIcon = QuestionMarkCircleIcon;

  // Datos de categorías estructurados
  const categoryRows = [
    {
      categoryNames: ['Empleos', 'Inmuebles', 'Vehículos', 'Servicios'],
    },
    {
      categoryNames: ['Productos', 'Turismo', 'Eventos', 'Educación', 'Mascotas'],
    },
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {categoryRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {row.categoryNames.map((categoryName, index) => {
                // Verificar que categoryName sea válido
                if (!categoryName) {
                  return null;
                }
                
                // Garantizar que category esté definido, usando un objeto vacío como fallback
                const category = categories[categoryName as keyof typeof categories] || {};
                
                // Usar un icono predeterminado si icon es undefined
                const Icon = category.icon || DefaultIcon;
                
                // Usar valores predeterminados para todas las propiedades
                const gradient = category.gradient || 'from-gray-500 to-gray-600';
                
                return (
                  <Link
                    key={`${categoryName}-${index}`}
                    href={`/buscar?category=${categoryName.toLowerCase()}`}
                    className={`flex flex-col items-center justify-center h-32 rounded-xl bg-gradient-to-br ${gradient} text-white p-4 transform hover:scale-105 transition-all duration-300 shadow-md`}
                  >
                    <Icon className="w-10 h-10 mb-2" />
                    <span className="font-medium text-center">{categoryName}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 