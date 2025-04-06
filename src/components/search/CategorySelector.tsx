'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

// Definición de tipos
interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  description?: string
  count?: number
  image?: string
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
  count?: number
  parent: string
  subsubcategories?: SubSubcategory[]
}

interface SubSubcategory {
  id: string
  name: string
  slug: string
  icon?: string
  count?: number
  parent: string
}

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
}

// Datos de ejemplo - Reemplazar con API real
const CATEGORIES: Category[] = [
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    slug: 'inmuebles',
    icon: '🏠',
    color: 'from-blue-500 to-cyan-500',
    description: 'Casas, departamentos, terrenos y más',
    count: 1542,
    image: '/images/categories/real-estate.jpg',
    subcategories: [
      {
        id: 'casas',
        name: 'Casas',
        slug: 'casas',
        icon: '🏡',
        count: 623,
        parent: 'inmuebles',
        subsubcategories: [
          { id: 'venta', name: 'En venta', slug: 'venta', count: 412, parent: 'casas' },
          { id: 'alquiler', name: 'En alquiler', slug: 'alquiler', count: 211, parent: 'casas' }
        ]
      },
      {
        id: 'departamentos',
        name: 'Departamentos',
        slug: 'departamentos',
        icon: '🏢',
        count: 458,
        parent: 'inmuebles',
        subsubcategories: [
          { id: 'venta', name: 'En venta', slug: 'venta', count: 280, parent: 'departamentos' },
          { id: 'alquiler', name: 'En alquiler', slug: 'alquiler', count: 178, parent: 'departamentos' }
        ]
      },
      {
        id: 'terrenos',
        name: 'Terrenos',
        slug: 'terrenos',
        icon: '🏞️',
        count: 187,
        parent: 'inmuebles'
      },
      {
        id: 'locales',
        name: 'Locales Comerciales',
        slug: 'locales',
        icon: '🏪',
        count: 145,
        parent: 'inmuebles'
      },
      {
        id: 'oficinas',
        name: 'Oficinas',
        slug: 'oficinas',
        icon: '🏢',
        count: 129,
        parent: 'inmuebles'
      }
    ]
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    slug: 'vehiculos',
    icon: '🚗',
    color: 'from-red-500 to-orange-500',
    description: 'Autos, motos, camionetas y más',
    count: 982,
    image: '/images/categories/vehicles.jpg',
    subcategories: [
      {
        id: 'autos',
        name: 'Automóviles',
        slug: 'autos',
        icon: '🚙',
        count: 567,
        parent: 'vehiculos'
      },
      {
        id: 'motos',
        name: 'Motos',
        slug: 'motos',
        icon: '🏍️',
        count: 234,
        parent: 'vehiculos'
      },
      {
        id: 'camionetas',
        name: 'Camionetas y 4x4',
        slug: 'camionetas',
        icon: '🚜',
        count: 181,
        parent: 'vehiculos'
      }
    ]
  },
  {
    id: 'empleos',
    name: 'Empleos',
    slug: 'empleos',
    icon: '💼',
    color: 'from-green-500 to-teal-500',
    description: 'Ofertas laborales en todas las áreas',
    count: 843,
    image: '/images/categories/jobs.jpg'
  },
  {
    id: 'servicios',
    name: 'Servicios',
    slug: 'servicios',
    icon: '🛠️',
    color: 'from-purple-500 to-indigo-500',
    description: 'Profesionales para todo lo que necesites',
    count: 672,
    image: '/images/categories/services.jpg'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    slug: 'tecnologia',
    icon: '📱',
    color: 'from-gray-600 to-gray-900',
    description: 'Celulares, computadoras y más',
    count: 531,
    image: '/images/categories/technology.jpg'
  },
  {
    id: 'hogar',
    name: 'Hogar',
    slug: 'hogar',
    icon: '🪑',
    color: 'from-amber-500 to-yellow-500',
    description: 'Muebles, electrodomésticos y decoración',
    count: 429,
    image: '/images/categories/home.jpg'
  },
  {
    id: 'mascotas',
    name: 'Mascotas',
    slug: 'mascotas',
    icon: '🐾',
    color: 'from-pink-500 to-rose-500',
    description: 'Animales, accesorios y servicios',
    count: 312,
    image: '/images/categories/pets.jpg'
  },
  {
    id: 'cursos',
    name: 'Cursos',
    slug: 'cursos',
    icon: '📚',
    color: 'from-blue-600 to-indigo-600',
    description: 'Capacitación y formación',
    count: 208,
    image: '/images/categories/courses.jpg'
  }
]

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
  className = ''
}: CategorySelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [expanded, setExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<{type: string, id: string, name: string}[]>([])
  
  // Encontrar la categoría seleccionada
  useEffect(() => {
    if (activeCategory) {
      const category = CATEGORIES.find(c => c.slug === activeCategory || c.id === activeCategory)
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
            
            if (activeSubSubcategory && subcategory.subsubcategories) {
              const subsubcategory = subcategory.subsubcategories.find(s => s.slug === activeSubSubcategory || s.id === activeSubSubcategory)
              
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
  }, [activeCategory, activeSubcategory, activeSubSubcategory])
  
  // Manejar la selección de categoría
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    
    if (onCategoryChange) {
      onCategoryChange(category.id)
    } else {
      // Navegar usando el router
      router.push(`/buscar/${category.slug}`)
    }
  }
  
  // Manejar la selección de subcategoría
  const handleSubcategorySelect = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory)
    
    if (onSubcategoryChange) {
      onSubcategoryChange(subcategory.id)
    } else if (selectedCategory) {
      // Navegar usando el router
      router.push(`/buscar/${selectedCategory.slug}/${subcategory.slug}`)
    }
  }
  
  // Manejar la selección de sub-subcategoría
  const handleSubSubcategorySelect = (subsubcategory: SubSubcategory) => {
    if (onSubSubcategoryChange) {
      onSubSubcategoryChange(subsubcategory.id)
    } else if (selectedCategory && selectedSubcategory) {
      // Navegar usando el router
      router.push(`/buscar/${selectedCategory.slug}/${selectedSubcategory.slug}/${subsubcategory.slug}`)
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
                  {CATEGORIES.reduce((acc, cat) => acc + (cat.count || 0), 0)}
                </span>
              )}
            </Link>
          )}
          
          {CATEGORIES.slice(0, expanded ? CATEGORIES.length : maxVisible).map((category) => (
            <Link
              key={category.id}
              href={`/buscar/${category.slug}`}
              onClick={(e) => {
                e.preventDefault()
                handleCategorySelect(category)
              }}
              className={`flex flex-col items-center justify-center min-w-[90px] p-2 rounded-lg mr-2 transition-all ${
                activeCategory === category.id || activeCategory === category.slug
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-sm border border-slate-700'
              }`}
            >
              <span className="text-2xl mb-1">{category.icon}</span>
              <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
              {showCounts && category.count && (
                <span className="text-xs opacity-70 mt-1">{category.count}</span>
              )}
            </Link>
          ))}
          
          {CATEGORIES.length > maxVisible && (
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
          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex overflow-x-auto hide-scrollbar py-1 px-1 -mx-1"
            >
              {selectedCategory.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/buscar/${selectedCategory.slug}/${subcategory.slug}`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleSubcategorySelect(subcategory)
                  }}
                  className={`flex items-center px-3 py-1.5 rounded-full mr-2 text-sm whitespace-nowrap transition-all ${
                    activeSubcategory === subcategory.id || activeSubcategory === subcategory.slug
                      ? 'bg-teal-500 text-white shadow-sm' 
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {subcategory.icon && (
                    <span className="mr-1">{subcategory.icon}</span>
                  )}
                  <span>{subcategory.name}</span>
                  {showCounts && subcategory.count && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-black/20 rounded-full text-xs">
                      {subcategory.count}
                    </span>
                  )}
                </Link>
              ))}
            </motion.div>
          )}
          
          {/* Sub-sub-navegación si hay una subcategoría seleccionada */}
          {selectedSubcategory?.subsubcategories && selectedSubcategory.subsubcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex overflow-x-auto hide-scrollbar py-1 px-1 -mx-1"
            >
              {selectedSubcategory.subsubcategories.map((subsubcategory) => (
                <Link
                  key={subsubcategory.id}
                  href={`/buscar/${selectedCategory?.slug}/${selectedSubcategory.slug}/${subsubcategory.slug}`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleSubSubcategorySelect(subsubcategory)
                  }}
                  className={`flex items-center px-3 py-1 rounded-full mr-2 text-xs whitespace-nowrap transition-all ${
                    activeSubSubcategory === subsubcategory.id || activeSubSubcategory === subsubcategory.slug
                      ? 'bg-cyan-500 text-white shadow-sm' 
                      : 'bg-slate-700/70 hover:bg-slate-600 text-white'
                  }`}
                >
                  {subsubcategory.icon && (
                    <span className="mr-1">{subsubcategory.icon}</span>
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
                    {CATEGORIES.reduce((acc, cat) => acc + (cat.count || 0), 0)} anuncios
                  </p>
                )}
              </div>
              
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/80" />
              </div>
            </Link>
          )}
          
          {CATEGORIES.slice(0, expanded ? CATEGORIES.length : maxVisible).map((category) => (
            <Link
              key={category.id}
              href={`/buscar/${category.slug}`}
              onClick={(e) => {
                e.preventDefault()
                handleCategorySelect(category)
              }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all overflow-hidden group ${
                activeCategory === category.id || activeCategory === category.slug
                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white hover:shadow-md border border-slate-700'
              }`}
            >
              <div className="z-10">
                <span className="text-3xl mb-2 inline-block">{category.icon}</span>
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
          
          {CATEGORIES.length > maxVisible && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="relative flex flex-col items-center justify-center p-4 rounded-xl transition-all overflow-hidden group bg-slate-800 hover:bg-slate-700 text-white hover:shadow-md border border-slate-700"
            >
              <span className="text-3xl mb-2">⋯</span>
              <h3 className="font-medium">Ver más</h3>
              <p className="text-sm opacity-70 mt-1">
                +{CATEGORIES.length - maxVisible} categorías
              </p>
            </button>
          )}
        </div>
        
        {/* Sub-navegación para categoría seleccionada */}
        <AnimatePresence>
          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 pt-6 border-t border-slate-700"
            >
              <h3 className="font-medium text-lg mb-3 text-white">
                Subcategorías de {selectedCategory.name}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedCategory.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/buscar/${selectedCategory.slug}/${subcategory.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleSubcategorySelect(subcategory)
                    }}
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      activeSubcategory === subcategory.id || activeSubcategory === subcategory.slug
                        ? 'bg-teal-500 text-white shadow-sm' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <div className="flex items-center">
                      {subcategory.icon && (
                        <span className="text-xl mr-3">{subcategory.icon}</span>
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
                ))}
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
  
  return (
    <div className={`w-full ${className}`}>
      {renderBreadcrumbs()}
      {renderSelector()}
    </div>
  )
} 