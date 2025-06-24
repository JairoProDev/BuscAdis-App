'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, Squares2X2Icon, BriefcaseIcon } from '@heroicons/react/24/outline'

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  subsubcategories?: SubSubcategory[];
}

interface SubSubcategory {
  id: string;
  name: string;
  slug: string;
}

interface CategorySelectorProps {
  activeCategory?: string;
  activeSubcategory?: string;
  activeSubSubcategory?: string;
  onCategoryChange?: (category: string) => void;
  onSubcategoryChange?: (subcategory: string) => void;
  onSubSubcategoryChange?: (subsubcategory: string) => void;
  variant?: 'dropdown' | 'modal' | 'inline';
  showIcon?: boolean;
  showCounts?: boolean;
  className?: string;
}

// Datos de categorías actualizados
const categoriesData: Category[] = [
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    slug: 'inmuebles',
    icon: '🏠',
    subcategories: [
      {
        id: 'venta',
        name: 'Venta',
        slug: 'venta',
        subsubcategories: [
          { id: 'casas', name: 'Casas', slug: 'casas' },
          { id: 'departamentos', name: 'Departamentos', slug: 'departamentos' },
          { id: 'terrenos', name: 'Terrenos', slug: 'terrenos' },
          { id: 'locales-comerciales', name: 'Locales Comerciales', slug: 'locales-comerciales' }
        ]
      },
      {
        id: 'alquiler',
        name: 'Alquiler',
        slug: 'alquiler',
        subsubcategories: [
          { id: 'casas', name: 'Casas', slug: 'casas' },
          { id: 'departamentos', name: 'Departamentos', slug: 'departamentos' },
          { id: 'cuartos', name: 'Cuartos', slug: 'cuartos' },
          { id: 'oficinas', name: 'Oficinas', slug: 'oficinas' }
        ]
      }
    ]
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    slug: 'vehiculos',
    icon: '🚗',
    subcategories: [
      {
        id: 'autos',
        name: 'Autos',
        slug: 'autos',
        subsubcategories: [
          { id: 'sedan', name: 'Sedán', slug: 'sedan' },
          { id: 'suv', name: 'SUV', slug: 'suv' },
          { id: 'hatchback', name: 'Hatchback', slug: 'hatchback' },
          { id: 'pickup', name: 'Pickup', slug: 'pickup' }
        ]
      },
      {
        id: 'motos',
        name: 'Motos',
        slug: 'motos',
        subsubcategories: [
          { id: 'scooter', name: 'Scooter', slug: 'scooter' },
          { id: 'deportiva', name: 'Deportiva', slug: 'deportiva' },
          { id: 'cruiser', name: 'Cruiser', slug: 'cruiser' },
          { id: 'lineal', name: 'Lineal', slug: 'lineal' }
        ]
      }
    ]
  },
  {
    id: 'empleos',
    name: 'Empleos',
    slug: 'empleos',
    icon: 'briefcase',
    subcategories: [
      {
        id: 'tecnologia',
        name: 'Tecnología',
        slug: 'tecnologia',
        subsubcategories: [
          { id: 'desarrollo-web', name: 'Desarrollo Web', slug: 'desarrollo-web' },
          { id: 'diseño-ux', name: 'Diseño UX/UI', slug: 'diseño-ux' },
          { id: 'data-science', name: 'Data Science', slug: 'data-science' },
          { id: 'marketing-digital', name: 'Marketing Digital', slug: 'marketing-digital' }
        ]
      },
      {
        id: 'ventas',
        name: 'Ventas',
        slug: 'ventas',
        subsubcategories: [
          { id: 'vendedor', name: 'Vendedor', slug: 'vendedor' },
          { id: 'asesor-comercial', name: 'Asesor Comercial', slug: 'asesor-comercial' },
          { id: 'gerente-ventas', name: 'Gerente de Ventas', slug: 'gerente-ventas' }
        ]
      }
    ]
  },
  {
    id: 'servicios',
    name: 'Servicios',
    slug: 'servicios',
    icon: '🔧',
    subcategories: [
      {
        id: 'hogar',
        name: 'Para el Hogar',
        slug: 'hogar',
        subsubcategories: [
          { id: 'plomeria', name: 'Plomería', slug: 'plomeria' },
          { id: 'electricidad', name: 'Electricidad', slug: 'electricidad' },
          { id: 'jardineria', name: 'Jardinería', slug: 'jardineria' },
          { id: 'limpieza', name: 'Limpieza', slug: 'limpieza' }
        ]
      },
      {
        id: 'profesionales',
        name: 'Profesionales',
        slug: 'profesionales',
        subsubcategories: [
          { id: 'abogados', name: 'Abogados', slug: 'abogados' },
          { id: 'contadores', name: 'Contadores', slug: 'contadores' },
          { id: 'arquitectos', name: 'Arquitectos', slug: 'arquitectos' }
        ]
      }
    ]
  }
]

export default function CategorySelector({
  activeCategory = '',
  activeSubcategory = '',
  activeSubSubcategory = '',
  onCategoryChange,
  onSubcategoryChange,
  onSubSubcategoryChange,
  variant = 'dropdown',
  showIcon = true,
  showCounts = false,
  className = ''
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<'category' | 'subcategory' | 'subsubcategory'>('category')
  const [hoveredCategory, setHoveredCategory] = useState<string>('')
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string>('')

  const currentCategory = categoriesData.find(cat => cat.slug === activeCategory)
  const currentSubcategory = currentCategory?.subcategories?.find(sub => sub.slug === activeSubcategory)

  const handleCategorySelect = (categorySlug: string) => {
    onCategoryChange?.(categorySlug)
    if (variant === 'dropdown') {
      setIsOpen(false)
    }
  }

  const handleSubcategorySelect = (subcategorySlug: string) => {
    onSubcategoryChange?.(subcategorySlug)
    if (variant === 'dropdown') {
      setIsOpen(false)
    }
  }

  const handleSubSubcategorySelect = (subsubcategorySlug: string) => {
    onSubSubcategoryChange?.(subsubcategorySlug)
    if (variant === 'dropdown') {
      setIsOpen(false)
    }
  }

  const getDisplayText = () => {
    if (activeSubSubcategory && currentSubcategory) {
      const subSub = currentSubcategory.subsubcategories?.find(s => s.slug === activeSubSubcategory)
      return `${currentCategory?.icon} ${subSub?.name}`
    }
    if (activeSubcategory && currentSubcategory) {
      return `${currentCategory?.icon} ${currentSubcategory.name}`
    }
    if (activeCategory && currentCategory) {
      return `${currentCategory.icon} ${currentCategory.name}`
    }
    return `${showIcon ? '🔍 ' : ''}Todas las categorías`
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-sm"
        >
          <span className="truncate max-w-[200px]">{getDisplayText()}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="max-h-96 overflow-y-auto">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Squares2X2Icon className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Seleccionar Categoría</span>
                  </div>
                </div>

                {/* Todas las categorías */}
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                    !activeCategory ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                  }`}
                >
                  <span className="text-lg">🔍</span>
                  <span className="font-medium">Todas las categorías</span>
                </button>

                {/* Categories */}
                {categoriesData.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => handleCategorySelect(category.slug)}
                      onMouseEnter={() => setHoveredCategory(category.slug)}
                      className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                        activeCategory === category.slug ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                      }`}
                    >
                      {category.icon === 'briefcase' ? (
                        <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                      ) : (
                        <span className="text-lg">{category.icon}</span>
                      )}
                      <div className="flex-1">
                        <span className="font-medium">{category.name}</span>
                        {category.subcategories && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({category.subcategories.length} subcategorías)
                          </span>
                        )}
                      </div>
                      {category.subcategories && (
                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    {/* Subcategories */}
                    {activeCategory === category.slug && category.subcategories && (
                      <div className="bg-gray-50 dark:bg-gray-700/50">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id}>
                            <button
                              onClick={() => handleSubcategorySelect(subcategory.slug)}
                              onMouseEnter={() => setHoveredSubcategory(subcategory.slug)}
                              className={`w-full text-left p-3 pl-12 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 ${
                                activeSubcategory === subcategory.slug ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-600' : ''
                              }`}
                            >
                              <div className="flex-1">
                                <span className="text-sm font-medium">{subcategory.name}</span>
                                {subcategory.subsubcategories && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({subcategory.subsubcategories.length} tipos)
                                  </span>
                                )}
                              </div>
                              {subcategory.subsubcategories && (
                                <ChevronDownIcon className="h-3 w-3 text-gray-400" />
                              )}
                            </button>

                            {/* Sub-subcategories */}
                            {activeSubcategory === subcategory.slug && subcategory.subsubcategories && (
                              <div className="bg-gray-100 dark:bg-gray-600/50">
                                {subcategory.subsubcategories.map((subsubcategory) => (
                                  <button
                                    key={subsubcategory.id}
                                    onClick={() => handleSubSubcategorySelect(subsubcategory.slug)}
                                    className={`w-full text-left p-2 pl-20 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm ${
                                      activeSubSubcategory === subsubcategory.slug ? 'bg-blue-200 dark:bg-blue-700/50 text-blue-700' : ''
                                    }`}
                                  >
                                    {subsubcategory.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Para otros variants (modal, inline) se puede expandir aquí
  return (
    <div className={`text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {getDisplayText()}
    </div>
  )
} 