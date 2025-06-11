'use client'

import { useState } from 'react'
import { useSearch } from '@/contexts/SearchContext'
import { categoriesList } from '@/data/categories-data'
import { CATEGORY_ICONS } from './utils'
import { ChevronDownIcon, FolderIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface SimpleCategorySelectorProps {
  className?: string
}

export default function SimpleSelector({ className = '' }: SimpleCategorySelectorProps) {
  const { searchState, updateSearch } = useSearch()
  const [isOpen, setIsOpen] = useState(false)

  const selectedCategory = categoriesList.find(cat => cat.id === searchState.category)
  const Icon = selectedCategory ? CATEGORY_ICONS[selectedCategory.id] || FolderIcon : FolderIcon

  const handleCategorySelect = (categoryId: string) => {
    updateSearch({ 
      category: categoryId,
      subcategory: '', // Reset subcategory when changing category
      subSubcategory: '' // Reset subsubcategory when changing category
    })
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-[200px]"
      >
        <Icon className="h-5 w-5 text-gray-500" />
        <span className="flex-1 text-left text-gray-700">
          {selectedCategory ? selectedCategory.name : 'Todas las categorías'}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            >
              {/* All categories option */}
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  !searchState.category ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <FolderIcon className="h-5 w-5" />
                <span className="font-medium">Todas las categorías</span>
              </button>

              {/* Category options */}
              {categoriesList.map((category) => {
                const CategoryIcon = CATEGORY_ICONS[category.id] || FolderIcon
                const isSelected = searchState.category === category.id

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                      isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <CategoryIcon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-gray-500">{category.description}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 