'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Category } from '@/types/marketplace'
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

// Mapa de iconos estático
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

// Gradients for categories
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

const CategoryRow = ({ title }: CategoryRowProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real categories from API
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories from API
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        // Fetch category counts
        const countResponse = await fetch('/api/categories/count');
        let counts: Record<string, number> = {};
        
        if (countResponse.ok) {
          const countData = await countResponse.json();
          counts = countData.reduce((acc: Record<string, number>, curr: { id: string, count: number }) => {
            acc[curr.id] = curr.count;
            return acc;
          }, {});
        }
        
        const categoriesData = await response.json();
        
        // Add counts to categories
        const enhancedCategories = categoriesData.map((category: any) => ({
          id: category.id,
          name: category.name,
          gradient: gradientMap[category.id] || 'from-gray-500 to-gray-600',
          count: counts[category.id] || 0
        }));
        
        setCategories(enhancedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        
        // Fallback to hardcoded categories if API fails
        const fallbackCategories = [
          { id: 'empleos', name: 'Empleos', gradient: 'from-blue-500 to-blue-700', count: 0 },
          { id: 'inmuebles', name: 'Inmuebles', gradient: 'from-green-500 to-green-700', count: 0 },
          { id: 'vehiculos', name: 'Vehículos', gradient: 'from-red-500 to-red-700', count: 0 },
          { id: 'servicios', name: 'Servicios', gradient: 'from-purple-500 to-purple-700', count: 0 },
          { id: 'productos', name: 'Productos', gradient: 'from-orange-500 to-orange-700', count: 0 },
          { id: 'eventos', name: 'Eventos', gradient: 'from-pink-500 to-pink-700', count: 0 },
          { id: 'negocios', name: 'Negocios', gradient: 'from-yellow-500 to-yellow-700', count: 0 },
          { id: 'comunidad', name: 'Comunidad', gradient: 'from-teal-500 to-teal-700', count: 0 }
        ];
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="py-4">
      {title && (
        <h3 className="text-lg font-semibold text-white px-4 mb-3">
          {title}
        </h3>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => {
          // Obtener el componente de icono del mapa
          const IconComponent = iconMap[category.id] || null;
          
          return (
            <Link
              key={category.id}
              href={`/${category.id}`}
              className={`flex flex-col items-center justify-center h-32 rounded-xl bg-gradient-to-br ${
                category.gradient || 'from-gray-500 to-gray-600'
              } text-white p-4 transform hover:scale-105 transition-all duration-300 shadow-md`}
            >
              {IconComponent && (
                <IconComponent className="w-10 h-10 mb-2" />
              )}
              <span className="font-medium text-center">{category.name}</span>
              {category.count !== undefined && (
                <span className="text-xs bg-white/20 rounded-full px-2 py-1 mt-1">
                  {category.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  )
}

export default CategoryRow 