'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface CompactCategorySelectorProps {
  selectedCategory: string
  selectedSubcategory: string
  onCategoryChange: (category: string) => void
  onSubcategoryChange: (subcategory: string) => void
  className?: string
}

export default function CompactCategorySelector({ 
  selectedCategory, 
  selectedSubcategory,
  onCategoryChange, 
  onSubcategoryChange,
  className = ''
}: CompactCategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSubcategories, setShowSubcategories] = useState(false)

  const categories = [
    { 
      id: 'all', 
      name: 'Todas las categorías', 
      iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
      color: 'bg-gray-100' 
    },
    { 
      id: 'empleos', 
      name: 'Empleos', 
      iconPath: 'M20 7a2 2 0 002-2V4a2 2 0 00-2-2h-3.28a1 1 0 01-.948-.684l-.684-2.051A1 1 0 0014.72 2H9.28a1 1 0 00-.948.684l-.684 2.051A1 1 0 016.72 4H4a2 2 0 00-2 2v1a2 2 0 002 2h16z M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9', 
      color: 'bg-blue-100' 
    },
    { 
      id: 'inmuebles', 
      name: 'Inmuebles', 
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
      color: 'bg-green-100' 
    },
    { 
      id: 'vehiculos', 
      name: 'Vehículos', 
      iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', 
      color: 'bg-orange-100' 
    },
    { 
      id: 'servicios', 
      name: 'Servicios', 
      iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', 
      color: 'bg-purple-100' 
    },
    { 
      id: 'productos', 
      name: 'Productos', 
      iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', 
      color: 'bg-pink-100' 
    },
    { 
      id: 'eventos', 
      name: 'Eventos', 
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
      color: 'bg-yellow-100' 
    },
    { 
      id: 'negocios', 
      name: 'Negocios', 
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', 
      color: 'bg-indigo-100' 
    },
    { 
      id: 'comunidad', 
      name: 'Comunidad', 
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 
      color: 'bg-red-100' 
    }
  ]

  const subcategoriesByCategory: Record<string, Array<{id: string, name: string}>> = {
    empleos: [
      { id: 'tiempo-completo', name: 'Tiempo completo' },
      { id: 'medio-tiempo', name: 'Medio tiempo' },
      { id: 'freelance', name: 'Freelance' },
      { id: 'practicantes', name: 'Practicantes' }
    ],
    inmuebles: [
      { id: 'venta', name: 'Venta' },
      { id: 'alquiler', name: 'Alquiler' },
      { id: 'compartir', name: 'Compartir' }
    ],
    vehiculos: [
      { id: 'autos', name: 'Autos' },
      { id: 'motos', name: 'Motos' },
      { id: 'camiones', name: 'Camiones' }
    ]
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const availableSubcategories = selectedCategory ? subcategoriesByCategory[selectedCategory] || [] : []

  const handleCategorySelect = (categoryId: string) => {
    console.log('🏷️ CompactCategorySelector: Category selected:', categoryId)
    onCategoryChange(categoryId)
    setShowSubcategories(categoryId !== 'all' && availableSubcategories.length > 0)
    if (categoryId === 'all' || !availableSubcategories.length) {
      setIsOpen(false)
    }
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    onSubcategoryChange(subcategoryId)
    setIsOpen(false)
    setShowSubcategories(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-transparent border-none text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedCategoryData?.iconPath || 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'} />
        </svg>
        <span className="font-medium truncate max-w-32">
          {selectedCategoryData?.name || 'Categoría'}
        </span>
        {selectedSubcategory && (
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
            / {subcategoriesByCategory[selectedCategory]?.find(s => s.id === selectedSubcategory)?.name}
          </span>
        )}
        <ChevronDownIcon 
          className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 py-2">
          
          {/* Categories */}
          {!showSubcategories && (
            <div className="max-h-96 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categorías
              </div>
              
              <div className="grid grid-cols-2 gap-1 px-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.iconPath} />
                    </svg>
                    <span className="truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subcategories */}
          {showSubcategories && availableSubcategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedCategoryData?.name} - Subcategorías
                </span>
                <button
                  onClick={() => setShowSubcategories(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ← Volver
                </button>
              </div>
              
              <div className="px-2 py-2 space-y-1">
                {availableSubcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategorySelect(subcategory.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors text-left ${
                      selectedSubcategory === subcategory.id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Selection */}
          {selectedCategory && selectedCategory !== 'all' && (
            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2 px-2">
              <button
                onClick={() => {
                  handleCategorySelect('all')
                  onSubcategoryChange('')
                }}
                className="w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
              >
                🔄 Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close on outside click */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsOpen(false)
            setShowSubcategories(false)
          }}
        />
      )}
    </div>
  )
} 