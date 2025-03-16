'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Category } from '@/types/marketplace'
import { CategoriesService } from '@/services/categories.service'
// Importar iconos específicos en lugar de usar category.icon
import { BriefcaseIcon, HomeIcon, TruckIcon } from '@heroicons/react/24/outline'

interface CategoryRowProps {
  title: string
}

// Mapa de iconos estático
const iconMap = {
  'empleos': BriefcaseIcon,
  'inmuebles': HomeIcon,
  'vehiculos': TruckIcon,
  // Añade más según sea necesario
};

const CategoryRow = ({ title }: CategoryRowProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simplificar usando datos estáticos para pruebas
    const staticCategories = [
      { id: 'empleos', name: 'Empleos', gradient: 'from-blue-500 to-blue-700' },
      { id: 'inmuebles', name: 'Inmuebles', gradient: 'from-green-500 to-green-700' },
      { id: 'vehiculos', name: 'Vehículos', gradient: 'from-red-500 to-red-700' },
    ];
    
    setCategories(staticCategories);
    setLoading(false);
    
    /* Comentar temporalmente la llamada a la API
    const loadCategories = async () => {
      try {
        const categoriesData = await CategoriesService.getCategories()
        if (!Array.isArray(categoriesData)) {
          throw new Error('Categories data is not an array')
        }
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories([]) 
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
    */
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
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
              href={`/buscar?category=${category.id}`}
              className={`flex flex-col items-center justify-center h-32 rounded-xl bg-gradient-to-br ${
                category.gradient || 'from-gray-500 to-gray-600'
              } text-white p-4 transform hover:scale-105 transition-all duration-300 shadow-md`}
            >
              {IconComponent && (
                <IconComponent className="w-10 h-10 mb-2" />
              )}
              <span className="font-medium text-center">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  )
}

export default CategoryRow 