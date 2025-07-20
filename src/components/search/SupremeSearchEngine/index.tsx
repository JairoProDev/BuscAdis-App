'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import { 
  MagnifyingGlassIcon,
  MicrophoneIcon,
  CameraIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import AdvancedFilters from './AdvancedFilters'
import { debounce } from 'lodash'
import { categoriesList } from '@/data/categories-data'
import { 
  JobsIcon,
  RealEstateIcon, 
  VehicleIcon,
  ServicesIcon,
  ProductsIcon,
  EventsIcon,
  PetsIcon
} from '@/components/icons/categories'
import Breadcrumbs from '../Breadcrumbs'
import { getFiltersForCategory } from '@/utils/filterUtils'
import type { FilterOption, FilterSelectOption } from '@/types/filters'

// Nuevas interfaces para reemplazar 'any'
export interface SearchOptions {
  category?: string;
  subcategory?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  priceRange?: [number, number];
  status?: string;
  premium?: boolean;
  [key: string]: string | number | boolean | [number, number] | string[] | undefined;
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  type: 'quick' | 'exhaustive';
  description?: string;
  price?: number;
  location?: string;
  image?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
}

export interface Filter {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'toggle';
  options?: FilterOption[];
  format?: (value: number) => string;
  min?: number;
  max?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: React.ComponentType<{ className?: string }>;
  subcategories?: CategoryItem[];
}

export interface VoiceRecognitionEvent {
  results: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface VoiceRecognitionError {
  error: string;
  message: string;
}

export interface VoiceRecognition {
  onresult: (event: VoiceRecognitionEvent) => void;
  onerror: (event: VoiceRecognitionError) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SupremeSearchEngineProps {
  onSearch?: (query: string, options?: SearchOptions) => void
  onFilterChange?: (filters: SearchFilters) => void
  className?: string
  variant?: 'header' | 'page' | 'compact'
  showFilters?: boolean
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'trending' | 'ai' | 'category'
  categoryId?: string
  subcategoryId?: string
  score?: number
  icon?: React.ElementType
}

// API simulada para búsquedas en tiempo real
const searchAPI = {
  async getQuickResults(query: string, options: SearchOptions = {}) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      results: Array(5).fill(null).map((_, i) => ({
        id: `quick-${i}`,
        title: `${query} resultado ${i + 1}`,
        category: options.category || 'general',
        type: 'quick'
      })),
      totalCount: 25 + Math.floor(Math.random() * 100)
    }
  },

  async getExhaustiveResults(query: string, options: SearchOptions = {}) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      results: Array(50).fill(null).map((_, i) => ({
        id: `exhaustive-${i}`,
        title: `${query} resultado exhaustivo ${i + 1}`,
        category: options.category || 'general',
        type: 'exhaustive'
      })),
      totalCount: 150 + Math.floor(Math.random() * 500)
    }
  }
}

// Mapa de iconos para cada categoría
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'empleos': JobsIcon,
  'inmuebles': RealEstateIcon,
  'vehiculos': VehicleIcon,
  'servicios': ServicesIcon,
  'productos': ProductsIcon,
  'eventos': EventsIcon,
  'comunidad': PetsIcon,
  'negocios': ServicesIcon
}

// Componente simple de filtros inline
const InlineFilters = ({ 
  category, 
  activeFilters = {}, 
  onFilterChange 
}: { 
  category: string
  activeFilters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void 
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  
  const filters = getFiltersForCategory(category)
  
  if (!filters || filters.length === 0) return null

  const handleFilterChange = (filterId: string, value: string | number | boolean | [number, number] | string[]) => {
    const newFilters = { ...activeFilters }
    
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && (value as unknown[]).length === 0)) {
      delete newFilters[filterId]
    } else {
      newFilters[filterId] = value
    }
    
    onFilterChange(newFilters)
  }

  const renderFilterButton = (filter: FilterOption) => {
    const isActive = activeFilters[filter.id] !== undefined
    const hasValue = activeFilters[filter.id]
    
    let displayValue = ''
    if (hasValue) {
      if (filter.type === 'select' && typeof hasValue === 'string') {
        const option = filter.options?.find((o: FilterSelectOption) => o.value === hasValue)
        displayValue = option ? option.label : hasValue
      } else if (filter.type === 'range' && Array.isArray(hasValue)) {
        displayValue = `${filter.format ? filter.format(Number(hasValue[0])) : hasValue[0]} - ${filter.format ? filter.format(Number(hasValue[1])) : hasValue[1]}`
      } else if (filter.type === 'multiselect' && Array.isArray(hasValue)) {
        displayValue = `${hasValue.length} seleccionados`
      } else if (filter.type === 'toggle') {
        displayValue = hasValue ? 'Sí' : 'No'
      }
    }

    return (
      <div key={filter.id} className="relative">
        <button
          onClick={() => setOpenFilter(openFilter === filter.id ? null : filter.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            isActive 
              ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
              : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 shadow-sm'
          }`}
        >
          <span>{filter.label}</span>
          {hasValue && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isActive ? 'bg-blue-400 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300'
            }`}>
              {displayValue}
            </span>
          )}
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${openFilter === filter.id ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown content */}
        {openFilter === filter.id && (
          <div className="absolute z-50 top-full left-0 mt-1 min-w-[250px] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-4">
            {filter.type === 'select' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{filter.label}</label>
                <select
                  value={typeof activeFilters[filter.id] === 'string' ? activeFilters[filter.id] as string : ''}
                  onChange={(e) => {
                    handleFilterChange(filter.id, e.target.value)
                    if (e.target.value) {
                      setOpenFilter(null) // Close dropdown after selection
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={filter.label}
                >
                  <option value="">Todos</option>
                  {filter.options?.map((option: FilterSelectOption) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {filter.type === 'multiselect' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{filter.label}</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filter.options?.map((option: FilterSelectOption) => {
                    const filterValue = activeFilters[filter.id]
                    const isSelected = Array.isArray(filterValue) && (filterValue as string[]).includes(option.value)
                    return (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const filterValue = activeFilters[filter.id]
                            const currentValues = Array.isArray(filterValue) ? filterValue as string[] : []
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v: string) => v !== option.value)
                            handleFilterChange(filter.id, newValues)
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {filter.type === 'range' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{filter.label}</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={(() => {
                      const filterValue = activeFilters[filter.id]
                      const defaultValue = [filter.min || 0, filter.max || 100]
                      const currentValue = Array.isArray(filterValue) ? filterValue : defaultValue
                      return currentValue[0] || ''
                    })()}
                    onChange={(e) => {
                      const filterValue = activeFilters[filter.id]
                      const defaultValue = [filter.min || 0, filter.max || 100]
                      const currentRange = Array.isArray(filterValue) ? filterValue : defaultValue
                      handleFilterChange(filter.id, [parseInt(e.target.value) || filter.min || 0, Number(currentRange[1]) || filter.max || 100])
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={(() => {
                      const filterValue = activeFilters[filter.id]
                      const defaultValue = [filter.min || 0, filter.max || 100]
                      const currentValue = Array.isArray(filterValue) ? filterValue : defaultValue
                      return currentValue[1] || ''
                    })()}
                    onChange={(e) => {
                      const filterValue = activeFilters[filter.id]
                      const defaultValue = [filter.min || 0, filter.max || 100]
                      const currentRange = Array.isArray(filterValue) ? filterValue : defaultValue
                      handleFilterChange(filter.id, [Number(currentRange[0]), parseInt(e.target.value) || filter.max || 100])
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm"
                  />
                  {filter.format && (
                    <span className="text-xs text-gray-500">
                      ({filter.format(filter.min || 0)} - {filter.format(filter.max || 100)})
                    </span>
                  )}
                </div>
              </div>
            )}

            {filter.type === 'toggle' && (
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!activeFilters[filter.id]}
                    onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{filter.label}</span>
                </label>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpenFilter(null)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cerrar
              </button>
              {activeFilters[filter.id] && (
                <button
                  onClick={() => {
                    handleFilterChange(filter.id, null as unknown as string | number | boolean | [number, number])
                    setOpenFilter(null)
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 hide-scrollbar">
      <div className="flex items-center gap-2 min-w-max">
        {filters.slice(0, 4).map((filter: FilterOption) => renderFilterButton(filter))} {/* Reducido a 4 filtros para móvil */}
      </div>
      
      {/* Overlay to close dropdowns when clicking outside */}
      {openFilter && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenFilter(null)}
        />
      )}
    </div>
  )
}

// Helper function to convert SearchFilters to Record<string, unknown>
const convertFiltersForAdvancedFilters = (filters: SearchFilters): Record<string, unknown> => {
  return filters as Record<string, unknown>;
};

export default function SupremeSearchEngine({
  onSearch,
  onFilterChange,
  className = '',
  variant = 'page',
  showFilters = true
}: SupremeSearchEngineProps) {
  const { searchState, updateSearch } = useSearch()
  const router = useRouter()
  
  // Estados principales
  const [query, setQuery] = useState(searchState.query || '')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quickResults, setQuickResults] = useState<SearchResult[]>([])
  const [showQuickResults, setShowQuickResults] = useState(false)
  
  // Estados para paneles activos
  const [activePanel, setActivePanel] = useState<'search' | 'category' | 'filters' | null>(null)
  
  // Estados para categorías
  const [categorySelection, setCategorySelection] = useState({
    category: null as CategoryItem | null,
    subcategory: null as CategoryItem | null,
    subsubcategory: null as CategoryItem | null
  })
  const [categoryLevel, setCategoryLevel] = useState<'category' | 'subcategory' | 'subsubcategory'>('category')

  // Estados para funciones avanzadas
  const [isRecording, setIsRecording] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Referencias
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const recognition = useRef<VoiceRecognition | null>(null)

  // Función de búsqueda rápida en tiempo real
  const debouncedQuickSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setQuickResults([])
      setShowQuickResults(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await searchAPI.getQuickResults(searchQuery, {
        category: searchState.category,
        location: searchState.location
      })
      setQuickResults(response.results as SearchResult[])
      setShowQuickResults(true)
    } catch (error) {
      console.error('Error in quick search:', error)
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    if (isFocused && query) {
      debouncedQuickSearch(query)
    } else {
      setShowQuickResults(false)
    }
  }, [query, isFocused, debouncedQuickSearch])

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window.webkitSpeechRecognition || window.SpeechRecognition) as new () => VoiceRecognition
      if (SpeechRecognitionConstructor) {
        recognition.current = new SpeechRecognitionConstructor()
        
        // Configurar propiedades si existen
        if ('continuous' in recognition.current) {
          (recognition.current as any).continuous = false
        }
        if ('interimResults' in recognition.current) {
          (recognition.current as any).interimResults = true
        }
        if ('lang' in recognition.current) {
          (recognition.current as any).lang = 'es-ES'
        }

        recognition.current.onresult = (event: VoiceRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result: { transcript: string; confidence: number }) => result.transcript)
            .join('')
          setQuery(transcript)
        }

        if ('onend' in recognition.current) {
          (recognition.current as any).onend = () => {
            setIsRecording(false)
          }
        }

        recognition.current.onerror = () => {
          setIsRecording(false)
        }
      }
    }
  }, [])

  // Cargar sugerencias
  useEffect(() => {
    const loadSuggestions = () => {
      // Load suggestions logic here if needed
    }

    loadSuggestions()
  }, [])

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePanel(null)
        setIsFocused(false)
        setShowQuickResults(false)
        setShowMobileFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMainSearch = async () => {
    if (!query.trim()) return

    // Guardar en búsquedas recientes
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    const updatedSearches = [query, ...recentSearches.filter((s: string) => s !== query)].slice(0, 10)
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))

    // Actualizar estado de búsqueda
    updateSearch({
      query: query
    })

    // Ejecutar búsqueda
    if (onSearch) {
      onSearch(query, {
        category: searchState.category,
        subcategory: searchState.subcategory,
        location: searchState.location
      })
    } else {
      router.push(`/buscar?q=${encodeURIComponent(query)}`)
    }

    setActivePanel(null)
    setIsFocused(false)
    setShowQuickResults(false)
  }

  const handleVoiceSearch = () => {
    if (!recognition.current) {
      alert('Tu navegador no soporta reconocimiento de voz')
      return
    }

    if (isRecording) {
      recognition.current.stop()
    } else {
      setIsRecording(true)
      recognition.current.start()
    }
  }

  const handleImageSearch = () => {
    imageInputRef.current?.click()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // setSelectedImage(file) // This line was removed as per the edit hint
      console.log('Imagen seleccionada:', file.name)
    }
  }

  // Función de búsqueda con IA mejorada
  const handleAiSearch = async () => {
    setIsAiThinking(true)
    
    try {
      // Simular recomendaciones de IA basadas en tendencias y contexto
      const aiSuggestions = [
        'Casa en venta con vista al mar',
        'Departamento amoblado en zona céntrica',
        'Auto segundo dueño en perfecto estado',
        'Laptop gaming con tarjeta gráfica dedicada',
        'Trabajo remoto en tecnología',
        'Celular último modelo con garantía',
        'Terreno para construcción en zona residencial',
        'Moto eléctrica para ciudad'
      ]
      
      // Seleccionar una sugerencia aleatoria y colocarla en el campo
      const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)]
      setQuery(randomSuggestion)
      
      // Simular un pequeño delay para efecto visual
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Enfocar el input y activar el panel
      inputRef.current?.focus()
      setActivePanel('search')
      
    } catch (error) {
      console.error('Error generating AI suggestion:', error)
    } finally {
      setIsAiThinking(false)
    }
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setActivePanel(null)
    inputRef.current?.focus()
    
    // Guardar en búsquedas recientes si no es una búsqueda reciente
    if (suggestion.type !== 'recent') {
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      const updatedSearches = [suggestion.text, ...recentSearches.filter((s: string) => s !== suggestion.text)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
    }
    
    // Opcional: ejecutar búsqueda automáticamente para sugerencias de IA y tendencias
    if (suggestion.type === 'trending' || suggestion.type === 'ai') {
      setTimeout(() => handleMainSearch(), 100)
    }
  }

  const handleQuickResultClick = (result: SearchResult) => {
    router.push(`/anuncios/${result.id}`)
  }

  const handleSearchFocus = () => {
    setIsFocused(true)
    setActivePanel('search')
  }

  const handleCategoryClick = () => {
    setActivePanel(activePanel === 'category' ? null : 'category')
  }

  const handleCategorySelect = (item: CategoryItem, level: string) => {
    const newSelection = { ...categorySelection }
    
    if (level === 'category') {
      newSelection.category = item
      newSelection.subcategory = null
      newSelection.subsubcategory = null
      setCategoryLevel('subcategory')
    } else if (level === 'subcategory') {
      newSelection.subcategory = item
      newSelection.subsubcategory = null
      setCategoryLevel('subsubcategory')
    } else if (level === 'subsubcategory') {
      newSelection.subsubcategory = item
      setActivePanel(null)
    }
    
    setCategorySelection(newSelection)
    updateSearch({ category: newSelection.category?.id || '' })
  }

  const getCategoryDataForLevel = (level: string): CategoryItem[] => {
    if (level === 'category') {
      return categoriesList.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.id, // Usar id como slug
        subcategories: cat.subcategories?.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.id,
          subcategories: sub.subSubcategories?.map(subsub => ({
            id: subsub.id,
            name: subsub.name,
            slug: subsub.id
          }))
        }))
      }))
    } else if (level === 'subcategory' && categorySelection.category) {
      return (categorySelection.category.subcategories || []).map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.id,
        subcategories: sub.subcategories?.map(subsub => ({
          id: subsub.id,
          name: subsub.name,
          slug: subsub.id
        }))
      }))
    } else if (level === 'subsubcategory' && categorySelection.subcategory) {
      return (categorySelection.subcategory.subcategories || []).map(subsub => ({
        id: subsub.id,
        name: subsub.name,
        slug: subsub.id
      }))
    }
    return []
  }

  const getSelectedCategoryDisplay = () => {
    if (categorySelection.subsubcategory) return categorySelection.subsubcategory.name
    if (categorySelection.subcategory) return categorySelection.subcategory.name
    if (categorySelection.category) return categorySelection.category.name
    return 'Todas las categorías'
  }

  // Variantes de diseño según el contexto
  const getContainerClasses = () => {
    const baseClasses = "relative w-full"
    
    switch (variant) {
      case 'header':
        return `${baseClasses} max-w-2xl mx-auto`
      case 'compact':
        return `${baseClasses} max-w-lg`
      default:
        return `${baseClasses} max-w-4xl mx-auto`
    }
  }

  const getSearchBarClasses = () => {
    const baseClasses = "relative flex items-center w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200"
    
    if (isFocused || activePanel) {
      return `${baseClasses} ring-2 ring-teal-500 dark:ring-teal-400 border-teal-500 dark:border-teal-400 shadow-xl`
    }
    
    return `${baseClasses} hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600`
  }

  return (
    <div className={`${getContainerClasses()} ${className}`} ref={containerRef}>
      {/* Barra de búsqueda principal */}
      <div className={getSearchBarClasses()}>
        {/* Selector de categoría - Mobile como botón, Desktop integrado */}
        <div className="flex-shrink-0">
          <button
            onClick={handleCategoryClick}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-3 sm:py-4 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors border-r border-slate-200 dark:border-slate-700 rounded-l-xl"
          >
            <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {getSelectedCategoryDisplay()}
            </span>
            <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${activePanel === 'category' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Campo de búsqueda */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onKeyDown={(e) => e.key === 'Enter' && handleMainSearch()}
            placeholder="¿Qué estás buscando?"
            className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
          />
          
          {/* Indicador de carga */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
          {/* Botón de voz */}
          <button
            onClick={handleVoiceSearch}
            className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 ${
              isRecording
                ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Búsqueda por voz"
          >
            <MicrophoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Botón de cámara */}
          <button
            onClick={handleImageSearch}
            className="p-2 sm:p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200"
            title="Búsqueda por imagen"
          >
            <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Botón IA */}
          <button
            onClick={handleAiSearch}
            className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 ${
              isAiThinking
                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
            title="Búsqueda con IA"
                      >
            <span className="text-lg">✨</span>
          </button>

          {/* Botón de búsqueda */}
          <button
            onClick={handleMainSearch}
            className="p-2 sm:p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            title="Buscar"
          >
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mt-3 mb-2">
        <Breadcrumbs className="text-slate-400" />
      </div>

      {/* Filtros dinámicos según categoría */}
      {showFilters && searchState.category && (
        <div className="mt-3">
          <InlineFilters
            category={searchState.category}
            activeFilters={{} as SearchFilters}
            onFilterChange={onFilterChange || (() => {})}
          />
        </div>
      )}

      {/* Panel expandido con sugerencias y resultados rápidos */}
      <AnimatePresence>
        {(isFocused || activePanel === 'search') && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {/* Panel de búsqueda */}
              <div>
                {/* Filtros dinámicos según categoría */}
                {searchState.category && (
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <FunnelIcon className="h-4 w-4 text-teal-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Filtros de {searchState.category}
                      </span>
                    </div>
                    <div className="max-w-full">
                      <InlineFilters
                        category={searchState.category}
                        activeFilters={{} as SearchFilters}
                        onFilterChange={onFilterChange || (() => {})}
                      />
                    </div>
                  </div>
                )}
                
                {/* Filtros rápidos generales cuando no hay categoría */}
                {!searchState.category && (
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Filtros rápidos
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                                      {[
                  { icon: '📍', label: 'Ubicación', active: false, id: 'location' },
                  { icon: '💰', label: 'Precio', active: false, id: 'price' },
                  { icon: '⭐', label: 'Valoración', active: false, id: 'rating' },
                  { icon: '🕒', label: 'Más recientes', active: true, id: 'recent' }
                ].map((filter) => (
                  <button
                    key={`quick-filter-${filter.id}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filter.active 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
                    </div>
                  </div>
                )}

                {/* Sección principal con tres columnas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 min-h-[300px]">
                  {/* Columna 1: Búsquedas recientes */}
                  <div className="p-4 border-r border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <ClockIcon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Búsquedas recientes
                      </span>
                    </div>
                    <div className="space-y-2">
                      {searchState.recentSearches.length > 0 ? (
                        searchState.recentSearches.slice(0, 5).map((recent) => (
                          <button
                            key={`recent-search-${recent.id}`}
                            onClick={() => handleSuggestionSelect(recent)}
                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <ClockIcon className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                              {recent.text}
                            </span>
                          </button>
                        ))
                      ) : (
                        [
                          { text: 'Casa en venta en Inmuebles', id: 'recent-casa-venta' },
                          { text: 'Moto en Vehículos', id: 'recent-moto-vehiculos' }, 
                          { text: 'local', id: 'recent-local' },
                          { text: 'Trabajo en marketing', id: 'recent-trabajo-marketing' },
                          { text: 'Laptop gaming', id: 'recent-laptop-gaming' }
                        ].map((recent) => (
                          <button
                            key={`fallback-recent-${recent.id}`}
                            onClick={() => handleSuggestionSelect({ id: recent.id, text: recent.text, type: 'recent' })}
                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <ClockIcon className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                              {recent.text}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Columna 2: Sugerencias IA */}
                  <div className="p-4 border-r border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">✨</span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Sugerencias IA
                      </span>
                      <button className="ml-auto text-xs text-purple-600 hover:text-purple-700 font-medium">
                        Borrar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {[
                        { icon: '🏠', text: 'Departamentos con vista al mar', category: 'Inmuebles', id: 'ai-depts-vista-mar' },
                        { icon: '⚡', text: 'Autos eléctricos segunda mano', category: 'Vehículos', id: 'ai-autos-electricos' },
                        { icon: '🏗️', text: 'Terrenos construcción cerca ciudad', category: 'Inmuebles', id: 'ai-terrenos-construccion' },
                        { icon: '📷', text: 'Cámaras digitales profesionales', category: 'Electrónicos', id: 'ai-camaras-profesionales' }
                      ].map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionSelect({ id: suggestion.id, text: suggestion.text, type: 'ai' })}
                          className="w-full text-left p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-sm">{suggestion.icon}</span>
                            <div>
                              <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                {suggestion.text}
                              </div>
                              <div className="text-xs text-purple-600 dark:text-purple-400">
                                {suggestion.category}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Columna 3: Tendencias */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FireIcon className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Tendencias
                      </span>
                      <span className="ml-auto text-xs text-orange-600 font-medium">🔥</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { text: 'Casa en venta Lima', trend: 'up', growth: '+23%', id: 'trend-casa-lima' },
                        { text: 'Departamento alquiler', trend: 'up', growth: '+18%', id: 'trend-depto-alquiler' },
                        { text: 'Auto usado Toyota', trend: 'up', growth: '+15%', id: 'trend-auto-toyota' },
                        { text: 'Trabajo remoto', trend: 'hot', growth: 'HOT', id: 'trend-trabajo-remoto' },
                        { text: 'Celular Samsung', trend: 'up', growth: '+12%', id: 'trend-celular-samsung' }
                      ].map((trend) => (
                        <button
                          key={trend.id}
                          onClick={() => handleSuggestionSelect({ id: trend.id, text: trend.text, type: 'trending' })}
                          className="w-full text-left p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                trend.trend === 'hot' ? 'bg-red-500' : 'bg-orange-500'
                              }`} />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {trend.text}
                              </span>
                            </div>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              trend.trend === 'hot' 
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {trend.growth}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resultados rápidos en tiempo real */}
                {showQuickResults && quickResults.length > 0 && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Resultados en tiempo real
                      </span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {quickResults.length} encontrados
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {quickResults.slice(0, 4).map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleQuickResultClick(result)}
                          className="text-left p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-green-200 dark:border-green-800"
                        >
                          <div className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">
                            {result.title}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {result.category} • Relevante
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sugerencias cuando hay texto */}
                {query && !showQuickResults && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Sugerencias para &quot;{query}&quot;
                      </span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { text: `${query} en Lima`, id: `suggestion-lima-${query}` },
                        { text: `${query} segunda mano`, id: `suggestion-usado-${query}` },
                        { text: `${query} nuevo`, id: `suggestion-nuevo-${query}` },
                        { text: `${query} barato`, id: `suggestion-barato-${query}` }
                      ].map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionSelect({ id: suggestion.id, text: suggestion.text, type: 'ai' })}
                          className="w-full text-left p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <MagnifyingGlassIcon className="h-3 w-3 text-blue-500" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {suggestion.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer con acciones adicionales */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>💡 Tip: Usa comillas para búsquedas exactas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Búsqueda avanzada
                      </button>
                      <span className="text-slate-300">|</span>
                      <button className="text-xs text-slate-500 hover:text-slate-600">
                        Ayuda
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Panel de categorías */}
        {activePanel === 'category' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Header del panel */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Squares2X2Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {categoryLevel === 'category' ? 'Todas las categorías' :
                       categoryLevel === 'subcategory' ? categorySelection.category?.name : 
                       categorySelection.subcategory?.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {categoryLevel === 'category' ? 'Selecciona una categoría para comenzar' :
                       categoryLevel === 'subcategory' ? 'Subcategorías disponibles' : 
                       'Especialidades específicas'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {categoryLevel !== 'category' && (
                    <button
                      onClick={() => {
                        if (categoryLevel === 'subcategory') {
                          setCategoryLevel('category')
                        } else {
                          setCategoryLevel('subcategory')
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Volver
                    </button>
                  )}
                  <button
                    onClick={() => setActivePanel(null)}
                    className="w-6 h-6 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de categorías mejorado */}
            <div className="p-6">
              <div className={`grid gap-3 max-h-80 overflow-y-auto ${
                categoryLevel === 'category' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {getCategoryDataForLevel(categoryLevel).map((item: CategoryItem) => {
                  const IconComponent = categoryLevel === 'category' ? categoryIcons[item.id] : null
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleCategorySelect(item, categoryLevel)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${
                        categoryLevel === 'category'
                          ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-500'
                          : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {/* Efecto de brillo al hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      
                      <div className="relative flex items-start gap-3">
                        {/* Icono o placeholder */}
                        <div className={`flex-shrink-0 ${categoryLevel === 'category' ? 'w-12 h-12' : 'w-8 h-8'}`}>
                          {IconComponent ? (
                            <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 p-2 group-hover:scale-110 transition-transform duration-300">
                              <IconComponent className="w-full h-full" />
                            </div>
                          ) : (
                            <div className={`w-full h-full rounded-lg bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-800 dark:to-blue-800 flex items-center justify-center ${
                              categoryLevel === 'subcategory' ? 'text-xs' : 'text-sm'
                            } font-bold text-teal-700 dark:text-teal-300`}>
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${
                            categoryLevel === 'category' ? 'text-sm mb-1' : 'text-sm'
                          }`}>
                            {item.name}
                          </div>
                          
                          {categoryLevel === 'subcategory' && item.subcategories && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.subcategories.length} especialidades
                            </p>
                          )}
                        </div>

                        {/* Indicador de navegación */}
                        {categoryLevel !== 'subsubcategory' && (
                          <div className="flex-shrink-0 self-center">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-800 transition-colors">
                              <ChevronDownIcon className="w-3 h-3 text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transform rotate-[-90deg] transition-colors" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Badge de cantidad para categorías principales */}
                      {categoryLevel === 'category' && item.subcategories && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100">
                            {item.subcategories.length}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer del panel */}
              {categoryLevel === 'category' && (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>💡 Selecciona una categoría para ver subcategorías</span>
                    <span>{categoriesList.length} categorías disponibles</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Panel de filtros - Desktop */}
        {activePanel === 'filters' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          >
            <AdvancedFilters
              onFilterChange={onFilterChange ? (filters: Record<string, unknown>) => onFilterChange(filters as SearchFilters) : () => {}}
              onClose={() => setActivePanel(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de filtros móvil */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Filtros y ubicación
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <AdvancedFilters
                  onFilterChange={onFilterChange ? (filters: Record<string, unknown>) => onFilterChange(filters as SearchFilters) : () => {}}
                  onClose={() => setShowMobileFilters(false)}
                  isMobile={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input oculto para carga de imágenes */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
} 