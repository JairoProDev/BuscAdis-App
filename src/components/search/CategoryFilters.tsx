'use client';

import React from 'react'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
}

interface CategoryFiltersProps {
  selectedCategory: Category | null
  onSelectCategory: (category: Category | null) => void
}

export default function CategoryFilters({
  selectedCategory,
  onSelectCategory
}: CategoryFiltersProps) {
  // Lista simplificada de categorías
  const categories: Category[] = [
    { id: 'inmuebles', name: 'Inmuebles' },
    { id: 'vehiculos', name: 'Vehículos' },
    { id: 'empleos', name: 'Empleos' },
    { id: 'servicios', name: 'Servicios' },
    { id: 'productos', name: 'Productos' },
    { id: 'eventos', name: 'Eventos' },
    { id: 'negocios', name: 'Negocios' },
    { id: 'comunidad', name: 'Comunidad' }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-100">Categorías</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            className={`p-3 rounded-lg text-left ${
              selectedCategory?.id === category.id
                ? 'bg-teal-500 text-white'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(category)}
          >
            <span className="font-medium">{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}