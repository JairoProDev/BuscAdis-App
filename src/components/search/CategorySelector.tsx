'use client'

import React, { useCallback, useEffect, useMemo, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Importar las utilidades de categorías
import { 
  getCategories, 
  getSubcategoryIcon,
  getSubSubcategoryEmoji
} from './CategorySelector/utils'

// Tipos
import { Category, Subcategory, SubSubcategory } from './CategorySelector/types'
import { getSubcategories } from '@/data/categories-data'

interface CategorySelectorProps {
  activeCategory?: string
  activeSubcategory?: string
  activeSubSubcategory?: string
  onCategoryChange?: (category: string) => void
  onSubcategoryChange?: (subcategory: string) => void
  onSubSubcategoryChange?: (subsubcategory: string) => void
  showCounts?: boolean
  variant?: 'horizontal' | 'vertical' | 'grid' | 'tabs'
  showAllOption?: boolean
  maxVisible?: number
  className?: string
  showSubcategories?: boolean
}

export default function CategorySelector({
  activeCategory,
  activeSubcategory,
  activeSubSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onSubSubcategoryChange,
  showCounts = true,
  variant = 'horizontal',
  showAllOption = true,
  maxVisible = 8,
  className = '',
  showSubcategories = true
}: CategorySelectorProps) {
  // No necesitamos el router ya que usamos history.pushState
  
  const [expanded, setExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<SubSubcategory | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<{type: string, id: string, name: string}[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Encontrar la categoría seleccionada
  useEffect(() => {
    if (activeCategory && categories.length > 0) {
      const category = categories.find(c => c.slug === activeCategory || c.id === activeCategory)
      setSelectedCategory(category || null)
      
      // Configurar breadcrumbs
      const crumbs = []
      if (category) {
        crumbs.push({ type: 'category', id: category.id, name: category.name })
        
        if (activeSubcategory && category.subcategories) {
          const subcategory = category.subcategories.find(s => s.slug === activeSubcategory || s.id === activeSubcategory)
          setSelectedSubcategory(subcategory || null)
          
          if (subcategory) {
            crumbs.push({ type: 'subcategory', id: subcategory.id, name: subcategory.name })
            
            if (activeSubSubcategory && subcategory.subSubcategories) {
              const subsubcategory = subcategory.subSubcategories.find(s => s.slug === activeSubSubcategory || s.id === activeSubSubcategory)
              setSelectedSubSubcategory(subsubcategory || null)
              
              if (subsubcategory) {
                crumbs.push({ type: 'subsubcategory', id: subsubcategory.id, name: subsubcategory.name })
              }
            } else {
              setSelectedSubSubcategory(null)
            }
          }
        } else {
          setSelectedSubcategory(null)
          setSelectedSubSubcategory(null)
        }
      } else {
        setSelectedCategory(null)
        setSelectedSubcategory(null)
        setSelectedSubSubcategory(null)
      }
      
      setBreadcrumbs(crumbs)
    } else {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
      setSelectedSubSubcategory(null)
      setBreadcrumbs([])
    }
  }, [activeCategory, activeSubcategory, activeSubSubcategory, categories])
  
  // Fetch categories on load
  useEffect(() => {
    try {
      setLoading(true)
      // Usar getCategories desde la utilidad
      const data = getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch subcategories when activeCategory changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!activeCategory) {
        setSubcategories([])
        return
      }

      try {
        // Obtener subcategorías de la función de utilidad
        const subcats = getSubcategories(activeCategory);
        
        // Convertir al formato que espera el componente
        const formattedSubcats = subcats.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.id,
          count: Math.floor(Math.random() * 500) + 100, // Simulación de conteos
          icon: getSubcategoryIcon(sub.id),
          parentId: activeCategory,
          subSubcategories: sub.subSubcategories?.map(subsub => ({
            id: subsub.id,
            name: subsub.name,
            slug: subsub.id,
            count: Math.floor(Math.random() * 100) + 1,
            emoji: getSubSubcategoryEmoji(subsub.id),
            parentId: sub.id
          })) || []
        }));
        
        setSubcategories(formattedSubcats)
      } catch (error) {
        console.error('Error fetching subcategories:', error)
        setSubcategories([])
      }
    }

    if (showSubcategories) {
      fetchSubcategories()
    }
  }, [activeCategory, showSubcategories])
  
  // Event handlers
  const handleCategoryClick = (categorySlug: string) => {
    if (onCategoryChange) {
      onCategoryChange(categorySlug)
    }
    
    // Navigate directly to category page with clean URL
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${categorySlug}`)
    }
  }

  const handleSubcategoryClick = (parentCategory: string, subcategorySlug: string) => {
    if (onSubcategoryChange) {
      onSubcategoryChange(subcategorySlug)
    }
    
    // Navigate directly to subcategory page with clean URL
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${parentCategory}/${subcategorySlug}`)
    }
  }
  
  // Manejar la selección de sub-subcategoría
  const handleSubSubcategorySelect = (subsubcategory: SubSubcategory) => {
    setSelectedSubSubcategory(subsubcategory)
    
    if (onSubSubcategoryChange) {
      onSubSubcategoryChange(subsubcategory.id)
    }
    
    // Update breadcrumbs with the selected subsubcategory
    if (selectedCategory && selectedSubcategory) {
      setBreadcrumbs([
        { type: 'category', id: selectedCategory.id, name: selectedCategory.name },
        { type: 'subcategory', id: selectedSubcategory.id, name: selectedSubcategory.name },
        { type: 'subsubcategory', id: subsubcategory.id, name: subsubcategory.name }
      ])
      
      // Navigate directly to subsubcategory page with clean URL
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/${selectedCategory.slug}/${selectedSubcategory.slug}/${subsubcategory.slug}`)
      }
    }
  }
  
  // Modificar la función que renderiza los enlaces de categoría para que sean más limpios y pulidos
  const renderHorizontalSelector = useCallback(() => {
    if (categories.length === 0) {
      return <div className="flex items-center justify-center"><LoadingSpinner /></div>
    }

    const visibleCategories = expanded 
      ? categories 
      : categories.slice(0, maxVisible)

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {/* Breadcrumbs en formato horizontal */}
          {breadcrumbs.length > 0 && renderBreadcrumbs()}
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center min-w-max gap-1 mt-1">
            {/* Opción "Todos" */}
            {showAllOption && (
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedSubcategory(null)
                  setSelectedSubSubcategory(null)
                  setBreadcrumbs([])
                  
                  if (onCategoryChange) onCategoryChange('')
                  if (onSubcategoryChange) onSubcategoryChange('')
                  if (onSubSubcategoryChange) onSubSubcategoryChange('')
                }}
                className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm transition-colors ${
                  !activeCategory 
                    ? 'bg-teal-600/70 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-teal-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2">Todos</span>
                {showCounts && (
                  <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-slate-700/50 text-slate-300">
                    6605
                  </span>
                )}
              </button>
            )}
            
            {/* Lista de categorías */}
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm transition-colors ${
                  activeCategory === category.slug 
                    ? 'bg-teal-600/70 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-teal-500">
                  {category.icon && (
                    <Image 
                      src={category.icon} 
                      alt={category.name} 
                      width={24} 
                      height={24} 
                      className="w-5 h-5"
                    />
                  )}
                </span>
                <span className="ml-2">{category.name}</span>
                {showCounts && category.count && (
                  <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-slate-700/50 text-slate-300">
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Subcategorías para la categoría seleccionada */}
        {selectedCategory && showSubcategories && (
          <div className="mt-3">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto scrollbar-hide"
              >
                <div className="flex items-center min-w-max gap-1">
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategoryClick(selectedCategory.slug, subcategory.slug)}
                      className={`flex items-center py-1.5 px-3 rounded-lg text-sm transition-colors ${
                        activeSubcategory === subcategory.slug 
                          ? 'bg-blue-600/70 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      {subcategory.icon && (
                        <span className="text-blue-400 mr-2 text-lg">
                          {subcategory.icon}
                        </span>
                      )}
                      <span>{subcategory.name}</span>
                      {showCounts && subcategory.count && (
                        <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-slate-700/50 text-slate-300">
                          {subcategory.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        
        {/* Sub-subcategorías para la subcategoría seleccionada */}
        {selectedSubcategory && showSubcategories && (
          <div className="mt-2">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto scrollbar-hide"
              >
                <div className="flex items-center min-w-max gap-1">
                  {selectedSubcategory.subSubcategories?.map((subsubcategory) => (
                    <button
                      key={subsubcategory.id}
                      onClick={() => handleSubSubcategorySelect(subsubcategory)}
                      className={`flex items-center py-1 px-3 rounded-lg text-sm transition-colors ${
                        activeSubSubcategory === subsubcategory.slug
                          ? 'bg-purple-600/70 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      {subsubcategory.emoji && (
                        <span className="mr-2">{subsubcategory.emoji}</span>
                      )}
                      <span>{subsubcategory.name}</span>
                      {showCounts && subsubcategory.count && (
                        <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-slate-700/50 text-slate-300">
                          {subsubcategory.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    )
  }, [categories, subcategories, activeCategory, activeSubcategory, activeSubSubcategory, expanded, maxVisible, breadcrumbs, showCounts, showAllOption, showSubcategories])
  
  // Modificar la función que renderiza las migas de pan
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null
    
    return (
      <div className="flex items-center text-sm">
        <Link href="/buscar" className="text-teal-500 hover:text-teal-400">
          Buscar
        </Link>
        
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            <ChevronRightIcon className="w-4 h-4 mx-1 text-slate-500" />
            
            {index === breadcrumbs.length - 1 ? (
              <span className="text-white font-medium">{crumb.name}</span>
            ) : (
              <Link
                href={`/${breadcrumbs.slice(0, index + 1).map(c => c.id).join('/')}`}
                className="text-teal-500 hover:text-teal-400"
              >
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }
  
  // Seleccionar la variante apropiada
  const renderSelector = () => {
    switch(variant) {
      case 'horizontal':
        return renderHorizontalSelector()
      case 'grid':
        // Pendiente para implementar
        return renderHorizontalSelector()
      case 'vertical':
        // Pendiente para implementar
        return renderHorizontalSelector()
      case 'tabs':
        // Pendiente para implementar
        return renderHorizontalSelector()
      default:
        return renderHorizontalSelector()
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 py-2">{error}</div>
  }
  
  return (
    <div className={`w-full ${className}`}>
      {renderSelector()}
    </div>
  )
} 