'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'

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
  variant?: 'horizontal' | 'vertical' | 'grid' | 'tabs' | 'menu'
  showAllOption?: boolean
  maxVisible?: number
  className?: string
  showSubcategories?: boolean
  showBreadcrumbs?: boolean
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
  showSubcategories = true,
  showBreadcrumbs = true
}: CategorySelectorProps) {
  // No necesitamos el router ya que usamos history.pushState
  
  // State for showing more categories
  const [expanded, setExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  // We need to track this state even if not directly used in render - it's updated in effects
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      case 'menu':
        return renderMenuSelector()
      default:
        return renderHorizontalSelector()
    }
  }
  
  // Renderizar selector horizontal con imágenes
  const renderHorizontalSelector = () => {
    const renderCategories = () => {
      const visibleCount = expanded ? categories.length : Math.min(maxVisible, categories.length);
      const visibleCategories = categories.slice(0, visibleCount);
      
      return (
        <div className="w-full overflow-x-auto pb-2">
          <div className="inline-flex space-x-2 px-1">
            {/* Opción "Todas las categorías" */}
            {showAllOption && (
              <button
                onClick={() => {
                  if (onCategoryChange) onCategoryChange('')
                  // Navegar a la página de búsqueda
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/buscar')
                  }
                }}
                className={`flex flex-col items-center min-w-[80px] max-w-[80px] py-2 px-1 rounded-lg transition-all ${
                  !activeCategory
                    ? 'bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center bg-slate-700 rounded-lg">
                  <HomeIcon className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-xs font-medium whitespace-nowrap text-center text-white">Todos</span>
              </button>
            )}
            
            {/* Categorías */}
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`flex flex-col items-center min-w-[80px] max-w-[80px] py-2 px-1 rounded-lg transition-all ${
                  activeCategory === category.slug
                    ? 'bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <div className="w-10 h-10 mb-1 rounded-lg overflow-hidden relative">
                  <Image
                    src={`/images/categories/${category.slug}.jpg`}
                    alt={category.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    onError={(e) => {
                      // Fallback a la imagen predeterminada
                      (e.target as HTMLImageElement).src = '/images/categories/default.jpg';
                    }}
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap text-center text-white">
                  {category.name}
                </span>
                {showCounts && category.count && (
                  <span className="text-[10px] text-slate-400">
                    {category.count.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
            
            {/* Botón "Ver más" si hay más categorías */}
            {categories.length > maxVisible && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex flex-col items-center min-w-[80px] max-w-[80px] py-2 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                <div className="w-10 h-10 mb-1 flex items-center justify-center bg-slate-700 rounded-lg">
                  <ChevronRightIcon className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-xs font-medium whitespace-nowrap text-white">Ver más</span>
              </button>
            )}
          </div>
        </div>
      );
    };
    
    // Renderizar subcategorías si hay una categoría seleccionada
    const renderSubcategories = () => {
      if (!activeCategory || !showSubcategories || subcategories.length === 0) {
        return null;
      }

      return (
        <div className="mt-2">
          <div className="flex items-center mb-1">
            <h3 className="text-xs font-medium text-slate-400">Subcategorías</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="inline-flex gap-2 py-1 flex-nowrap">
              {subcategories.map((subcategory) => {
                const Icon = subcategory.icon;
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(activeCategory, subcategory.slug)}
                    className={`flex items-center space-x-2 rounded-md py-1 px-2 text-sm transition-colors whitespace-nowrap ${
                      activeSubcategory === subcategory.slug
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded p-1 ${
                      activeSubcategory === subcategory.slug 
                        ? 'bg-teal-400/20 text-white' 
                        : 'bg-slate-700 text-teal-400'
                    }`}>
                      {Icon && <Icon className="w-full h-full" />}
                    </div>
                    <span>{subcategory.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    };
    
    // Renderizar sub-subcategorías si hay una subcategoría seleccionada
    const renderSubSubcategories = () => {
      if (!activeCategory || !activeSubcategory || !showSubcategories) {
        return null;
      }
      
      const selectedSubcat = subcategories.find(sub => sub.slug === activeSubcategory)
      
      if (!selectedSubcat || !selectedSubcat.subSubcategories || selectedSubcat.subSubcategories.length === 0) {
        return null
      }

      return (
        <div className="mt-2">
          <div className="flex items-center mb-1">
            <h3 className="text-xs font-medium text-slate-400">Especialidades</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="inline-flex gap-2 py-1 flex-nowrap">
              {selectedSubcat.subSubcategories.map((subsubcategory) => (
                <button
                  key={subsubcategory.id}
                  onClick={() => handleSubSubcategorySelect(subsubcategory)}
                  className={`inline-flex items-center py-1 px-2 text-xs rounded transition-colors whitespace-nowrap ${
                    activeSubSubcategory === subsubcategory.slug
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-1.5">{subsubcategory.emoji}</span>
                  <span>{subsubcategory.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="w-full">
        {showBreadcrumbs && renderBreadcrumbs()}
        <div className="space-y-1">
          {renderCategories()}
          {renderSubcategories()}
          {renderSubSubcategories()}
        </div>
      </div>
    );
  };
  
  // Renderizar como menú
  const renderMenuSelector = () => {
    if (categories.length === 0) {
      return <div className="flex items-center justify-center"><LoadingSpinner /></div>
    }

    return (
      <div className="space-y-1">
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                activeCategory === category.id
                  ? 'bg-teal-500 text-white font-medium'
                  : 'hover:bg-slate-700/50 text-slate-200'
              }`}
            >
              <div className="flex items-center">
                {category.icon ? (
                  <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                    <Image
                      src={`/images/categories/${category.icon}`}
                      alt={category.name}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="mr-2">📦</span>
                )}
                <span>{category.name}</span>
              </div>
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
            
            {activeCategory === category.id && category.subcategories && (
              <div className="pl-4 mt-1 space-y-1">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id}>
                    <button
                      onClick={() => handleSubcategoryClick(subcategory.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                        activeSubcategory === subcategory.id
                          ? 'bg-teal-500/80 text-white font-medium'
                          : 'hover:bg-slate-700/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center">
                        {subcategory.icon ? (
                          <div className="w-4 h-4 mr-2 relative flex-shrink-0">
                            <Image
                              src={`/images/categories/${subcategory.icon}`}
                              alt={subcategory.name}
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <span className="mr-2">📋</span>
                        )}
                        <span>{subcategory.name}</span>
                      </div>
                      {subcategory.subsubcategories && 
                       subcategory.subsubcategories.length > 0 && (
                        <ChevronRightIcon className="w-3 h-3" />
                      )}
                    </button>
                    
                    {activeSubcategory === subcategory.id && 
                     subcategory.subsubcategories && (
                      <div className="pl-4 mt-1 space-y-1">
                        {subcategory.subsubcategories.map((subsubcategory) => (
                          <button
                            key={subsubcategory.id}
                            onClick={() => 
                              handleSubSubcategorySelect(subsubcategory)
                            }
                            className={`w-full text-left px-3 py-1 rounded-lg flex items-center ${
                              activeSubSubcategory === subsubcategory.id
                                ? 'bg-teal-500/60 text-white'
                                : 'hover:bg-slate-700/30 text-slate-400'
                            }`}
                          >
                            <span className="mr-2">
                              {subsubcategory.emoji || '🏷️'}
                            </span>
                            <span className="text-sm">{subsubcategory.name}</span>
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
    )
  }
  
  if (loading) {
    return (
      <div className={`${className} ${variant === 'horizontal' ? 'space-y-2' : 'flex space-x-4'}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
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