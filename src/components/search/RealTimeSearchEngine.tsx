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
      iconPath: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z'
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
                    onCategoryChange(category.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm ${
                    selectedCategory === category.id || (category.id === 'all' && selectedCategory === 'all')
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
    
    return () => {
      debouncedSearch.cancel()
    }
  }, [inputValue, debouncedSearch])

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