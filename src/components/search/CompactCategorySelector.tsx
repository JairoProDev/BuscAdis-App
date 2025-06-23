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
    { id: 'all', name: 'Todas las categorías', icon: '🔍', color: 'bg-gray-100' },
    { id: 'empleos', name: 'Empleos', icon: '💼', color: 'bg-blue-100' },
    { id: 'inmuebles', name: 'Inmuebles', icon: '🏠', color: 'bg-green-100' },
    { id: 'vehiculos', name: 'Vehículos', icon: '🚗', color: 'bg-orange-100' },
    { id: 'servicios', name: 'Servicios', icon: '⚙️', color: 'bg-purple-100' },
    { id: 'productos', name: 'Productos', icon: '📦', color: 'bg-pink-100' },
    { id: 'eventos', name: 'Eventos', icon: '🎪', color: 'bg-yellow-100' },
    { id: 'negocios', name: 'Negocios', icon: '💼', color: 'bg-indigo-100' },
    { id: 'comunidad', name: 'Comunidad', icon: '👥', color: 'bg-red-100' }
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
        <span className="text-sm">{selectedCategoryData?.icon || '🔍'}</span>
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
                    <span className="text-base">{category.icon}</span>
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