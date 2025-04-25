'use client'

import { useState, useEffect } from 'react'
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
  
  // Renderizar selector horizontal
  const renderHorizontalSelector = () => {
    return (
      <div className="relative w-full">
        <div className="flex overflow-x-auto hide-scrollbar py-2 px-1 -mx-1">
          {showAllOption && (
            <Link 
              href="/buscar"
              onClick={(e) => {
                e.preventDefault();
                if (onCategoryChange) onCategoryChange('');
              }}
              className={`flex flex-col items-center justify-center min-w-[90px] p-2 rounded-lg mr-2 transition-all ${
                !activeCategory 
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-sm border border-slate-700'
              }`}
            >
              <span className="text-2xl mb-1">🔍</span>
              <span className="text-xs font-medium">Todos</span>
              {showCounts && (
                <span className="text-xs opacity-70 mt-1">
                  {categories.reduce((acc, cat) => acc + (cat.count || 0), 0)}
                </span>
              )}
            </Link>
          )}
          
          {categories.slice(0, expanded ? categories.length : maxVisible).map((category) => (
            <Link
              key={category.id}
              href={`/buscar/${category.slug}`}
              onClick={(e) => {
                e.preventDefault()
                handleCategoryClick(category.slug)
              }}
              className={`flex flex-col items-center justify-center min-w-[90px] p-2 rounded-lg mr-2 transition-all ${
                activeCategory === category.id || activeCategory === category.slug
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-sm border border-slate-700'
              }`}
            >
              {category.image && (
                <div className="w-10 h-10 mb-1 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                  <Image 
                    src={category.image}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
              {showCounts && category.count && (
                <span className="text-xs opacity-70 mt-1">{category.count}</span>
              )}
            </Link>
          ))}
          
          {categories.length > maxVisible && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex flex-col items-center justify-center min-w-[90px] p-2 rounded-lg mr-2 bg-slate-800 hover:bg-slate-700 text-white hover:shadow-sm border border-slate-700 transition-all"
            >
              <span className="text-2xl mb-1">
                {expanded ? '↑' : '↓'}
              </span>
              <span className="text-xs font-medium">
                {expanded ? 'Menos' : 'Más'}
              </span>
            </button>
          )}
        </div>
        
        {/* Sub-navegación si hay una categoría seleccionada */}
        <AnimatePresence mode="wait">
          {subcategories.length > 0 && (
            <motion.div
              key="subcategories"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex overflow-x-auto hide-scrollbar py-1 px-1 -mx-1"
            >
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
                    className={`flex items-center px-3 py-1.5 rounded-full mr-2 text-sm whitespace-nowrap transition-all ${
                      activeSubcategory === subcategory.id || activeSubcategory === subcategory.slug
                        ? 'bg-teal-500 text-white shadow-sm' 
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {subcategory.icon && (
                      <IconComponent className="w-4 h-4 mr-1" />
                    )}
                    <span>{subcategory.name}</span>
                    {showCounts && subcategory.count && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-black/20 rounded-full text-xs">
                        {subcategory.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </motion.div>
          )}
          
          {/* Sub-sub-navegación si hay una subcategoría seleccionada */}
          {selectedSubcategory?.subSubcategories && selectedSubcategory.subSubcategories.length > 0 && (
            <motion.div
              key="subsubcategories"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex overflow-x-auto hide-scrollbar py-1 px-1 -mx-1"
            >
              {selectedSubcategory.subSubcategories.map((subsubcategory) => (
                <Link
                  key={subsubcategory.id}
                  href={`/buscar/${selectedCategory?.slug}/${selectedSubcategory.slug}/${subsubcategory.slug}`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleSubSubcategorySelect(subsubcategory)
                  }}
                  className={`flex items-center px-3 py-1 rounded-full mr-2 text-xs whitespace-nowrap transition-all ${
                    activeSubSubcategory === subsubcategory.id || 
                    activeSubSubcategory === subsubcategory.slug || 
                    selectedSubSubcategory?.id === subsubcategory.id
                      ? 'bg-cyan-500 text-white shadow-sm' 
                      : 'bg-slate-700/70 hover:bg-slate-600 text-white'
                  }`}
                >
                  {subsubcategory.emoji && (
                    <span className="mr-1">{subsubcategory.emoji}</span>
                  )}
                  <span>{subsubcategory.name}</span>
                  {showCounts && subsubcategory.count && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-black/20 rounded-full text-xs">
                      {subsubcategory.count}
                    </span>
                  )}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  
  // Renderizar selector de cuadrícula
  const renderGridSelector = () => {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {showAllOption && (
            <Link 
              href="/buscar"
              onClick={(e) => {
                e.preventDefault();
                if (onCategoryChange) onCategoryChange('');
              }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all overflow-hidden group ${
                !activeCategory 
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-md border border-slate-700'
              }`}
            >
              <div className="z-10">
                <span className="text-3xl mb-2 inline-block">🔍</span>
                <h3 className="font-medium text-center">Todos</h3>
                {showCounts && (
                  <p className="text-sm opacity-70 text-center mt-1">
                    {categories.reduce((acc, cat) => acc + (cat.count || 0), 0)} anuncios
                  </p>
                )}
              </div>
              
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/80" />
              </div>
            </Link>
          )}
          
          {categories.slice(0, expanded ? categories.length : maxVisible).map((category) => (
            <Link
              key={category.id}
              href={`/buscar/${category.slug}`}
              onClick={(e) => {
                e.preventDefault()
                handleCategoryClick(category.slug)
              }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all overflow-hidden group ${
                activeCategory === category.id || activeCategory === category.slug
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-md border border-slate-700'
              }`}
            >
              <div className="z-10">
                {category.image && (
                  <div className="w-16 h-16 mb-2 rounded-full overflow-hidden bg-white/10 flex items-center justify-center mx-auto">
                    <Image 
                      src={category.image}
                      alt={category.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-medium text-center">{category.name}</h3>
                {showCounts && category.count && (
                  <p className="text-sm opacity-70 text-center mt-1">
                    {category.count} anuncios
                  </p>
                )}
              </div>
              
              {category.image && (
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Image 
                    src={category.image} 
                    alt={category.name} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/80" />
                </div>
              )}
            </Link>
          ))}
          
          {categories.length > maxVisible && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="relative flex flex-col items-center justify-center p-4 rounded-xl transition-all overflow-hidden group bg-slate-800 hover:bg-slate-700 text-white hover:shadow-md border border-slate-700"
            >
              <span className="text-3xl mb-2">⋯</span>
              <h3 className="font-medium">Ver más</h3>
              <p className="text-sm opacity-70 mt-1">
                +{categories.length - maxVisible} categorías
              </p>
            </button>
          )}
        </div>
        
        {/* Sub-navegación para categoría seleccionada */}
        <AnimatePresence>
          {subcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 pt-6 border-t border-slate-700"
            >
              <h3 className="font-medium text-lg mb-3 text-white">
                Subcategorías de {selectedCategory?.name}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      className={`flex items-center p-3 rounded-lg transition-all ${
                        activeSubcategory === subcategory.id || activeSubcategory === subcategory.slug
                          ? 'bg-teal-500 text-white shadow-sm' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <div className="flex items-center">
                        {IconComponent && (
                          <IconComponent className="h-5 w-5 mr-3" />
                        )}
                        <div>
                          <span className="font-medium">{subcategory.name}</span>
                          {showCounts && subcategory.count && (
                            <p className="text-xs opacity-70">
                              {subcategory.count} anuncios
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
  
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
        return renderHorizontalSelector()
      case 'grid':
        return renderGridSelector()
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
      {renderBreadcrumbs()}
      {renderSelector()}
    </div>
  )
} 