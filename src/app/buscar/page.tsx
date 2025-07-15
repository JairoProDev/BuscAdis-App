// src\app\buscar\page.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import RealTimeSearchEngine from '@/components/search/RealTimeSearchEngine'
// import EnhancedSearchInput from '@/components/search/EnhancedSearchInput'
// import SearchFilters from '@/components/search/SearchFilters'
// import PublicationCard from '@/components/publications/PublicationCard'
// import CategorySelector from '@/components/search/CategorySelector'
import ContentRow from '@/components/search/ContentRow'
import { parseCategoryUrl, getSubcategories, generateCategoryUrl } from '@/lib/categories'
import { filtersByCategory } from '@/data/filterConfig'
import type { FilterOption } from '@/types/filters'
import { createPortal } from 'react-dom'
import { PublicationData } from '@/types/publication'
import PublicationDetailContainer from '@/components/publications/PublicationDetailContainer'
import { PublicationDetailProvider, usePublicationDetail } from '@/hooks/usePublicationDetail'
import PublicationDetailSidebar from '@/components/publications/PublicationDetailSidebar'

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  image: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
}

type ViewMode = 'grid' | 'list'
type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'views' | 'distance'
type FilterValue = string | number | boolean | null | undefined;

const sortOptions = [
  { value: 'recent', label: 'Más recientes', icon: '🕒' },
  { value: 'price-asc', label: 'Precio: menor a mayor', icon: '💰' },
  { value: 'price-desc', label: 'Precio: mayor a menor', icon: '💸' },
  { value: 'views', label: 'Más populares', icon: '👁️' },
  { value: 'distance', label: 'Más cercanos', icon: '📍' }
]

// Componente simple para selector de subcategorías
const SubcategorySelector = ({ 
  selectedCategory, 
  selectedSubcategory, 
  onSubcategoryChange 
}: {
  selectedCategory: string
  selectedSubcategory: string
  onSubcategoryChange: (subcategory: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const subcategories = getSubcategories(selectedCategory)
  
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleSubcategorySelect = useCallback((subcategoryId: string) => {
    onSubcategoryChange(subcategoryId)
    setIsOpen(false)
  }, [onSubcategoryChange])
  
  if (!subcategories.length) return null
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedSubcategory ? subcategories.find(sub => sub.id === selectedSubcategory)?.name : 'Subcategoría'}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <DropdownPortal 
        isOpen={isOpen}
        buttonRef={buttonRef.current}
        onClose={handleClose}
      >
        <button
          onClick={() => handleSubcategorySelect('')}
          className="w-full flex items-start px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          Todas las subcategorías
        </button>
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => handleSubcategorySelect(subcategory.id)}
            className={`w-full flex items-start px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              selectedSubcategory === subcategory.id 
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {subcategory.name}
          </button>
        ))}
      </DropdownPortal>
    </div>
  )
}

// Componente para selector individual de filtros
const FilterSelector = ({ 
  filter, 
  value, 
  onFilterChange 
}: {
  filter: FilterOption
  value: FilterValue
  onFilterChange: (filterId: string, value: FilterValue) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleFilterSelect = useCallback((optionValue: FilterValue) => {
    onFilterChange(filter.id, optionValue)
    setIsOpen(false)
  }, [filter.id, onFilterChange])

  if (filter.type === 'select') {
    const selectedOption = filter.options?.find(option => option.value === value)
    
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedOption ? selectedOption.label : filter.label}
          </span>
          <ChevronDownIcon 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        <DropdownPortal 
          isOpen={isOpen}
          buttonRef={buttonRef.current}
          onClose={handleClose}
        >
          <button
            onClick={() => handleFilterSelect(null)}
            className="w-full flex items-start px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            Cualquier {filter.label.toLowerCase()}
          </button>
          {filter.options?.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterSelect(option.value)}
              className={`w-full flex items-start px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                value === option.value 
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </DropdownPortal>
      </div>
    )
  }

  // Para otros tipos de filtros, devolver null por ahora
  return null
}

// Custom hook para manejar positioning de dropdowns
const useDropdownPosition = (buttonRef: HTMLButtonElement | null, isOpen: boolean) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!buttonRef || !isOpen) return

    const updatePosition = () => {
      const rect = buttonRef.getBoundingClientRect()
      setPosition({
        top: rect.bottom,
        left: rect.left
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [buttonRef, isOpen])

  return position
}

// Componente Dropdown Portal - Solución profesional
const DropdownPortal = ({ 
  isOpen, 
  buttonRef, 
  onClose, 
  children 
}: {
  isOpen: boolean
  buttonRef: HTMLButtonElement | null
  onClose: () => void
  children: React.ReactNode
}) => {
  const position = useDropdownPosition(buttonRef, isOpen)

  if (!isOpen || typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop para cerrar al hacer click fuera */}
      <div 
        className="fixed inset-0 z-[100000]" 
        onClick={onClose}
      />
      {/* Dropdown content */}
      <div 
        className="fixed w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto z-[100001]"
        style={{ 
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        {children}
      </div>
    </>,
    document.body
  )
}

// Componente mejorado que fusiona selector + chip cuando está activo
const EnhancedFilterSelector = ({ 
  label,
  value, 
  options,
  onChange,
  placeholder
}: {
  label: string
  value: FilterValue
  options: Array<{value: string, label: string}>
  onChange: (value: FilterValue) => void
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const selectedOption = options.find(option => option.value === value)
  const hasValue = value && value !== ''
  
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleOptionSelect = useCallback((optionValue: FilterValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }, [onChange])
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm ${
          hasValue 
            ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300' 
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
      >
        <span className="text-sm font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {hasValue && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)
            }}
            className="ml-1 hover:bg-teal-200 dark:hover:bg-teal-800 rounded-full p-0.5 transition-colors cursor-pointer"
            title="Limpiar filtro"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <DropdownPortal 
        isOpen={isOpen}
        buttonRef={buttonRef.current}
        onClose={handleClose}
      >
        <button
          onClick={() => handleOptionSelect(null)}
          className="w-full flex items-start px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          {placeholder}
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className={`w-full flex items-start px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              value === option.value 
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </DropdownPortal>
    </div>
  )
}

function SearchPageContent({ publicationsData, results, setResults, isLoading, setIsLoading, totalCount, setTotalCount, hasSearched, setHasSearched }: {
  publicationsData: PublicationData[];
  results: SearchResult[];
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  totalCount: number;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  hasSearched: boolean;
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const currentPathname = usePathname()
  const router = useRouter()
  
  // Inicializar estados con valores de URL si están disponibles
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (currentPathname && currentPathname !== '/buscar') {
      const parsed = parseCategoryUrl(currentPathname)
      return parsed.categoryId || 'all'
    }
    return 'all'
  })
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(() => {
    if (currentPathname && currentPathname !== '/buscar') {
      const parsed = parseCategoryUrl(currentPathname)
      return parsed.subcategoryId || ''
    }
    return ''
  })
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<string>(() => {
    if (currentPathname && currentPathname !== '/buscar') {
      const parsed = parseCategoryUrl(currentPathname)
      return parsed.subSubcategoryId || ''
    }
    return ''
  })
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [currentQuery, setCurrentQuery] = useState<string>('')
  const [lastSearchCategory, setLastSearchCategory] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  
  // Estados para las filas de categorías (Time To Value = 0)
  const [categoryRows, setCategoryRows] = useState<Record<string, SearchResult[]>>({})
  const [categoryLoading, setCategoryLoading] = useState<Record<string, boolean>>({})
  
  // Configuración de las 8 categorías principales
  const categories = [
    { id: 'empleos', name: 'Empleos', description: 'Oportunidades laborales destacadas' },
    { id: 'inmuebles', name: 'Inmuebles', description: 'Propiedades en venta y alquiler' },
    { id: 'vehiculos', name: 'Vehículos', description: 'Autos, motos y más' },
    { id: 'servicios', name: 'Servicios', description: 'Servicios profesionales y especializados' },
    { id: 'productos', name: 'Productos', description: 'Artículos nuevos y usados' },
    { id: 'eventos', name: 'Eventos', description: 'Actividades y entretenimiento' },
    { id: 'negocios', name: 'Negocios', description: 'Oportunidades de negocio' },
    { id: 'comunidad', name: 'Comunidad', description: 'Conexiones locales' }
  ]

  // const [deepLinkError, setDeepLinkError] = useState<string | null>(null);

  // Hook del contexto de publicación
  const {
    selectedPublication,
    isDetailOpen,
    openPublicationDetail,
    closePublicationDetail,
    handleWhatsAppClick,
    handleShare,
    handleFavorite
  } = usePublicationDetail();

  // Convert SearchResult to PublicationData format
  const convertToPublicationData = (searchResult: SearchResult): PublicationData => {
    let locationParts: string[] = [];
    if (typeof searchResult.location === 'string') {
      locationParts = searchResult.location.split(',').map(part => part.trim());
    } else {
      // fallback: si no es string, usar array vacío
      locationParts = [];
    }
    return {
      id: searchResult.id,
      title: searchResult.title,
      description: searchResult.description,
      categorySlug: searchResult.category ? searchResult.category.toLowerCase() : 'general',
      subcategorySlug: null,
      subSubcategorySlug: null,
      transactionType: 'venta',
      value: searchResult.price,
      currency: 'PEN',
      valueType: 'fixed',
      size: 0,
      location: {
        district: locationParts[0] || '',
        province: locationParts[1] || '',
        city: locationParts[2] || 'Cusco',
        country: 'Perú'
      },
      images: [searchResult.image],
      whatsapp: '51987654321', // Número de WhatsApp por defecto
      createdAt: searchResult.createdAt || new Date().toISOString(), // Usar fecha real de MongoDB
      views: searchResult.views || Math.floor(Math.random() * 500) + 50,
      featured: searchResult.featured || false,
      premium: searchResult.premium || false,
    }
  }

  const handleSearch = useCallback(async (query: string, typedFilters?: Record<string, unknown>) => {
    console.log('🔍 handleSearch called with:', { query, typedFilters, selectedCategory })
    
    setIsLoading(true)
    setHasSearched(true)
    setCurrentQuery(query)
    
    try {
      const searchParams: Record<string, string> = {
        sortBy: sortBy
      }
      
      if (query.trim()) searchParams.query = query
      if (typedFilters?.category && typedFilters.category !== 'all') searchParams.category = String(typedFilters.category)
      if (typedFilters?.subcategory) searchParams.subcategory = String(typedFilters.subcategory)
      if (typedFilters?.subsubcategory) searchParams.subsubcategory = String(typedFilters.subsubcategory)
      if (typedFilters?.location) searchParams.location = String(typedFilters.location)
      
      // Add active filters to search params
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) searchParams[key] = String(value)
      })
      
      console.log('🔍 Searching with params:', searchParams)
      
      const queryString = new URLSearchParams(searchParams).toString()
      const response = await fetch(`/api/publications?${queryString}`)
      const data = await response.json()
      
      if (!data.publications) {
        throw new Error(data.errorFriendly || 'No se encontraron resultados')
      }
      
      // Adaptar resultados de la API al formato esperado
      const adaptedResults: SearchResult[] = data.publications.map((pub: Record<string, unknown>) => ({
        id: pub._id || pub.id || `result-${Date.now()}-${Math.random()}`,
        title: pub.title || 'Sin título',
        description: pub.description || '',
        price: pub.price || pub.amount || 0,
        location: typeof pub.location === 'object' 
          ? `${(pub.location as Record<string, string>).district || (pub.location as Record<string, string>).province || (pub.location as Record<string, string>).city || 'Sin ubicación'}` 
          : pub.location || 'Sin ubicación',
        category: pub.categorySlug || pub.category || 'general',
        image: Array.isArray(pub.images) && typeof pub.images[0] === 'string' ? pub.images[0] : '/images/placeholder-image.jpg',
        createdAt: pub.createdAt || pub.created_at || new Date().toISOString(), // Fecha real de MongoDB
        views: pub.views || Math.floor(Math.random() * 500) + 50,
        premium: pub.premium || false,
        featured: pub.featured || false
      }))

      setResults(adaptedResults)
      setTotalCount(data.total || adaptedResults.length)
      
      console.log(`Found ${adaptedResults.length} results for "${query}"`)
      
    } catch (error) {
      console.error('Error in search:', error)
      setResults([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, activeFilters])

  const handleCategoryChange = useCallback((category: string) => {
    console.log('📂 Category changed to:', category)
    
    setSelectedCategory(category)
    setSelectedSubcategory('')
    setSelectedSubSubcategory('')
    setActiveFilters({})
    setLastSearchCategory('') // Reset para permitir nueva búsqueda
    
    // Navegar a la URL correspondiente
    if (category === 'all') {
      console.log('🔄 Navigating to: /buscar')
      router.push('/buscar')
    } else {
      const categoryUrl = generateCategoryUrl(category)
      console.log('🔄 Navigating to:', categoryUrl)
      router.push(categoryUrl)
    }
    
    handleSearch(currentQuery, {
      category: category === 'all' ? undefined : category
    })
  }, [currentQuery, handleSearch, router])

  const handleSubcategoryChange = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory)
    setSelectedSubSubcategory('')
    setActiveFilters({})
    setLastSearchCategory('') // Reset para permitir nueva búsqueda
    
    // Navegar a la URL correspondiente
    if (selectedCategory === 'all') {
      console.log('🔄 Subcategory: Navigating to: /buscar')
      router.push('/buscar')
    } else if (subcategory) {
      const categoryUrl = generateCategoryUrl(selectedCategory, subcategory)
      console.log('🔄 Subcategory: Navigating to:', categoryUrl)
      router.push(categoryUrl)
    } else {
      const categoryUrl = generateCategoryUrl(selectedCategory)
      console.log('🔄 Subcategory: Navigating to:', categoryUrl)
      router.push(categoryUrl)
    }
    
    handleSearch(currentQuery, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      subcategory: subcategory || undefined
    })
  }, [currentQuery, selectedCategory, handleSearch, router])

  const handleFiltersChange = useCallback((filters: Record<string, FilterValue>) => {
    setActiveFilters(filters)
    
    handleSearch(currentQuery, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      subcategory: selectedSubcategory || undefined,
      subsubcategory: selectedSubSubcategory || undefined,
      ...filters
    })
  }, [currentQuery, selectedCategory, selectedSubcategory, selectedSubSubcategory, handleSearch])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
    setSortDropdownOpen(false)
    
    handleSearch(currentQuery, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      subcategory: selectedSubcategory || undefined,
      subsubcategory: selectedSubSubcategory || undefined
    })
  }, [currentQuery, selectedCategory, selectedSubcategory, selectedSubSubcategory, handleSearch])

  // Función para cargar publicaciones por categoría (Time To Value = 0)
  const loadCategoryData = useCallback(async (categoryId: string) => {
    setCategoryLoading(prev => ({ ...prev, [categoryId]: true }))
    
    try {
      const response = await fetch(`/api/publications?category=${categoryId}&limit=10&sortBy=recent`)
      const data = await response.json()
      
      if (data.publications) {
        const formattedResults = data.publications.map((pub: Record<string, unknown>) => ({
          id: pub._id || pub.id,
          title: pub.title || 'Sin título',
          description: pub.description || '',
          category: categoryId,
          price: pub.price || pub.amount || 0,
          location: `${(pub.location as Record<string, string>)?.district || ''}, ${(pub.location as Record<string, string>)?.province || ''}`.replace(/^,\s*/, '') || 'Sin ubicación',
          image: Array.isArray(pub.images) && typeof pub.images[0] === 'string' ? pub.images[0] : '/images/placeholder-image.jpg',
          createdAt: pub.createdAt || new Date().toISOString(),
          views: pub.views || 0,
          featured: pub.featured || false,
          premium: pub.premium || false
        }))
        
        setCategoryRows(prev => ({
          ...prev,
          [categoryId]: formattedResults
        }))
      }
    } catch (error) {
      console.error(`Error loading category ${categoryId}:`, error)
      setCategoryRows(prev => ({
        ...prev,
        [categoryId]: []
      }))
    } finally {
      setCategoryLoading(prev => ({ ...prev, [categoryId]: false }))
    }
  }, [])

  // Sincronizar estado con cambios en la URL (navegación back/forward)
  useEffect(() => {
    console.log('🔄 URL Effect - pathname:', currentPathname)
    
    if (currentPathname && currentPathname !== '/buscar') {
      const parsed = parseCategoryUrl(currentPathname)
      console.log('🔄 URL parsed:', parsed)
      
      // Solo actualizar si hay cambios reales y no es un loop
      const needsUpdate = parsed.categoryId !== selectedCategory || 
                         parsed.subcategoryId !== selectedSubcategory ||
                         parsed.subSubcategoryId !== selectedSubSubcategory
      
      if (needsUpdate) {
        
        console.log('🔄 Updating category state from URL')
        setSelectedCategory(parsed.categoryId || 'all')
        setSelectedSubcategory(parsed.subcategoryId || '')
        setSelectedSubSubcategory(parsed.subSubcategoryId || '')
        setActiveFilters({})
        
        // Marcar que necesitamos hacer búsqueda
        if (parsed.categoryId) {
          setHasSearched(true)
        }
      }
    } else if (currentPathname === '/buscar' && selectedCategory !== 'all') {
      // Si estamos en /buscar pero hay categoría seleccionada, limpiar
      console.log('🔄 Clearing category for /buscar')
      setSelectedCategory('all')
      setSelectedSubcategory('')
      setSelectedSubSubcategory('')
      setActiveFilters({})
    }
  }, [currentPathname, selectedCategory, selectedSubcategory, selectedSubSubcategory])

  // Realizar búsqueda automática cuando cambie la categoría desde URL
  useEffect(() => {
    console.log('🔄 Search Effect - hasSearched:', hasSearched, 'selectedCategory:', selectedCategory, 'lastSearchCategory:', lastSearchCategory)
    
    if (hasSearched && selectedCategory && selectedCategory !== 'all' && selectedCategory !== lastSearchCategory) {
      console.log('🔍 Performing automatic search for category:', selectedCategory)
      setLastSearchCategory(selectedCategory)
      
      // Hacer la búsqueda directamente sin usar handleSearch para evitar loops
      const searchDirectly = async () => {
        setIsLoading(true)
        
        try {
          const searchParams: Record<string, string> = {
            sortBy: sortBy,
            category: selectedCategory
          }
          
          if (selectedSubcategory) searchParams.subcategory = selectedSubcategory
          if (selectedSubSubcategory) searchParams.subsubcategory = selectedSubSubcategory
          if (currentQuery.trim()) searchParams.query = currentQuery
          
          const queryString = new URLSearchParams(searchParams).toString()
          const response = await fetch(`/api/publications?${queryString}`)
          const data = await response.json()
          
          if (data.publications) {
            const adaptedResults: SearchResult[] = data.publications.map((pub: Record<string, unknown>) => ({
              id: pub._id || pub.id || `result-${Date.now()}-${Math.random()}`,
              title: pub.title || 'Sin título',
              description: pub.description || '',
              price: pub.price || pub.amount || 0,
              location: typeof pub.location === 'object' 
                ? `${(pub.location as Record<string, string>).district || (pub.location as Record<string, string>).province || (pub.location as Record<string, string>).city || 'Sin ubicación'}` 
                : pub.location || 'Sin ubicación',
              category: pub.categorySlug || pub.category || 'general',
              image: Array.isArray(pub.images) && typeof pub.images[0] === 'string' ? pub.images[0] : '/images/placeholder-image.jpg',
              createdAt: pub.createdAt || pub.created_at || new Date().toISOString(),
              views: pub.views || Math.floor(Math.random() * 500) + 50,
              premium: pub.premium || false,
              featured: pub.featured || false
            }))

            setResults(adaptedResults)
            setTotalCount(data.total || adaptedResults.length)
            
            console.log(`Found ${adaptedResults.length} results for category "${selectedCategory}"`)
          }
        } catch (error) {
          console.error('Error in category search:', error)
          setResults([])
          setTotalCount(0)
        } finally {
          setIsLoading(false)
        }
      }
      
      searchDirectly()
    }
  }, [selectedCategory, selectedSubcategory, selectedSubSubcategory, hasSearched, sortBy, lastSearchCategory])

  // Cargar todas las categorías al montar el componente (Time To Value = 0)
  useEffect(() => {
    const loadAllCategories = async () => {
      // Cargar las primeras 4 categorías inmediatamente
      const priorityCategories = categories.slice(0, 4)
      await Promise.all(priorityCategories.map(cat => loadCategoryData(cat.id)))
      
      // Cargar las restantes después de un breve delay
      setTimeout(() => {
        const remainingCategories = categories.slice(4)
        remainingCategories.forEach(cat => loadCategoryData(cat.id))
      }, 500)
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const query = urlParams.get('q')
      const category = urlParams.get('category')
      
      if (query || category) {
        // Actualizar estado de categoría si viene de URL
        if (category && category !== 'all') {
          setSelectedCategory(category)
        }
        handleSearch(query || '', {
          category: category || undefined
        })
      } else {
        // Time To Value = 0: Cargar todas las categorías inmediatamente
        loadAllCategories()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar el componente

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setSelectedSubcategory('')
    setSelectedSubSubcategory('')
    setActiveFilters({})
    setLastSearchCategory('') // Reset para permitir nueva búsqueda
    
    // Navegar de vuelta a la página de búsqueda
    router.push('/buscar')
    
    handleSearch(currentQuery, {})
  }

  // Deep linking: abrir panel si la URL es de detalle
  useEffect(() => {
    const handleDeepLinking = async () => {
      if (!currentPathname || currentPathname === '/buscar') return;
      const slug = currentPathname.split('/').pop();
      if (slug && slug.length > 0) {
        // Buscar el aviso en los resultados cargados
        const allPublications = results.map(convertToPublicationData);
        const pub = allPublications.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === slug);
        if (pub && (!selectedPublication || selectedPublication.id !== pub.id)) {
          openPublicationDetail(pub);
          // setDeepLinkError(null);
        } else if (!pub) {
          // Try to fetch from API
          try {
            const response = await fetch(`/api/publications/${encodeURIComponent(slug)}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.publication) {
                const pubData = convertToPublicationData(data.publication);
                openPublicationDetail(pubData);
                // setDeepLinkError(null);
              } else {
                // setDeepLinkError('Publicación no encontrada');
              }
            } else {
              // setDeepLinkError('Error al cargar la publicación');
            }
          } catch (error) {
            console.error('Error fetching publication:', error);
            // setDeepLinkError('Error al cargar la publicación');
          }
        }
      }
    };
    
    handleDeepLinking();
  }, [currentPathname, results, selectedPublication, openPublicationDetail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Enhanced Search Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg sticky top-0 z-30 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 overflow-visible">
          
          {/* Main Search Bar */}
          <div className="mb-3 search-input">
            <RealTimeSearchEngine 
              onSearch={handleSearch}
              variant="page"
              showFilters={true}
              placeholder="¿Qué necesitas hoy? Encuentra oportunidades cerca de ti..."
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
            />
          </div>

          {/* Filters Row Mejorado - Fusionando selectores con estado activo */}
          {(selectedCategory && selectedCategory !== 'all') && (
            <div className="pb-1 overflow-visible">
              <div className="flex items-center gap-3 overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent justify-start md:justify-center">
                {/* Selector de Subcategorías */}
                <div className="flex-shrink-0">
                  <EnhancedFilterSelector
                    label="Subcategoría"
                    value={selectedSubcategory}
                    options={getSubcategories(selectedCategory).map(sub => ({ value: sub.id, label: sub.name }))}
                    onChange={(value) => handleSubcategoryChange(typeof value === 'string' ? value : '')}
                    placeholder="Todas las subcategorías"
                  />
                </div>

                {/* Filtros dinámicos según categoría */}
                {(() => {
                  const categoryConfig = filtersByCategory[selectedCategory]
                  if (!categoryConfig) return null
                  
                  const selectFilters = categoryConfig.sections
                    .flatMap(section => section.filters)
                    .filter(filter => filter.type === 'select')
                    .slice(0, 4)
                  
                  return selectFilters.map(filter => (
                    <div key={filter.id} className="flex-shrink-0">
                      <EnhancedFilterSelector
                        label={filter.label}
                        value={activeFilters[filter.id]}
                        options={filter.options || []}
                        onChange={(value) => {
                          const newFilters = { ...activeFilters }
                          if (value === null || value === undefined || value === '') {
                            delete newFilters[filter.id]
                          } else {
                            newFilters[filter.id] = value
                          }
                          handleFiltersChange(newFilters)
                        }}
                        placeholder={`Cualquier ${filter.label.toLowerCase()}`}
                      />
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pt-2 pb-2">
        <div className="flex gap-4">
          <div className="w-full">
            {/* Time To Value = 0: Filas de Categorías */}
            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 lg:space-y-8"
              >

                {/* Filas de Categorías */}
                <div className="space-y-6 lg:space-y-12">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.6 }}
                    >
                      <ContentRow
                        title={category.name}
                        description={category.description}
                        publications={categoryRows[category.id]?.map(result => convertToPublicationData(result)) || []}
                        categoryId={category.id}
                        isLoading={categoryLoading[category.id]}
                        onViewAll={() => {
                          // Navegar a la URL de la categoría
                          console.log('🔗 Ver todos clicked for category:', category.id)
                          const categoryUrl = generateCategoryUrl(category.id)
                          console.log('🔗 Navigating to:', categoryUrl)
                          router.push(categoryUrl)
                        }}
                        onPublicationClick={(publication) => {
                          console.log('🔍 Opening publication from category row:', publication.title)
                          openPublicationDetail(publication)
                        }}
                        showViewAll={true}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Call to Action Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center py-12 lg:py-16"
                >
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      ¿No encuentras lo que buscas?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      Usa nuestro buscador avanzado para encontrar exactamente lo que necesitas con filtros específicos
                    </p>
                    <button
                      onClick={() => {
                        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
                        searchInput?.focus()
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <span>Buscar Ahora</span>
                      <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Search Results */}
            {hasSearched && (
              <div className={`space-y-4 ${isSidebarOpen ? 'lg:flex lg:gap-6 lg:items-start lg:h-full' : ''}`}>
                {/* Columna izquierda: Breadcrumbs, Título, Controles y Publicaciones */}
                <div className={`${isSidebarOpen ? 'lg:w-1/2 lg:flex-shrink-0' : 'w-full'} space-y-4`}>
                  {/* Breadcrumbs en área de resultados */}
                  {(selectedCategory && selectedCategory !== 'all') && (
                    <div className="mb-2">
                      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <button
                          onClick={() => handleCategoryChange('all')}
                          className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Inicio
                        </button>
                        <span className="text-gray-400">/</span>
                        <button
                          onClick={() => {
                            setSelectedSubcategory('')
                            setSelectedSubSubcategory('')
                          }}
                          className={`transition-colors ${
                            !selectedSubcategory 
                              ? 'text-teal-600 dark:text-teal-400 font-medium' 
                              : 'hover:text-teal-600 dark:hover:text-teal-400'
                          }`}
                        >
                          {(() => {
                            const categoryNames: Record<string, string> = {
                              'inmuebles': 'Inmuebles',
                              'vehiculos': 'Vehículos', 
                              'empleos': 'Empleos',
                              'servicios': 'Servicios',
                              'productos': 'Productos',
                              'eventos': 'Eventos',
                              'comunidad': 'Comunidad',
                              'negocios': 'Negocios'
                            }
                            return categoryNames[selectedCategory] || selectedCategory
                          })()}
                        </button>
                        {selectedSubcategory && (
                          <>
                            <span className="text-gray-400">/</span>
                            <button
                              onClick={() => setSelectedSubSubcategory('')}
                              className={`transition-colors ${
                                !selectedSubSubcategory 
                                  ? 'text-teal-600 dark:text-teal-400 font-medium' 
                                  : 'hover:text-teal-600 dark:hover:text-teal-400'
                              }`}
                            >
                              {getSubcategories(selectedCategory).find(sub => sub.id === selectedSubcategory)?.name}
                            </button>
                          </>
                        )}
                        {selectedSubSubcategory && (
                          <>
                            <span className="text-gray-400">/</span>
                            <span className="text-teal-600 dark:text-teal-400 font-medium">
                              {selectedSubSubcategory}
                            </span>
                          </>
                        )}
                      </nav>
                    </div>
                  )}

                  {/* Search Stats and Controls - Layout responsive mejorado */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Título y stats - Siempre en la parte superior */}
                    <div className="flex-shrink-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {currentQuery ? `Resultados para "${currentQuery}"` : 'Todas las oportunidades'}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {isLoading ? 'Buscando...' : `${totalCount.toLocaleString()} resultados encontrados`}
                      </p>
                    </div>

                    {/* Controles - Botones de vista y ordenar en la misma línea */}
                    <div className="flex items-center gap-3 lg:flex-shrink-0">
                      {/* View Mode Toggles */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'grid'
                              ? 'bg-white dark:bg-gray-600 text-teal-600 shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                          aria-label="Vista en cuadrícula"
                        >
                          <Squares2X2Icon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'list'
                              ? 'bg-white dark:bg-gray-600 text-teal-600 shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                          aria-label="Vista en lista"
                        >
                          <ListBulletIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Enhanced Sort Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm text-sm"
                        >
                          <span className="text-sm">
                            {sortOptions.find(opt => opt.value === sortBy)?.icon} 
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                            {sortOptions.find(opt => opt.value === sortBy)?.label}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                            Ordenar
                          </span>
                          <ChevronDownIcon 
                            className={`w-4 h-4 text-gray-500 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} 
                          />
                        </button>

                        {sortDropdownOpen && (
                          <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleSortChange(option.value as SortOption)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                  sortBy === option.value 
                                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <span className="text-base">{option.icon}</span>
                                <span className="font-medium">{option.label}</span>
                                {sortBy === option.value && (
                                  <span className="ml-auto text-teal-600">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex justify-center py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Buscando los mejores resultados...</p>
                      </div>
                    </div>
                  )}

                        {/* Results */}
      {!isLoading && results.length > 0 && (
        <PublicationDetailContainer
          publications={publicationsData}
          viewMode={viewMode}
          onDetailStateChange={setIsSidebarOpen}
          renderSidebarInParent={true}
        />
      )}

                  {/* No Results - UX/UI Expert Version */}
                  {!isLoading && results.length === 0 && hasSearched && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-20"
                    >
                      {/* Icon with subtle animation */}
                      <div className="relative w-28 h-28 mb-7 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-100/80 via-blue-100/60 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 shadow-lg animate-pulse-slow" />
                        <span className="relative z-10 text-5xl select-none" aria-label="Sin resultados">
                          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                            <circle cx="28" cy="28" r="28" fill="url(#sadGradient)" />
                            <g>
                              <ellipse cx="28" cy="34" rx="8" ry="4" fill="#FBBF24" opacity="0.18"/>
                              <circle cx="28" cy="26" r="12" fill="#FBBF24"/>
                              <ellipse cx="24" cy="25" rx="1.5" ry="2" fill="#92400E"/>
                              <ellipse cx="32" cy="25" rx="1.5" ry="2" fill="#92400E"/>
                              <path d="M24 30c1.5 1.5 6.5 1.5 8 0" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round"/>
                            </g>
                            <defs>
                              <linearGradient id="sadGradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#F0FDFA"/>
                                <stop offset="1" stopColor="#A7F3D0"/>
                              </linearGradient>
                            </defs>
                          </svg>
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Sin coincidencias por ahora
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {currentQuery
                          ? (
                              <>
                                No encontramos anuncios que coincidan con <span className="font-semibold text-teal-700 dark:text-teal-300">"{currentQuery}"</span>.
                                <br />
                                <span className="text-sm text-gray-500 dark:text-gray-500">
                                  Prueba ajustando tus filtros, usando palabras clave diferentes o explora todas las oportunidades disponibles.
                                </span>
                              </>
                            )
                          : (
                              <>
                                Actualmente no hay anuncios publicados en esta categoría o filtro.
                                <br />
                                <span className="text-sm text-gray-500 dark:text-gray-500">
                                  ¡Vuelve pronto o revisa otras categorías para encontrar lo que buscas!
                                </span>
                              </>
                            )
                        }
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => {
                            handleSearch('', {})
                            clearAllFilters()
                          }}
                          className="px-7 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-semibold text-base shadow-md hover:shadow-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
                        >
                          Ver todas las oportunidades
                        </button>
                        <button
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          className="px-7 py-3 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-teal-700 dark:text-teal-300 rounded-xl font-medium text-base shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150"
                        >
                          Ajustar búsqueda
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Columna derecha: Detalle ampliado de la publicación */}
                {isSidebarOpen && selectedPublication && (
                  <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 sticky top-40">
                    <div className="sticky top-[140px] h-fit max-h-[calc(100vh-160px)] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <PublicationDetailSidebar 
                        publication={selectedPublication}
                        isOpen={isDetailOpen}
                        onClose={closePublicationDetail}
                        onWhatsAppClick={handleWhatsAppClick}
                        onShare={handleShare}
                        onFavorite={handleFavorite}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BuscadorPage() {
  // Estado y lógica de resultados
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Función para convertir resultados a PublicationData
  const convertToPublicationData = (searchResult: SearchResult): PublicationData => {
    let locationParts: string[] = [];
    if (typeof searchResult.location === 'string') {
      locationParts = searchResult.location.split(',').map(part => part.trim());
    } else {
      // fallback: si no es string, usar array vacío
      locationParts = [];
    }
    return {
      id: searchResult.id,
      title: searchResult.title,
      description: searchResult.description,
      categorySlug: searchResult.category ? searchResult.category.toLowerCase() : 'general',
      subcategorySlug: null,
      subSubcategorySlug: null,
      transactionType: 'venta',
      value: searchResult.price,
      currency: 'PEN',
      valueType: 'fixed',
      size: 0,
      location: {
        district: locationParts[0] || '',
        province: locationParts[1] || '',
        city: locationParts[2] || 'Cusco',
        country: 'Perú'
      },
      images: [searchResult.image],
      whatsapp: '51987654321', // Número de WhatsApp por defecto
      createdAt: searchResult.createdAt || new Date().toISOString(), // Usar fecha real de MongoDB
      views: searchResult.views || Math.floor(Math.random() * 500) + 50,
      featured: searchResult.featured || false,
      premium: searchResult.premium || false,
    }
  };

  // Si los datos aún no están listos, muestra un loader
  // (puedes mejorar esto con un estado de carga real si lo necesitas)
  // Por ahora, siempre retorna el provider y el contenido
  return (
    <PublicationDetailProvider publications={results.map(convertToPublicationData)}>
      <SearchPageContent
        publicationsData={results.map(convertToPublicationData)}
        results={results}
        setResults={setResults}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        totalCount={totalCount}
        setTotalCount={setTotalCount}
        hasSearched={hasSearched}
        setHasSearched={setHasSearched}
      />
    </PublicationDetailProvider>
  );
}