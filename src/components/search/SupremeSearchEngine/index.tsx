'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import { 
  MagnifyingGlassIcon,
  MicrophoneIcon,
  CameraIcon,
  SparklesIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import AdvancedFilters from './AdvancedFilters'
import { debounce } from 'lodash'
import { categoriesMap } from '@/data/categories-data'

interface SupremeSearchEngineProps {
  onSearch?: (query: string, options?: Record<string, any>) => void
  onFilterChange?: (filters: Record<string, any>) => void
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
  async getQuickResults(query: string, options: Record<string, any> = {}) {
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

  async getExhaustiveResults(query: string, options: Record<string, any> = {}) {
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

export default function SupremeSearchEngine({
  onSearch,
  onFilterChange,
  className = '',
  variant = 'page',
  showFilters = true
}: SupremeSearchEngineProps) {
  const { searchState, setSearchState } = useSearch()
  const router = useRouter()
  
  // Estados principales
  const [query, setQuery] = useState(searchState.keyword || '')
  const [isFocused, setIsFocused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [quickResults, setQuickResults] = useState<any[]>([])
  const [showQuickResults, setShowQuickResults] = useState(false)
  
  // Estados para paneles activos
  const [activePanel, setActivePanel] = useState<'search' | 'category' | 'filters' | null>(null)
  
  // Estados para categorías
  const [categorySelection, setCategorySelection] = useState({
    category: null as any,
    subcategory: null as any,
    subsubcategory: null as any
  })
  const [categoryLevel, setCategoryLevel] = useState<'category' | 'subcategory' | 'subsubcategory'>('category')

  // Estados para funciones avanzadas
  const [isRecording, setIsRecording] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  // Referencias
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const recognition = useRef<any>(null)

  // Función de búsqueda rápida en tiempo real
  const debouncedQuickSearch = useCallback(
    debounce(async (searchQuery: string) => {
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
        setQuickResults(response.results)
        setShowQuickResults(true)
      } catch (error) {
        console.error('Error in quick search:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [searchState.category, searchState.location]
  )

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
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition()
        recognition.current.continuous = false
        recognition.current.interimResults = true
        recognition.current.lang = 'es-ES'

        recognition.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('')
          setQuery(transcript)
        }

        recognition.current.onend = () => {
          setIsRecording(false)
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
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      const mockTrending = [
        'Casa en venta Lima',
        'Departamento alquiler',
        'Auto usado Toyota',
        'Trabajo remoto',
        'Celular Samsung'
      ]

      const suggestionsList: SearchSuggestion[] = [
        ...recentSearches.slice(0, 3).map((search: string, i: number) => ({
          id: `recent-${i}`,
          text: search,
          type: 'recent' as const,
          icon: ClockIcon
        })),
        ...mockTrending.map((trend, i) => ({
          id: `trending-${i}`,
          text: trend,
          type: 'trending' as const,
          icon: FireIcon
        }))
      ]

      setSuggestions(suggestionsList)
    }

    loadSuggestions()
  }, [])

  // Manejo de búsqueda principal
  const handleMainSearch = async () => {
    if (!query.trim()) return

    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    const newRecentSearches = [query, ...recentSearches.filter((s: string) => s !== query)].slice(0, 10)
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))

    setSearchState(prev => ({ ...prev, keyword: query }))

    if (onSearch) {
      setIsLoading(true)
      try {
        const response = await searchAPI.getExhaustiveResults(query, {
          category: searchState.category,
          subcategory: searchState.subcategory,
          location: searchState.location
        })
        onSearch(query, {
          category: searchState.category,
          subcategory: searchState.subcategory,
          location: searchState.location,
          results: response.results,
          totalCount: response.totalCount
        })
      } catch (error) {
        console.error('Error in exhaustive search:', error)
      } finally {
        setIsLoading(false)
      }
    }

    setIsFocused(false)
    setIsExpanded(false)
  }

  // Búsqueda por voz
  const handleVoiceSearch = () => {
    if (!recognition.current) {
      alert('El reconocimiento de voz no está disponible en tu navegador')
      return
    }

    if (isRecording) {
      recognition.current.stop()
      setIsRecording(false)
    } else {
      setIsRecording(true)
      recognition.current.start()
    }
  }

  // Búsqueda por imagen
  const handleImageSearch = () => {
    if (selectedImage) {
      setSelectedImage(null)
    } else {
      imageInputRef.current?.click()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.')
        return
      }
      setSelectedImage(file)
      setQuery(`Búsqueda por imagen: ${file.name}`)
    }
  }

  // Búsqueda con IA
  const handleAiSearch = async () => {
    if (!query.trim()) return

    setIsAiThinking(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const aiEnhancedQuery = `IA: ${query} (mejorado con inteligencia artificial)`
    setQuery(aiEnhancedQuery)
    setIsAiThinking(false)
    
    setTimeout(() => handleMainSearch(), 500)
  }

  // Selección de sugerencia
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setTimeout(() => handleMainSearch(), 100)
  }

  // Click en resultado rápido
  const handleQuickResultClick = (result: any) => {
    router.push(`/buscar?q=${encodeURIComponent(result.title)}`)
  }

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
        setIsExpanded(false)
        setShowQuickResults(false)
        setActivePanel(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Funciones para manejar paneles
  const handleCategoryClick = () => {
    setActivePanel(activePanel === 'category' ? null : 'category')
    setIsExpanded(true)
    setIsFocused(false)
  }

  const handleFiltersClick = () => {
    setActivePanel(activePanel === 'filters' ? null : 'filters')
    setIsExpanded(true)
    setIsFocused(false)
  }

  const handleSearchFocus = () => {
    setActivePanel('search')
    setIsFocused(true)
    setIsExpanded(true)
  }

  // Funciones para navegación de categorías
  const handleCategorySelect = (item: any, level: string) => {
    const newSelection = { ...categorySelection }
    newSelection[level as keyof typeof categorySelection] = item
    
    const levels = ['category', 'subcategory', 'subsubcategory']
    const currentIndex = levels.indexOf(level)
    for (let i = currentIndex + 1; i < levels.length; i++) {
      newSelection[levels[i] as keyof typeof categorySelection] = null
    }
    
    setCategorySelection(newSelection)
    
    const nextLevel = levels[currentIndex + 1]
    if (nextLevel && item[nextLevel === 'subcategory' ? 'subcategories' : 'subcategories']) {
      setCategoryLevel(nextLevel as any)
    }
  }

  const getCategoryDataForLevel = (level: string) => {
    switch (level) {
      case 'category':
        return Object.values(categoriesMap)
      case 'subcategory':
        return categorySelection.category?.subcategories || []
      case 'subsubcategory':
        return categorySelection.subcategory?.subcategories || []
      default:
        return []
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Contenedor principal */}
      <div className="flex flex-col gap-4">
        {/* Barra de búsqueda principal */}
        <div className="flex items-center gap-4">
          {/* Selector de categoría */}
          <div className="flex-shrink-0">
            <button
              onClick={handleCategoryClick}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors shadow-sm border ${
                activePanel === 'category'
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
              <span>
                {categorySelection.subsubcategory?.name ||
                 categorySelection.subcategory?.name ||
                 categorySelection.category?.name ||
                 'Categoría'}
              </span>
            </button>
          </div>

          {/* Selector de filtros */}
          {(categorySelection.category || categorySelection.subcategory) && (
            <div className="flex-shrink-0">
              <button
                onClick={handleFiltersClick}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors shadow-sm border ${
                  activePanel === 'filters'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Filtros</span>
              </button>
            </div>
          )}

          {/* Filtros avanzados */}
          {searchState.category && (
            <div className="flex-shrink-0">
              <AdvancedFilters onFilterChange={onFilterChange} />
            </div>
          )}

          {/* Input de búsqueda */}
          <div className="relative flex-1">
            <div className={`relative flex items-center bg-white dark:bg-gray-800 rounded-xl transition-all duration-300 ${
              isFocused ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'
            }`}>
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-4" />
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleMainSearch()
                  }
                }}
                placeholder="Busca cualquier cosa... 🚀"
                className="flex-1 py-4 px-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
              />

              {/* Indicadores de estado */}
              <div className="flex items-center gap-2 mr-4">
                {isRecording && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-3 h-3 bg-red-500 rounded-full"
                  />
                )}
                
                {isAiThinking && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-5 h-5"
                  >
                    <SparklesIcon className="h-5 w-5 text-blue-500" />
                  </motion.div>
                )}

                {selectedImage && (
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CameraIcon className="h-4 w-4 text-blue-600" />
                  </div>
                )}

                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Archivo de imagen oculto */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Seleccionar imagen para búsqueda"
              title="Seleccionar imagen para búsqueda"
            />
          </div>

          {/* Botones avanzados */}
          <div className="flex items-center gap-2">
            {/* Búsqueda por voz */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceSearch}
              className={`p-3 rounded-xl transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
              }`}
              title="Búsqueda por voz"
            >
              <MicrophoneIcon className="h-5 w-5" />
            </motion.button>

            {/* Búsqueda por imagen */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImageSearch}
              className={`p-3 rounded-xl transition-all ${
                selectedImage 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
              }`}
              title="Búsqueda por imagen"
            >
              <CameraIcon className="h-5 w-5" />
            </motion.button>

            {/* Búsqueda con IA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAiSearch}
              disabled={isAiThinking || !query.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Búsqueda con IA"
            >
              <SparklesIcon className="h-5 w-5" />
            </motion.button>

            {/* Botón de búsqueda principal */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMainSearch}
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
              <span>Buscar</span>
            </motion.button>
          </div>
        </div>

        {/* Panel expandido con sugerencias y resultados rápidos */}
        <AnimatePresence>
          {(isFocused || isExpanded) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="max-h-96 overflow-y-auto">
                {/* Panel de búsqueda */}
                {activePanel === 'search' && (
                  <div>
                    {/* Filtros rápidos */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Filtros rápidos
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { icon: '📍', label: 'Ubicación', active: false },
                          { icon: '💰', label: 'Precio', active: false },
                          { icon: '⭐', label: 'Valoración', active: false },
                          { icon: '🕒', label: 'Más recientes', active: true }
                        ].map((filter, index) => (
                          <button
                            key={index}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              filter.active 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            <span>{filter.icon}</span>
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sección principal con tres columnas */}
                    <div className="grid grid-cols-3 gap-0 min-h-[300px]">
                      {/* Columna 1: Búsquedas recientes */}
                      <div className="p-4 border-r border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Búsquedas recientes
                          </span>
                        </div>
                        <div className="space-y-2">
                          {[
                            'Casa en venta en Inmuebles',
                            'Moto en Vehículos', 
                            'local',
                            'Trabajo en marketing',
                            'Laptop gaming'
                          ].map((recent, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionSelect({ id: `recent-${index}`, text: recent, type: 'recent' })}
                              className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <ClockIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {recent}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Columna 2: Sugerencias IA */}
                      <div className="p-4 border-r border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <SparklesIcon className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Sugerencias IA
                          </span>
                          <button className="ml-auto text-xs text-purple-600 hover:text-purple-700 font-medium">
                            Borrar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {[
                            { icon: '🏠', text: 'Departamentos con vista al mar', category: 'Inmuebles' },
                            { icon: '⚡', text: 'Autos eléctricos segunda mano', category: 'Vehículos' },
                            { icon: '🏗️', text: 'Terrenos construcción cerca ciudad', category: 'Inmuebles' },
                            { icon: '📷', text: 'Cámaras digitales profesionales', category: 'Electrónicos' }
                          ].map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionSelect({ id: `ai-${index}`, text: suggestion.text, type: 'ai' })}
                              className="w-full text-left p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-sm">{suggestion.icon}</span>
                                <div>
                                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
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
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Tendencias
                          </span>
                          <span className="ml-auto text-xs text-orange-600 font-medium">🔥</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { text: 'Casa en venta Lima', trend: 'up', growth: '+23%' },
                            { text: 'Departamento alquiler', trend: 'up', growth: '+18%' },
                            { text: 'Auto usado Toyota', trend: 'up', growth: '+15%' },
                            { text: 'Trabajo remoto', trend: 'hot', growth: 'HOT' },
                            { text: 'Celular Samsung', trend: 'up', growth: '+12%' }
                          ].map((trend, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionSelect({ id: `trend-${index}`, text: trend.text, type: 'trending' })}
                              className="w-full text-left p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    trend.trend === 'hot' ? 'bg-red-500' : 'bg-orange-500'
                                  }`} />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
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
                      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Resultados en tiempo real
                          </span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            {quickResults.length} encontrados
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {quickResults.slice(0, 4).map((result, index) => (
                            <button
                              key={result.id}
                              onClick={() => handleQuickResultClick(result)}
                              className="text-left p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-green-200 dark:border-green-800"
                            >
                              <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
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
                      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Sugerencias para "{query}"
                          </span>
                        </div>
                        <div className="space-y-1">
                          {[
                            `${query} en Lima`,
                            `${query} segunda mano`,
                            `${query} nuevo`,
                            `${query} barato`
                          ].map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionSelect({ id: `suggestion-${index}`, text: suggestion, type: 'ai' })}
                              className="w-full text-left p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <MagnifyingGlassIcon className="h-3 w-3 text-blue-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {suggestion}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer con acciones adicionales */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>💡 Tip: Usa comillas para búsquedas exactas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Búsqueda avanzada
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-xs text-gray-500 hover:text-gray-600">
                            Ayuda
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel de Categorías */}
                {activePanel === 'category' && (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Squares2X2Icon className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Seleccionar Categoría
                      </h3>
                    </div>

                    {/* Breadcrumbs de categoría */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      {[
                        categorySelection.category && { name: categorySelection.category.name, level: 'category' },
                        categorySelection.subcategory && { name: categorySelection.subcategory.name, level: 'subcategory' },
                        categorySelection.subsubcategory && { name: categorySelection.subsubcategory.name, level: 'subsubcategory' }
                      ].filter(Boolean).map((item: any, index, array) => (
                        <div key={index} className="flex items-center">
                          <span className="text-purple-600 font-medium">{item.name}</span>
                          {index < array.length - 1 && <span className="mx-2 text-gray-400">→</span>}
                        </div>
                      ))}
                    </div>

                    {/* Contenido de categorías en columnas */}
                    <div className="grid grid-cols-3 gap-6 min-h-[300px]">
                      {/* Categorías principales */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Categorías</h4>
                        {getCategoryDataForLevel('category').map((category: any) => (
                          <button
                            key={category.slug}
                            onClick={() => handleCategorySelect(category, 'category')}
                            className={`w-full text-left p-3 rounded-lg transition-colors border ${
                              categorySelection.category?.slug === category.slug
                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : 'border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-xs text-gray-500">{category.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Subcategorías */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Subcategorías</h4>
                        {categorySelection.category && getCategoryDataForLevel('subcategory').map((subcategory: any) => (
                          <button
                            key={subcategory.slug}
                            onClick={() => handleCategorySelect(subcategory, 'subcategory')}
                            className={`w-full text-left p-3 rounded-lg transition-colors border ${
                              categorySelection.subcategory?.slug === subcategory.slug
                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : 'border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {subcategory.icon && <span className="text-lg">{subcategory.icon}</span>}
                              <div>
                                <div className="font-medium">{subcategory.name}</div>
                                {subcategory.description && (
                                  <div className="text-xs text-gray-500 mt-1">{subcategory.description}</div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Sub-subcategorías */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Especializaciones</h4>
                        {categorySelection.subcategory && getCategoryDataForLevel('subsubcategory').map((subsubcategory: any) => (
                          <button
                            key={subsubcategory.slug}
                            onClick={() => handleCategorySelect(subsubcategory, 'subsubcategory')}
                            className={`w-full text-left p-3 rounded-lg transition-colors border ${
                              categorySelection.subsubcategory?.slug === subsubcategory.slug
                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : 'border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {subsubcategory.icon && <span className="text-lg">{subsubcategory.icon}</span>}
                              <div>
                                <div className="font-medium">{subsubcategory.name}</div>
                                {subsubcategory.description && (
                                  <div className="text-xs text-gray-500 mt-1">{subsubcategory.description}</div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel de Filtros */}
                {activePanel === 'filters' && (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AdjustmentsHorizontalIcon className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Filtros Avanzados
                      </h3>
                    </div>

                    <div className="text-center py-16 text-gray-500">
                      <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <p>Los filtros avanzados aparecerán aquí basados en la categoría seleccionada</p>
                      <p className="text-sm mt-2">Selecciona una categoría para ver filtros específicos</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 