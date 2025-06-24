'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

// Implementación propia de debounce
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T & { cancel: () => void }
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  return debounced
}

interface Suggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'ai' | 'category';
  category?: string;
  count?: number;
  score?: number;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  image: string;
}

interface RealTimeSearchEngineProps {
  onSearch?: (query: string, filters?: Record<string, any>) => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
  variant?: 'header' | 'page' | 'compact';
  selectedCategory?: string;
  selectedSubcategory?: string;
  onCategoryChange?: (category: string) => void;
  onSubcategoryChange?: (subcategory: string) => void;
}

// Componente CompactCategorySelector interno mejorado
const CompactCategorySelector = ({ 
  selectedCategory, 
  selectedSubcategory, 
  onCategoryChange, 
  onSubcategoryChange 
}: {
  selectedCategory: string
  selectedSubcategory: string
  onCategoryChange: (category: string) => void
  onSubcategoryChange: (subcategory: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const categories = [
    { 
      id: 'all', 
      name: 'Todas', 
      iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    { 
      id: 'empleos', 
      name: 'Empleos', 
      iconPath: 'M20 7a2 2 0 002-2V4a2 2 0 00-2-2h-3.28a1 1 0 01-.948-.684l-.684-2.051A1 1 0 0014.72 2H9.28a1 1 0 00-.948.684l-.684 2.051A1 1 0 016.72 4H4a2 2 0 00-2 2v1a2 2 0 002 2h16z M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9'
    },
    { 
      id: 'inmuebles', 
      name: 'Inmuebles', 
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    { 
      id: 'vehiculos', 
      name: 'Vehículos', 
      iconPath: 'M7 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM5 17h2m4 0h4m4 0h2v-3a1 1 0 00-1-1h-1l-1-2a1 1 0 00-.9-.6H9.9a1 1 0 00-.9.6l-1 2H7a1 1 0 00-1 1v3z'
    },
    { 
      id: 'servicios', 
      name: 'Servicios', 
      iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    },
    { 
      id: 'productos', 
      name: 'Productos', 
      iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    },
    { 
      id: 'eventos', 
      name: 'Eventos', 
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    { 
      id: 'negocios', 
      name: 'Negocios', 
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
  ]
  
  const currentCategory = categories.find(cat => cat.id === selectedCategory) || categories[0]
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
        title="Seleccionar categoría"
      >
        {/* Icono apropiado en lugar de emoji lupa */}
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="hidden sm:inline text-sm max-w-[80px] truncate">
          {currentCategory.name}
        </span>
        <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.id === 'all' ? '' : category.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm ${
                    selectedCategory === category.id || (category.id === 'all' && !selectedCategory)
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.iconPath} />
                  </svg>
                  <span>{category.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RealTimeSearchEngine({
  onSearch,
  onResultSelect,
  placeholder = "¿Qué estás buscando?",
  showFilters = true,
  variant = 'page',
  selectedCategory = 'all',
  selectedSubcategory = '',
  onCategoryChange,
  onSubcategoryChange
}: RealTimeSearchEngineProps) {
  const router = useRouter()
  const { searchState, updateSearch, addRecentSearch, trackSearch } = useSearch()
  
  const [inputValue, setInputValue] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [quickResults, setQuickResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Búsqueda en tiempo real con debounce
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        setIsLoading(true)
        try {
          // Obtener sugerencias
          const suggestionsRes = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&category=${selectedCategory}&limit=6`)
          const suggestionsData = await suggestionsRes.json()
          setSuggestions(suggestionsData.suggestions || [])

          // Obtener resultados rápidos
          const quickRes = await fetch(`/api/publications?query=${encodeURIComponent(query)}&category=${selectedCategory}&limit=5`)
          const quickData = await quickRes.json()
          
          const formattedResults = (quickData.publications || []).map((pub: any) => ({
            id: pub._id || pub.id,
            title: pub.title || 'Sin título',
            description: pub.description || '',
            category: pub.categorySlug || pub.category || 'general',
            price: pub.price || pub.amount || 0,
            location: pub.location || 'Sin ubicación',
            image: pub.images?.[0] || '/images/placeholder-image.jpg'
          }))
          
          setQuickResults(formattedResults)
        } catch (error) {
          console.error('Error in real-time search:', error)
          setSuggestions([])
          setQuickResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setQuickResults([])
      }
    }, 300),
    [selectedCategory]
  )

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    if (inputValue.trim()) {
      debouncedSearch(inputValue.trim())
    } else {
      setSuggestions([])
      setQuickResults([])
    }
    
    return () => {
      debouncedSearch.cancel()
    }
  }, [inputValue, debouncedSearch])

  // Manejar clicks fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setIsInputFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    // updateSearch({ query: value }) // Comentado temporalmente para evitar conflictos
    
    if (value.trim()) {
      setShowSuggestions(true)
    }
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setShowSuggestions(true)
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setInputValue(suggestion.text)
    // updateSearch({ query: suggestion.text }) // Comentado temporalmente para evitar conflictos
    addRecentSearch(suggestion.text, selectedCategory)
    setShowSuggestions(false)
    
    // Ejecutar búsqueda
    performSearch(suggestion.text)
  }

  const handleResultSelect = (result: SearchResult) => {
    setShowSuggestions(false)
    
    if (onResultSelect) {
      onResultSelect(result)
    } else {
      // Navegar al detalle del resultado
      const slug = result.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      router.push(`/anuncios/${result.id}/${slug}`)
    }
  }

  const performSearch = async (query?: string) => {
    const searchQuery = query || inputValue.trim()
    
    if (!searchQuery) return

    // Tracking de búsqueda
    addRecentSearch(searchQuery, selectedCategory)
    trackSearch(searchQuery, selectedCategory, quickResults.length)

    setShowSuggestions(false)

    if (onSearch) {
      onSearch(searchQuery, { category: selectedCategory })
    } else {
      // Navegar a página de resultados
      const params = new URLSearchParams()
      params.set('q', searchQuery)
      if (selectedCategory) params.set('category', selectedCategory)
      
      router.push(`/buscar?${params.toString()}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      performSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const clearInput = () => {
    setInputValue('')
    setSuggestions([])
    setQuickResults([])
    inputRef.current?.focus()
    // No llamar updateSearch aquí para evitar conflictos con filtros
  }

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'es-ES'
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        performSearch(transcript)
      }
      recognition.start()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* Barra de búsqueda principal */}
      <div className={`relative flex items-center ${
        variant === 'header' ? 'h-10' : variant === 'compact' ? 'h-12' : 'h-14'
      } bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg transition-all duration-200 ${
        isInputFocused ? 'ring-2 ring-blue-500 border-blue-500 shadow-xl' : 'hover:border-gray-400 dark:hover:border-gray-500'
      }`}>
        
        {/* Selector de categoría compacto */}
        {showFilters && variant !== 'compact' && onCategoryChange && onSubcategoryChange && (
          <>
            <div className="flex-shrink-0 pl-3">
              <CompactCategorySelector
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                onCategoryChange={onCategoryChange}
                onSubcategoryChange={onSubcategoryChange}
              />
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          </>
        )}

        {/* Input de búsqueda */}
        <div className="flex-1 flex items-center px-4">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            autoComplete="off"
          />
          
          {/* Botones de acción */}
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {inputValue && (
              <button
                onClick={clearInput}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Limpiar búsqueda"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Botón de micrófono (voz) */}
            <button
              onClick={handleVoiceSearch}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Búsqueda por voz"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            {/* Botón de cámara (búsqueda visual) */}
            <button
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Búsqueda visual"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Botón de IA (sugerencias inteligentes) */}
            <button
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Sugerencias IA"
            >
              <span className="text-lg">✨</span>
            </button>
            
            {/* Botón de búsqueda principal - LUPA GRANDE */}
            <button
              onClick={() => performSearch()}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
              title="Buscar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de sugerencias y resultados */}
      <AnimatePresence>
        {showSuggestions && isInputFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              
              {/* Loading state */}
              {isLoading && (
                <div className="p-4 text-center">
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Buscando...
                  </div>
                </div>
              )}

              {/* Sugerencias */}
              {suggestions.length > 0 && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Sugerencias
                    </span>
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        {suggestion.type === 'recent' && <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>}
                        {suggestion.type === 'trending' && <svg className="h-4 w-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>}
                        {suggestion.type === 'ai' && <svg className="h-4 w-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>}
                        {suggestion.type === 'category' && <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>}
                        
                        <div className="flex-1">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {suggestion.text}
                          </span>
                          {suggestion.category && (
                            <span className="text-xs text-gray-500 ml-2">
                              en {suggestion.category}
                            </span>
                          )}
                        </div>
                        
                        {suggestion.count && (
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {suggestion.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultados rápidos */}
              {quickResults.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Resultados rápidos
                    </span>
                    <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                      {quickResults.length} encontrados
                    </span>
                  </div>
                  <div className="space-y-2">
                    {quickResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultSelect(result)}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-start gap-3"
                      >
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-blue-600">
                              S/ {result.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {result.location}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => performSearch()}
                      className="w-full p-2 text-center text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                    >
                      Ver todos los resultados →
                    </button>
                  </div>
                </div>
              )}

              {/* Estado vacío */}
              {!isLoading && suggestions.length === 0 && quickResults.length === 0 && inputValue.trim() && (
                <div className="p-8 text-center text-gray-500">
                  <svg className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p>No se encontraron sugerencias</p>
                  <p className="text-sm">Presiona Enter para buscar "{inputValue}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 