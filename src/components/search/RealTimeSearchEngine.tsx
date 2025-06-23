'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import CompactCategorySelector from './CompactCategorySelector'
import { 
  MagnifyingGlassIcon,
  MicrophoneIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  FunnelIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { debounce } from 'lodash'

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
          <div className="flex-shrink-0">
            <CompactCategorySelector
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={onCategoryChange}
              onSubcategoryChange={onSubcategoryChange}
            />
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 ml-3"></div>
          </div>
        )}

        {/* Input de búsqueda */}
        <div className="flex-1 flex items-center px-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            autoComplete="off"
          />
          
          {/* Botones de acción */}
          <div className="flex items-center gap-2 ml-3">
            {inputValue && (
              <button
                onClick={clearInput}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <XMarkIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
            
            <button
              onClick={handleVoiceSearch}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Búsqueda por voz"
            >
              <MicrophoneIcon className="h-4 w-4 text-gray-400" />
            </button>
            
            <button
              onClick={() => performSearch()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Buscar
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
                    <SparklesIcon className="h-4 w-4 text-purple-500" />
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
                        {suggestion.type === 'recent' && <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                        {suggestion.type === 'trending' && <FireIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />}
                        {suggestion.type === 'ai' && <SparklesIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />}
                        {suggestion.type === 'category' && <TagIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        
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
                    <MagnifyingGlassIcon className="h-4 w-4 text-green-500" />
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
                              <MapPinIcon className="h-3 w-3" />
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
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
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