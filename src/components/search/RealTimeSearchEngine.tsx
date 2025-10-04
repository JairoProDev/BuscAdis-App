'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

// Implementación propia de debounce
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): T & { cancel: () => void } {
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
  onSearch?: (query: string, filters?: Record<string, unknown>) => void;
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
  onCategoryChange
}: {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}) => {
  const [showCategoryBar, setShowCategoryBar] = useState(false)
  
  const categories = [
    { 
      id: 'all', 
      name: 'Todos', 
      icon: '🌐',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200 hover:border-blue-300'
    },
    { 
      id: 'empleos', 
      name: 'Empleos', 
      icon: '💼',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      borderColor: 'border-emerald-200 hover:border-emerald-300'
    },
    { 
      id: 'inmuebles', 
      name: 'Inmuebles', 
      icon: '🏠',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200 hover:border-orange-300'
    },
    { 
      id: 'vehiculos', 
      name: 'Vehículos', 
      icon: '🚛',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-50 hover:bg-red-100',
      borderColor: 'border-red-200 hover:border-red-300'
    },
    { 
      id: 'servicios', 
      name: 'Servicios', 
      icon: '🔧',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200 hover:border-purple-300'
    },
    { 
      id: 'productos', 
      name: 'Productos', 
      icon: '🛍️',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200 hover:border-green-300'
    },
    { 
      id: 'negocios', 
      name: 'Negocios', 
      icon: '📊',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      borderColor: 'border-indigo-200 hover:border-indigo-300'
    },
    { 
      id: 'eventos', 
      name: 'Eventos', 
      icon: '📅',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      borderColor: 'border-pink-200 hover:border-pink-300'
    },
    { 
      id: 'comunidad', 
      name: 'Comunidad', 
      icon: '👥',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50 hover:bg-teal-100',
      borderColor: 'border-teal-200 hover:border-teal-300'
    }
  ]
  
  const currentCategory = categories.find(cat => cat.id === selectedCategory) || categories[0]
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowCategoryBar(!showCategoryBar)}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 ${currentCategory.bgColor} ${currentCategory.borderColor} border-2`}
        title="Seleccionar categoría"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${currentCategory.color}`}>
          <span className="text-white text-sm">{currentCategory.icon}</span>
        </div>
        <span className="hidden sm:inline text-sm max-w-[80px] truncate font-medium">
          {currentCategory.name}
        </span>
        <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showCategoryBar ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showCategoryBar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowCategoryBar(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 mt-2 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-2 justify-center lg:justify-start">
                    {categories.map((category) => {
                      const isSelected = selectedCategory === category.id || (category.id === 'all' && selectedCategory === 'all')
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            onCategoryChange(category.id)
                            setShowCategoryBar(false)
                          }}
                          className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all duration-300 
                            flex flex-col items-center justify-center gap-2
                            ${isSelected 
                              ? `${category.bgColor} ${category.borderColor} shadow-lg scale-105 ring-2 ring-teal-500/50` 
                              : `${category.bgColor} ${category.borderColor} hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-teal-300/50`
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${category.color}`}>
                            <span className="text-white text-sm">{category.icon}</span>
                          </div>
                          <span className={`text-xs font-medium text-center leading-tight ${
                            isSelected 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {category.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RealTimeSearchEngine({
  onSearch,
  onResultSelect,
  placeholder = '¿Qué estás buscando?',
  showFilters = true,
  variant = 'header',
  selectedCategory,
  onCategoryChange,
}: RealTimeSearchEngineProps) {
  const router = useRouter()
  const { addRecentSearch, trackSearch } = useSearch()
  
  const [inputValue, setInputValue] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [quickResults, setQuickResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Optimized search function with better debouncing
  const debouncedSearch = useMemo(
    () => debounce(async (...args: unknown[]) => {
      const query = args[0] as string;
      if (query.length < 2) {
        setSuggestions([]);
        setQuickResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Parallel requests for better performance
        const [suggestionsRes, quickRes] = await Promise.all([
          fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&category=${selectedCategory}&limit=6`),
          fetch(`/api/publications?query=${encodeURIComponent(query)}&category=${selectedCategory}&limit=5`)
        ]);

        const [suggestionsData, quickData] = await Promise.all([
          suggestionsRes.json(),
          quickRes.json()
        ]);

        setSuggestions(suggestionsData.suggestions || []);
        
        const formattedResults = (quickData.publications || []).map((pub: any) => ({
          id: pub._id || pub.id,
          title: pub.title || 'Sin título',
          description: pub.description || '',
          category: pub.categorySlug || pub.category || 'general',
          price: pub.price || pub.amount || 0,
          location: pub.location || 'Sin ubicación',
          image: pub.images?.[0] || '/images/placeholder-image.jpg'
        }));
        
        setQuickResults(formattedResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setQuickResults([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [selectedCategory]
  );

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    if (inputValue.trim()) {
      debouncedSearch(inputValue.trim())
    } else {
      setSuggestions([])
      setQuickResults([])
    }
  }, [inputValue]) // Removido debouncedSearch de las dependencias

  // Manejar clicks fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setIsInputFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, []) // Remove setter functions from dependencies

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
      router.push(`/adisos/${result.id}/${slug}`)
    }
  }

  const performSearch = async (query?: string) => {
    const searchQuery = query || inputValue.trim()
    
    if (!searchQuery) return

    // Tracking de búsqueda
    addRecentSearch(searchQuery, selectedCategory)
    trackSearch(searchQuery, selectedCategory, quickResults.length)
    
    // Actualizar historial local
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))

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

  // Estados para reconocimiento de voz
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  // Estado para historial de búsqueda
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  // Cargar historial al montar componente
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading search history:', error)
      }
    }
  }, [])

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Reconocimiento de voz no disponible');
      return;
    }

    try {
      const SpeechRecognitionConstructor = (window.SpeechRecognition || window.webkitSpeechRecognition) as new () => SpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      recognitionRef.current.lang = 'es-PE';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.continuous = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        performSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        console.error('Error de reconocimiento de voz:', event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error iniciando reconocimiento de voz:', error);
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div ref={suggestionsRef} className="relative w-full max-w-4xl mx-auto">
      {/* Barra de búsqueda principal */}
      <div className={`relative flex items-center ${
        variant === 'header' ? 'h-10' : variant === 'compact' ? 'h-12' : 'h-14'
      } bg-white dark:bg-gray-800 border rounded-xl shadow-lg transition-all duration-300 ${
        isListening 
          ? 'border-red-400 ring-2 ring-red-400/50 shadow-xl shadow-red-400/20 bg-red-50/30 dark:bg-red-900/10' 
          : isInputFocused 
            ? 'border-teal-500 ring-2 ring-teal-500 shadow-xl shadow-teal-500/20' 
            : 'border-teal-500/60 ring-1 ring-teal-500/40 hover:ring-2 hover:ring-teal-400/60 shadow-teal-500/10'
      }`}>
        
        {/* Selector de categoría compacto */}
        {showFilters && variant !== 'compact' && onCategoryChange && (
          <>
            <div className="flex-shrink-0 pl-3">
              <CompactCategorySelector
                selectedCategory={selectedCategory || ''}
                onCategoryChange={onCategoryChange}
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
            placeholder={isListening ? "🎤 Escuchando tu voz..." : placeholder}
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
            
            {/* Botón de micrófono con diseño elegante */}
            <button
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              className={`relative p-2 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400' 
                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:scale-105'
              }`}
              title={isListening ? 'Detener grabación - Click para parar' : 'Buscar por voz'}
            >
              {/* Indicador de grabación sutil */}
              {isListening && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                </div>
              )}
              
              <svg 
                className={`h-5 w-5 transition-transform duration-300 ${isListening ? 'scale-110' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isListening ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                )}
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
        
        {/* Indicador de estado de grabación elegante */}
        {isListening && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                Escuchando...
              </span>
              <button
                onClick={stopVoiceSearch}
                className="text-xs bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded-full transition-colors"
              >
                Parar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel de sugerencias y resultados mejorado */}
      <AnimatePresence>
        {showSuggestions && isInputFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Buscando...
                </div>
              </div>
            )}

            {/* Mobile: Layout optimizado */}
            <div className="lg:hidden">
              {/* Sugerencias e Historial lado a lado en mobile */}
              <div className="grid grid-cols-2 gap-0 border-b border-gray-100 dark:border-gray-700">
                
                {/* Columna izquierda: Sugerencias */}
                <div className="border-r border-gray-100 dark:border-gray-700">
                  {suggestions.length > 0 && (
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-3 w-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Sugerencias
                        </span>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {suggestions.slice(0, 4).map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full text-left p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-xs transition-colors"
                          >
                            <span className="text-gray-900 dark:text-white block truncate">
                              {suggestion.text}
                            </span>
                            {suggestion.category && (
                              <span className="text-xs text-gray-500 truncate">
                                en {suggestion.category}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna derecha: Historial */}
                <div>
                  {searchHistory.length > 0 && (
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-3 w-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Recientes
                        </span>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {searchHistory.slice(0, 4).map((historyItem) => (
                                                  <button
                          key={`mobile-history-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                          onClick={() => setInputValue(historyItem)}
                            className="w-full text-left p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-xs transition-colors"
                          >
                            <span className="text-gray-600 dark:text-gray-300 block truncate">
                              {historyItem}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resultados rápidos móvil con scroll funcional */}
              <div className="max-h-64 overflow-y-auto">
                {quickResults.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
                          <Image
                            src={result.image}
                            alt={result.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            // onError no soportado por next/image
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
              </div>
            </div>

            {/* Desktop: Layout de 2 columnas */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-0 max-h-96 overflow-hidden">
              
              {/* Columna izquierda: Sugerencias e Historial */}
              <div className="border-r border-gray-100 dark:border-gray-700 max-h-96 overflow-y-auto">
                
                {/* Sugerencias */}
                {suggestions.length > 0 && (
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sugerencias
                      </span>
                    </div>
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={`suggestion-${suggestion.id || index}-${suggestion.text.substring(0, 10)}`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          {suggestion.type === 'recent' && (
                            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {suggestion.type === 'trending' && (
                            <svg className="h-4 w-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          )}
                          {suggestion.type === 'ai' && (
                            <svg className="h-4 w-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          )}
                          {suggestion.type === 'category' && (
                            <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          )}
                          
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historial de búsqueda */}
                {searchHistory.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Búsquedas recientes
                      </span>
                      <button
                        onClick={() => {
                          setSearchHistory([])
                          localStorage.removeItem('searchHistory')
                        }}
                        className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        Limpiar
                      </button>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.slice(0, 5).map((historyItem) => (
                        <button
                          key={`history-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                          onClick={() => setInputValue(historyItem)}
                          className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                        >
                          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {historyItem}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Columna derecha: Resultados rápidos */}
              <div className="max-h-96 overflow-y-auto">
                {quickResults.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
                          <Image
                            src={result.image}
                            alt={result.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            // onError no soportado por next/image
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

                {/* Estado vacío solo para desktop en columna derecha */}
                {quickResults.length === 0 && inputValue.trim() && !isLoading && (
                  <div className="p-8 text-center text-gray-400">
                    <svg className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm">Escribe para ver resultados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estado vacío general para mobile */}
            {!isLoading && suggestions.length === 0 && quickResults.length === 0 && searchHistory.length === 0 && !inputValue.trim() && (
              <div className="p-8 text-center text-gray-500 lg:hidden">
                <svg className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>Empieza a escribir para buscar</p>
                <p className="text-sm text-gray-400">Encuentra lo que necesitas</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 