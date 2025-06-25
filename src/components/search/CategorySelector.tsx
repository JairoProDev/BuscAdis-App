'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, Squares2X2Icon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { useRouter, usePathname } from 'next/navigation'
import { 
  categoriesList, 
  getCategoryById, 
  getSubcategories, 
  getSubSubcategories,
  generateCategoryUrl,
  parseCategoryUrl,
  type Category,
  type Subcategory,
  type SubSubcategory
} from '@/lib/categories'

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
  enableRouting?: boolean; // Nueva prop para habilitar routing automático
}

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
  className = '',
  enableRouting = true
}: CategorySelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string>('')
  const [expandedSubcategory, setExpandedSubcategory] = useState<string>('')

  // Si enableRouting está activado, parsear la URL actual
  useEffect(() => {
    if (enableRouting && pathname && pathname !== '/buscar') {
      const parsed = parseCategoryUrl(pathname)
      if (parsed.categoryId && parsed.categoryId !== activeCategory) {
        onCategoryChange?.(parsed.categoryId)
        setExpandedCategory(parsed.categoryId)
      }
      if (parsed.subcategoryId && parsed.subcategoryId !== activeSubcategory) {
        onSubcategoryChange?.(parsed.subcategoryId)
        setExpandedSubcategory(parsed.subcategoryId)
      }
      if (parsed.subSubcategoryId && parsed.subSubcategoryId !== activeSubSubcategory) {
        onSubSubcategoryChange?.(parsed.subSubcategoryId)
      }
    }
  }, [pathname, enableRouting, activeCategory, activeSubcategory, activeSubSubcategory, onCategoryChange, onSubcategoryChange, onSubSubcategoryChange])

  const currentCategory = getCategoryById(activeCategory)
  const currentSubcategories = activeCategory ? getSubcategories(activeCategory) : []
  const currentSubcategory = currentSubcategories.find(sub => sub.id === activeSubcategory)
  const currentSubSubcategories = (activeCategory && activeSubcategory) ? getSubSubcategories(activeCategory, activeSubcategory) : []

  const handleCategorySelect = (categoryId: string) => {
    // Reset subcategoría y subsubcategoría al cambiar categoría
    onSubcategoryChange?.('')
    onSubSubcategoryChange?.('')
    onCategoryChange?.(categoryId)
    
    if (enableRouting) {
      const url = categoryId ? generateCategoryUrl(categoryId) : '/buscar'
      router.push(url)
    }
    
    setExpandedCategory(categoryId)
    setExpandedSubcategory('')
    
    if (variant === 'dropdown') {
      setIsOpen(false)
    }
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    // Reset subsubcategoría al cambiar subcategoría
    onSubSubcategoryChange?.('')
    onSubcategoryChange?.(subcategoryId)
    
    if (enableRouting && activeCategory) {
      const url = subcategoryId ? generateCategoryUrl(activeCategory, subcategoryId) : generateCategoryUrl(activeCategory)
      router.push(url)
    }
    
    setExpandedSubcategory(subcategoryId)
    
    if (variant === 'dropdown') {
      setIsOpen(false)
    }
  }

  const handleSubSubcategorySelect = (subSubcategoryId: string) => {
    onSubSubcategoryChange?.(subSubcategoryId)
    
    if (enableRouting && activeCategory && activeSubcategory) {
      const url = subSubcategoryId 
        ? generateCategoryUrl(activeCategory, activeSubcategory, subSubcategoryId)
        : generateCategoryUrl(activeCategory, activeSubcategory)
      router.push(url)
    }
    
    if (variant === 'dropdown') {
      setIsOpen(false)
    }
  }

  const getDisplayText = () => {
    if (activeSubSubcategory && currentSubcategory) {
      const subSub = currentSubSubcategories.find(s => s.id === activeSubSubcategory)
      return `${getCategoryIcon(activeCategory)} ${subSub?.name}`
    }
    if (activeSubcategory && currentSubcategory) {
      return `${getCategoryIcon(activeCategory)} ${currentSubcategory.name}`
    }
    if (activeCategory && currentCategory) {
      return `${getCategoryIcon(activeCategory)} ${currentCategory.name}`
    }
    return `${showIcon ? '🔍 ' : ''}Todas las categorías`
  }

  const getCategoryIcon = (categoryId: string): string => {
    const iconMap: Record<string, string> = {
      empleos: '💼',
      inmuebles: '🏠',
      vehiculos: '🚗',
      servicios: '🔧',
      productos: '🛍️',
      eventos: '📅',
      comunidad: '👥',
      negocios: '📊'
    }
    return iconMap[categoryId] || '🏷️'
  }

  const getBreadcrumb = () => {
    const parts = []
    if (currentCategory) parts.push(currentCategory.name)
    if (currentSubcategory) parts.push(currentSubcategory.name)
    if (activeSubSubcategory) {
      const subSub = currentSubSubcategories.find(s => s.id === activeSubSubcategory)
      if (subSub) parts.push(subSub.name)
    }
    return parts.join(' > ')
  }

  if (variant === 'inline') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Breadcrumb */}
        {(activeCategory || activeSubcategory || activeSubSubcategory) && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span>🔍 </span>
            {getBreadcrumb()}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleCategorySelect('')}
            className={`p-3 rounded-lg border transition-all text-left ${
              !activeCategory 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-lg mb-1">🔍</div>
            <div className="text-sm font-medium">Todas</div>
          </button>
          
          {categoriesList.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`p-3 rounded-lg border transition-all text-left ${
                activeCategory === category.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-lg mb-1">{getCategoryIcon(category.id)}</div>
              <div className="text-sm font-medium">{category.name}</div>
            </button>
          ))}
        </div>

        {/* Subcategories */}
        {activeCategory && currentSubcategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subcategorías:</h4>
            <div className="flex flex-wrap gap-2">
              {currentSubcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategorySelect(subcategory.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeSubcategory === subcategory.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-subcategories */}
        {activeCategory && activeSubcategory && currentSubSubcategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipos:</h4>
            <div className="flex flex-wrap gap-2">
              {currentSubSubcategories.map((subSubcategory) => (
                <button
                  key={subSubcategory.id}
                  onClick={() => handleSubSubcategorySelect(subSubcategory.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    activeSubSubcategory === subSubcategory.id
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {subSubcategory.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-sm min-w-[200px]"
        >
          <span className="truncate flex-1 text-left">{getDisplayText()}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto"
            >
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
              {categoriesList.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => {
                      if (activeCategory === category.id) {
                        setExpandedCategory(expandedCategory === category.id ? '' : category.id)
                      } else {
                        handleCategorySelect(category.id)
                        setExpandedCategory(category.id)
                      }
                    }}
                    className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                      activeCategory === category.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                    }`}
                  >
                    <span className="text-lg">{getCategoryIcon(category.id)}</span>
                    <div className="flex-1">
                      <span className="font-medium">{category.name}</span>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({category.subcategories.length} subcategorías)
                        </span>
                      )}
                    </div>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ChevronDownIcon 
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          expandedCategory === category.id ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>

                  {/* Subcategories */}
                  {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700/50">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id}>
                          <button
                            onClick={() => {
                              if (activeSubcategory === subcategory.id) {
                                setExpandedSubcategory(expandedSubcategory === subcategory.id ? '' : subcategory.id)
                              } else {
                                handleSubcategorySelect(subcategory.id)
                                setExpandedSubcategory(subcategory.id)
                              }
                            }}
                            className={`w-full text-left p-3 pl-12 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 ${
                              activeSubcategory === subcategory.id ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-600' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <span className="text-sm font-medium">{subcategory.name}</span>
                              {subcategory.subSubcategories && subcategory.subSubcategories.length > 0 && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({subcategory.subSubcategories.length} tipos)
                                </span>
                              )}
                            </div>
                            {subcategory.subSubcategories && subcategory.subSubcategories.length > 0 && (
                              <ChevronDownIcon 
                                className={`h-3 w-3 text-gray-400 transition-transform ${
                                  expandedSubcategory === subcategory.id ? 'rotate-180' : ''
                                }`} 
                              />
                            )}
                          </button>

                          {/* Sub-subcategories */}
                          {expandedSubcategory === subcategory.id && subcategory.subSubcategories && subcategory.subSubcategories.length > 0 && (
                            <div className="bg-gray-100 dark:bg-gray-600/50">
                              {subcategory.subSubcategories.map((subSubcategory) => (
                                <button
                                  key={subSubcategory.id}
                                  onClick={() => handleSubSubcategorySelect(subSubcategory.id)}
                                  className={`w-full text-left p-2 pl-20 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors text-sm ${
                                    activeSubSubcategory === subSubcategory.id ? 'bg-green-200 dark:bg-green-700/50 text-green-700 dark:text-green-300' : ''
                                  }`}
                                >
                                  {subSubcategory.name}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Para otros variants
  return (
    <div className={`text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {getDisplayText()}
    </div>
  )
} 