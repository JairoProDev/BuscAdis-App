'use client'

import React from 'react'
// Removed useState, useEffect
import Link from 'next/link'
import { Category } from '@/types/marketplace'
// Import static categories
import { categories as staticCategoriesData } from '@/lib/constants';
// Import all needed icons
import { 
  BriefcaseIcon, 
  HomeIcon, 
  TruckIcon, 
  WrenchIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface CategoryRowProps {
  title: string
}

// Mapa de iconos estático (Can be potentially moved to constants if not used elsewhere)
const iconMap: Record<string, React.ElementType> = {
  'empleos': BriefcaseIcon,
  'inmuebles': HomeIcon,
  'vehiculos': TruckIcon,
  'servicios': WrenchIcon,
  'productos': ShoppingBagIcon,
  'eventos': CalendarIcon,
  'negocios': ChartBarIcon,
  'comunidad': UserGroupIcon
};

// Gradients for categories (Can be potentially moved to constants if not used elsewhere)
const gradientMap: Record<string, string> = {
  'empleos': 'from-blue-500 to-blue-700',
  'inmuebles': 'from-green-500 to-green-700',
  'vehiculos': 'from-red-500 to-red-700',
  'servicios': 'from-purple-500 to-purple-700',
  'productos': 'from-orange-500 to-orange-700',
  'eventos': 'from-pink-500 to-pink-700',
  'negocios': 'from-yellow-500 to-yellow-700',
  'comunidad': 'from-teal-500 to-teal-700'
};

// Convert static data to the format needed by the component
const categories: Category[] = Object.entries(staticCategoriesData).map(([id, data]) => ({
  id: id,
  name: data.name,
  // Assuming static data might not have gradient, add fallback
  gradient: gradientMap[id] || 'from-gray-500 to-gray-600',
  // Count is no longer fetched or used
}));

const CategoryRow = ({ title }: CategoryRowProps) => {
  // Removed useState, useEffect, and loading state

  // Loading state removed as data is static now
  // if (loading) { ... }

  return (
    <div className="py-4">
      {title && (
        <h3 className="text-lg font-semibold text-white px-4 mb-3">
          {title}
        </h3>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Map directly over the processed static categories array */} 
        {categories.map((category) => {
          // Obtener el componente de icono del mapa
          // Use category.iconName from static data if available, otherwise map by id
          const IconComponent = iconMap[category.id] || null;
          
          return (
            <Link
              key={category.id}
              // Use category.slug from static data for the link
              href={`/${category.slug || category.id}`}
              className={`flex flex-col items-center justify-center h-32 rounded-xl bg-gradient-to-br ${
                category.gradient // Use the gradient assigned during mapping
              } text-white p-4 transform hover:scale-105 transition-all duration-300 shadow-md`}
            >
              {IconComponent && (
                <IconComponent className="w-10 h-10 mb-2" />
              )}
              <span className="font-medium text-center">{category.name}</span>
              {/* Removed count display */}
              {/* {category.count !== undefined && ( ... )} */}
            </Link>
          );
        })}
      </div>
    </div>
  )
}

export default CategoryRow 