'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Search } from 'lucide-react'
import { Tab } from '@headlessui/react'
import CategorySelector from './CategorySelector'
import { 
  FireIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import useMediaQuery from '@/hooks/useMediaQuery'

interface SearchHistoryItem {
  text: string
  categoryId?: string
  subcategoryId?: string
  subsubcategoryId?: string
}

interface Suggestion {
  text: string
  categoryId?: string
  subcategoryId?: string
  subsubcategoryId?: string
  score?: number
  trending?: boolean
  isAI?: boolean
}

interface AdvancedSearchBarProps {
  initialValue?: string
  onSearch: (query: string, options?: any) => void
  selectedCategory?: string
  selectedSubcategory?: string
  selectedSubSubcategory?: string
  onSelectCategory?: (category: string) => void
  onSelectSubcategory?: (subcategory: string) => void
  onSelectSubSubcategory?: (subsubcategory: string) => void
  placeholder?: string
  className?: string
  isSimpleMode?: boolean
}

// Función para generar sugerencias (simuladas para la demo)
const generateSuggestions = () => {
  const suggestions: Suggestion[] = []
  // Aquí iría lógica para generar sugerencias basadas en datos reales
  suggestions.push(
    { text: "Casa en venta en Inmuebles", categoryId: "inmuebles", subcategoryId: "casas", score: 100 },
    { text: "Departamento en alquiler en Inmuebles", categoryId: "inmuebles", subcategoryId: "departamentos", score: 95 },
    { text: "Terreno en Inmuebles", categoryId: "inmuebles", subcategoryId: "terrenos", score: 90 },
    { text: "Secretaria en Empleos", categoryId: "empleos", subcategoryId: "administrativo", score: 88 },
    { text: "Auto usado en Vehículos", categoryId: "vehiculos", subcategoryId: "autos", score: 85 },
    { text: "Local comercial en Inmuebles", categoryId: "inmuebles", subcategoryId: "locales", score: 82 },
    { text: "Programador en Empleos", categoryId: "empleos", subcategoryId: "informatica", score: 80 },
    { text: "Moto en Vehículos", categoryId: "vehiculos", subcategoryId: "motos", score: 78 }
  )
  return suggestions
}

const SUGGESTIONS = generateSuggestions()

export default function AdvancedSearchBar({
  initialValue = '',
  onSearch,
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  onSelectSubSubcategory,
  placeholder = "¿Qué estás buscando en BuscAdis?",
  className = "",
  isSimpleMode = false
}: AdvancedSearchBarProps) {
  // Estados para el modo de búsqueda
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>(isSimpleMode ? 'simple' : 'advanced')
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(SUGGESTIONS)
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const [trendingSearches, setTrendingSearches] = useState<Suggestion[]>([])
  const [isRecording, setIsRecording] = useState(false)
  
  // Estados para las categorías seleccionadas
  const [activeCategory, setActiveCategory] = useState<string | undefined>(selectedCategory)
  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>(selectedSubcategory)
  const [activeSubSubcategory, setActiveSubSubcategory] = useState<string | undefined>(selectedSubSubcategory)
  
  // Referencias a elementos del DOM
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  
  // Media queries
  const isMd = useMediaQuery('(min-width: 768px)')
  
  // Cargar datos iniciales
  useEffect(() => {
    // Cargar búsquedas recientes del localStorage
    const savedSearches = localStorage.getItem('recentSearches')
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 5))
    }

    // Simulamos cargar búsquedas tendencia
    const trending = SUGGESTIONS.filter(s => s.categoryId).map(s => ({
      ...s,
      score: 90,
      trending: true
    })).slice(0, 3);
    setTrendingSearches(trending)
  }, [])
  
  // Efecto para actualizar sugerencias basadas en el término de búsqueda
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(SUGGESTIONS)
    }
  }, [searchTerm])
  
  // Efecto para detectar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current && 
        !searchBarRef.current.contains(event.target as Node) &&
        !suggestionsRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])
  
  // Sincronizar estados de categoría con props
  useEffect(() => {
    setActiveCategory(selectedCategory)
  }, [selectedCategory])
  
  useEffect(() => {
    setActiveSubcategory(selectedSubcategory)
  }, [selectedSubcategory])
  
  useEffect(() => {
    setActiveSubSubcategory(selectedSubSubcategory)
  }, [selectedSubSubcategory])
  
  // Manejadores de eventos
  const handleSearch = (query: string, options: any = {}) => {
    // Construir opciones completas con categorías seleccionadas
    const searchOptions = {
      ...options,
      category: activeCategory || options.category,
      subcategory: activeSubcategory || options.subcategory,
      subsubcategory: activeSubSubcategory || options.subsubcategory
    }
    
    // Guardar en búsquedas recientes
    const searchItem: SearchHistoryItem = {
      text: query,
      categoryId: searchOptions.category,
      subcategoryId: searchOptions.subcategory,
      subsubcategoryId: searchOptions.subsubcategory
    }
    
    const updatedSearches = [
      searchItem,
      ...recentSearches.filter(s => s.text !== query)
    ].slice(0, 5)
    
    setRecentSearches(updatedSearches)
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
    
    // Ejecutar la búsqueda
    onSearch(query, searchOptions)
    setIsFocused(false)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      handleSearch(searchTerm)
    }
  }
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setActiveSubcategory(undefined)
    setActiveSubSubcategory(undefined)
    
    if (onSelectCategory) {
      onSelectCategory(category)
    }
  }
  
  const handleSubcategoryChange = (subcategory: string) => {
    setActiveSubcategory(subcategory)
    setActiveSubSubcategory(undefined)
    
    if (onSelectSubcategory) {
      onSelectSubcategory(subcategory)
    }
  }
  
  const handleSubSubcategoryChange = (subsubcategory: string) => {
    setActiveSubSubcategory(subsubcategory)
    
    if (onSelectSubSubcategory) {
      onSelectSubSubcategory(subsubcategory)
    }
  }
  
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSearchTerm(suggestion.text)
    
    if (suggestion.categoryId && onSelectCategory) {
      setActiveCategory(suggestion.categoryId)
      onSelectCategory(suggestion.categoryId)
    }
    
    if (suggestion.subcategoryId && onSelectSubcategory) {
      setActiveSubcategory(suggestion.subcategoryId)
      onSelectSubcategory(suggestion.subcategoryId)
    }
    
    if (suggestion.subsubcategoryId && onSelectSubSubcategory) {
      setActiveSubSubcategory(suggestion.subsubcategoryId)
      onSelectSubSubcategory(suggestion.subsubcategoryId)
    }
    
    handleSearch(suggestion.text, {
      category: suggestion.categoryId,
      subcategory: suggestion.subcategoryId,
      subsubcategory: suggestion.subsubcategoryId
    })
  }
  
  // Renderizar barra de búsqueda avanzada tipo Airbnb
  const renderAdvancedSearchBar = () => (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Tab.Group>
        <div className="flex flex-col">
          <div className="flex items-center p-1 rounded-full">
            {/* Selector de categoría */}
            <div
              className={`flex-1 flex items-center border-r border-slate-200 dark:border-slate-700 p-3 cursor-pointer ${activeCategory ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium mb-1">Clasificación</span>
                <span className="font-medium truncate">
                  {activeCategory ? activeCategory : 'Todas las categorías'}
                </span>
                {(activeSubcategory || activeSubSubcategory) && (
                  <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1">
                    {activeSubcategory && <span>{activeSubcategory}</span>}
                    {activeSubcategory && activeSubSubcategory && <span>•</span>}
                    {activeSubSubcategory && <span>{activeSubSubcategory}</span>}
                  </div>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            
            {/* Barra de búsqueda de palabras clave */}
            <div className="flex-1 px-3 py-2">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Palabras clave
                  </label>
                  <div className="flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      placeholder="¿Qué buscas?"
                      className="w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
                      disabled={isRecording}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label="Borrar texto de búsqueda"
                        title="Borrar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            {/* Botón de búsqueda */}
            <button
              onClick={() => handleSearch(searchTerm)}
              className="flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-600 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <Search className="w-5 h-5" />
              <span className="ml-2 font-medium">Buscar</span>
            </button>
          </div>
          
          {/* Panel expandible para el selector de categorías */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 overflow-hidden"
              >
                <CategorySelector
                  activeCategory={activeCategory}
                  activeSubcategory={activeSubcategory}
                  activeSubSubcategory={activeSubSubcategory}
                  onCategoryChange={handleCategoryChange}
                  onSubcategoryChange={handleSubcategoryChange}
                  onSubSubcategoryChange={handleSubSubcategoryChange}
                  showCounts={true}
                  variant="inline"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tab.Group>
      
      {/* Panel de sugerencias */}
      <AnimatePresence>
        {isFocused && !isExpanded && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
          >
            {/* Panel de búsquedas recientes */}
            {recentSearches.length > 0 && !searchTerm && (
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Búsquedas recientes
                  </h3>
                  <button 
                    className="text-xs text-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
                    onClick={() => {
                      setRecentSearches([])
                      localStorage.removeItem('recentSearches')
                    }}
                  >
                    Limpiar
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(item.text)
                        if (item.categoryId) setActiveCategory(item.categoryId)
                        if (item.subcategoryId) setActiveSubcategory(item.subcategoryId)
                        if (item.subsubcategoryId) setActiveSubSubcategory(item.subsubcategoryId)
                        handleSearch(item.text, {
                          category: item.categoryId,
                          subcategory: item.subcategoryId,
                          subsubcategory: item.subsubcategoryId
                        })
                      }}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center"
                    >
                      <span>{item.text}</span>
                      {item.categoryId && (
                        <span className="ml-2 px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-xs">
                          {item.categoryId}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Panel de búsquedas tendencia */}
            {trendingSearches.length > 0 && !searchTerm && (
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center mb-3">
                  <FireIcon className="h-4 w-4 mr-1 text-orange-500" />
                  Tendencias
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trendingSearches.map((trend, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionSelect(trend)}
                      className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mr-3">
                          <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{trend.text}</span>
                      </div>
                      
                      {trend.score && (
                        <span className="text-xs text-orange-500 dark:text-orange-400 flex items-center">
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                          {trend.score}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sugerencias de búsqueda */}
            {filteredSuggestions.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center mb-3">
                  {searchTerm ? (
                    <>
                      <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                      Resultados para "{searchTerm}"
                    </>
                  ) : (
                    <>
                      <span className="text-lg mr-1">✨</span>
                      Sugerencias para ti
                    </>
                  )}
                </h3>
                
                <div className="space-y-2">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center">
                        {suggestion.isAI ? (
                          <div className="flex-shrink-0 p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mr-3">
                            <span className="text-lg">✨</span>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 p-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full mr-3">
                            <MagnifyingGlassIcon className="h-4 w-4" />
                          </div>
                        )}
                        <span className="text-slate-700 dark:text-slate-300">
                          {suggestion.isAI ? (
                            <span className="flex items-center">
                              {suggestion.text}
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">IA</span>
                            </span>
                          ) : (
                            suggestion.text
                          )}
                        </span>
                      </div>
                      
                      {suggestion.categoryId && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          {suggestion.categoryId}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mensaje cuando no hay resultados */}
            {searchTerm && filteredSuggestions.length === 0 && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-3">
                  <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                  No se encontraron resultados
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Intenta con otros términos o categorías
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  
  // Renderizar barra de búsqueda simple (modo mobile o compacto)
  const renderSimpleSearchBar = () => (
    <div 
      className="relative w-full"
      onClick={() => {
        if (isSimpleMode) {
          setSearchMode('advanced')
          setTimeout(() => setIsExpanded(true), 300)
        }
      }}
    >
      <div className="flex items-center bg-white dark:bg-slate-900 rounded-full shadow-lg hover:shadow-xl transition-all p-1">
        <div className="flex items-center flex-1 px-4 py-2">
          <Search className="h-5 w-5 text-slate-400 mr-2" />
          <span className="text-slate-600 dark:text-slate-400">
            {activeCategory ? (
              <span className="flex items-center">
                <span className="font-medium text-teal-600 dark:text-teal-400">{activeCategory}</span>
                {activeSubcategory && (
                  <>
                    <span className="mx-1 text-slate-400">•</span>
                    <span>{activeSubcategory}</span>
                  </>
                )}
              </span>
            ) : placeholder}
          </span>
        </div>
        <button 
          className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-full shadow-md transition-colors"
          aria-label="Iniciar búsqueda"
          title="Buscar"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
  
  return (
    <div
      ref={searchBarRef}
      className={`relative ${className}`}
    >
      <AnimatePresence mode="wait">
        {searchMode === 'advanced' ? (
          <motion.div
            key="advanced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderAdvancedSearchBar()}
          </motion.div>
        ) : (
          <motion.div
            key="simple"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSimpleSearchBar()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 