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
              
              if (subsubcategory) {
                crumbs.push({ type: 'subsubcategory', id: subsubcategory.id, name: subsubcategory.name })
              }
            }
          }
        } else {
          setSelectedSubcategory(null)
        }
      } else {
        setSelectedCategory(null)
        setSelectedSubcategory(null)
      }
      
      setBreadcrumbs(crumbs)
    } else {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
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
    if (onSubSubcategoryChange) {
      onSubSubcategoryChange(subsubcategory.id)
    }
    
    // Navigate directly to subsubcategory page with clean URL, exactamente igual que las otras funciones
    if (typeof window !== 'undefined' && selectedCategory && selectedSubcategory) {
      window.history.pushState({}, '', `/${selectedCategory.slug}/${selectedSubcategory.slug}/${subsubcategory.slug}`)
      // Actualizar el estado de la subsubcategoría seleccionada
      setSelectedSubSubcategory(subsubcategory)
    }
  }
  
  // Containerizar las categorías
  const renderListSelector = () => {
    return (
      <div className="w-full relative">
        <motion.div 
          className="relative px-1 py-2 overflow-hidden rounded-xl backdrop-blur-md bg-slate-900/80 border border-slate-800/80 shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex overflow-x-auto hide-scrollbar py-1 -mx-1 relative z-10">
            {showAllOption && (
              <Link
                href="/buscar"
                onClick={(e) => {
                  e.preventDefault();
                  if (onCategoryChange) onCategoryChange('');
                }}
                className={`flex flex-col items-center justify-center px-4 py-2 min-w-[100px] rounded-xl transition-all hover:scale-105 ${
                  !activeCategory
                    ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-lg shadow-purple-500/20 border border-purple-500/30'
                    : 'bg-slate-800/90 hover:bg-slate-700/90 text-white backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm font-medium">Todos</span>
                {showCounts && (
                  <span className="text-xs opacity-80 font-mono mt-1">{categories.reduce((acc, cat) => acc + (cat.count || 0), 0)}</span>
                )}
              </Link>
            )}

            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/buscar/${category.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategoryClick(category.slug);
                  }}
                  className={`group flex flex-col items-center justify-center px-4 py-2 min-w-[100px] rounded-xl mr-1 transition-all duration-200 hover:scale-105 ${
                    activeCategory === category.id || activeCategory === category.slug
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-slate-800/90 hover:bg-slate-700/90 text-white backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50'
                  }`}
                >
                  {category.image ? (
                    <div className="h-8 w-8 mb-1 relative">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={32}
                        height={32}
                        className="object-contain drop-shadow-xl"
                      />
                    </div>
                  ) : IconComponent ? (
                    <IconComponent className="h-6 w-6 mb-1" />
                  ) : (
                    <div className="h-6 w-6 mb-1 bg-slate-700/50 rounded-lg"></div>
                  )}
                  <span className="text-sm font-medium">{category.name}</span>
                  {showCounts && category.count && (
                    <span className="text-xs opacity-80 font-mono mt-1">{category.count}</span>
                  )}
                </Link>
              );
            })}

            {expanded === false && categories.length > maxVisible && (
              <button
                onClick={() => setExpanded(true)}
                className="flex flex-col items-center justify-center min-w-[100px] px-4 py-2 rounded-xl transition-all hover:scale-105 bg-slate-800/90 hover:bg-slate-700/90 text-white backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-sm font-medium">Ver más</span>
                <span className="text-xs opacity-80 font-mono mt-1">+{categories.length - maxVisible}</span>
              </button>
            )}
          </div>
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/90 to-transparent z-20"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/90 to-transparent z-20"></div>
          </div>
        </motion.div>

        {/* Sub-navegación si hay una categoría seleccionada */}
        <AnimatePresence mode="wait">
          {subcategories.length > 0 && (
            <motion.div
              key="subcategories"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-4 pt-3 border-t border-slate-700/30"
            >
              <div className="relative px-1 py-2 overflow-hidden rounded-xl backdrop-blur-sm bg-slate-900/60 border border-slate-800/60 shadow-lg">
                <div className="flex overflow-x-auto hide-scrollbar py-2 px-1 -mx-1 gap-2 relative z-10">
                  {subcategories.map((subcategory) => {
                    const IconComponent = subcategory.icon;
                    return (
                      <Link
                        key={subcategory.id}
                        href={`/buscar/${activeCategory}/${subcategory.slug}`}
                        onClick={(e) => {
                          e.preventDefault()
                          handleSubcategoryClick(activeCategory || '', subcategory.slug)
                        }}
                        className={`flex items-center px-4 py-2 rounded-lg mr-1 text-sm whitespace-nowrap transition-all duration-200 ${
                          activeSubcategory === subcategory.id || activeSubcategory === subcategory.slug
                            ? 'bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow-md' 
                            : 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/40 hover:border-slate-600/40 hover:scale-105'
                        }`}
                      >
                        {subcategory.icon && (
                          <IconComponent className="w-4 h-4 mr-2" />
                        )}
                        <span>{subcategory.name}</span>
                        {showCounts && subcategory.count && (
                          <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-md text-xs font-mono">
                            {subcategory.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/90 to-transparent z-20"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/90 to-transparent z-20"></div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Sub-sub-navegación si hay una subcategoría seleccionada */}
          {selectedSubcategory?.subSubcategories && selectedSubcategory.subSubcategories.length > 0 && (
            <motion.div
              key="subsubcategories"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-3"
            >
              <div className="relative px-1 py-2 overflow-hidden rounded-xl backdrop-blur-sm bg-slate-900/40 border border-slate-800/40 shadow-lg">
                <div className="flex overflow-x-auto hide-scrollbar py-2 px-1 -mx-1 gap-2 relative z-10">
                  {selectedSubcategory.subSubcategories.map((subsubcategory) => (
                    <Link
                      key={subsubcategory.id}
                      href={`/buscar/${selectedCategory?.slug}/${selectedSubcategory.slug}/${subsubcategory.slug}`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleSubSubcategorySelect(subsubcategory)
                      }}
                      className={`flex items-center px-3 py-1.5 rounded-lg mr-1 text-xs whitespace-nowrap transition-all duration-200 ${
                        activeSubSubcategory === subsubcategory.id || 
                        activeSubSubcategory === subsubcategory.slug || 
                        selectedSubSubcategory?.id === subsubcategory.id
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-md' 
                          : 'bg-slate-800/60 hover:bg-slate-700/60 text-white border border-slate-700/40 hover:scale-105'
                      }`}
                    >
                      {subsubcategory.emoji && (
                        <span className="mr-2">{subsubcategory.emoji}</span>
                      )}
                      <span>{subsubcategory.name}</span>
                      {showCounts && subsubcategory.count && (
                        <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-md text-xs font-mono">
                          {subsubcategory.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/90 to-transparent z-20"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/90 to-transparent z-20"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  
  // Renderizar selector en cuadrícula
  const renderGridSelector = () => (
    <div className="w-full p-2 pb-8">
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Opción de "Todos" */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="col-span-full"
        >
          <Link
            href="/buscar"
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
              !selectedCategory ? 'bg-primary/15 text-primary ring-2 ring-primary' : 'bg-muted/90 hover:bg-primary/10 text-muted-foreground hover:text-primary'
            }`}
            onClick={() => {
              if (onCategoryChange) onCategoryChange('');
            }}
          >
            <span className="font-semibold">Todos</span>
          </Link>
        </motion.div>

        {/* Renderizar categorías */}
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href="#"
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                selectedCategory?.id === category.id ? 'bg-primary/15 text-primary ring-2 ring-primary' : 'bg-muted/90 hover:bg-primary/10 text-muted-foreground hover:text-primary'
              }`}
              onClick={() => handleCategoryClick(category.slug)}
            >
              {category.image && (
                <div className="p-2 rounded-full mb-2">
                  <Image src={category.image} alt={category.name} width={40} height={40} className="transition-transform" />
                </div>
              )}
              <span className="font-semibold text-center">{category.name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Subcategorías */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h3 className="font-semibold text-lg mb-3 px-2">Subcategorías de {selectedCategory.name}</h3>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {selectedCategory.subcategories?.map((subcategory, index) => (
                <motion.div
                  key={subcategory.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Link
                    href="#"
                    className={`flex items-center p-3 rounded-md transition-all ${
                      selectedSubcategory?.id === subcategory.id ? 'bg-primary/15 text-primary ring-1 ring-primary' : 'bg-muted/80 hover:bg-primary/10 text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => handleSubcategoryClick(selectedCategory.slug, subcategory.slug)}
                  >
                    <span className="text-sm font-medium">{subcategory.name}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-subcategorías */}
      <AnimatePresence>
        {selectedSubcategory && selectedSubcategory.subSubcategories && selectedSubcategory.subSubcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-semibold text-lg mb-3 px-2">Subcategorías de {selectedSubcategory.name}</h3>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {selectedSubcategory.subSubcategories.map((subsubcategory, index) => (
                <motion.div
                  key={subsubcategory.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Link
                    href="#"
                    className={`flex items-center p-3 rounded-md transition-all ${
                      selectedSubSubcategory?.id === subsubcategory.id ? 'bg-primary/15 text-primary ring-1 ring-primary' : 'bg-muted/80 hover:bg-primary/10 text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => handleSubSubcategorySelect(subsubcategory)}
                  >
                    <span className="text-sm font-medium">{subsubcategory.name}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  
  // Renderizar breadcrumbs de navegación
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null
    
    return (
      <div className="flex items-center flex-wrap text-sm py-2 mb-4">
        <Link href="/buscar" className="text-teal-400 hover:text-teal-300 transition-colors">
          Buscar
        </Link>
        
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 mx-2 text-slate-500" />
            
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-white">{crumb.name}</span>
            ) : (
              <Link
                href={`/buscar/${
                  crumb.type === 'category'
                    ? crumb.id
                    : `${breadcrumbs[0].id}/${crumb.id}`
                }`}
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </div>
    )
  }
  
  // Seleccionar la variante apropiada
  const renderSelector = () => {
    switch(variant) {
      case 'horizontal':
        return renderListSelector()
      case 'grid':
        return renderGridSelector()
      case 'vertical':
        // Pendiente para implementar
        return renderListSelector()
      case 'tabs':
        // Pendiente para implementar
        return renderListSelector()
      default:
        return renderListSelector()
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
      {renderBreadcrumbs()}
      {renderSelector()}
    </div>
  )
} 