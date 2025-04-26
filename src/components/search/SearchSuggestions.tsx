'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, Clock, Sparkles, X, Tag, Filter, MapPin, Star, Flame } from 'lucide-react'
import Image from 'next/image'

interface SearchSuggestionsProps {
  searchTerm: string
  onSelectSuggestion: (suggestion: string) => void
  appearance?: 'light' | 'dark'
  position?: 'top' | 'bottom'
}

interface SuggestionItem {
  text: string
  type: 'autocomplete' | 'trending' | 'history' | 'ai'
  category?: string
  categoryIcon?: string
  count?: number
}

export default function SearchSuggestions({
  searchTerm,
  onSelectSuggestion,
  appearance = 'light',
  position = 'bottom',
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [trendingSearches, setTrendingSearches] = useState<SuggestionItem[]>([])
  const [searchHistory, setSearchHistory] = useState<SuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Fetch suggestions from API based on search term
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchTerm)}`)
        const data = await response.json()
        
        if (data.suggestions) {
          setSuggestions(data.suggestions.map((text: string) => ({
            text,
            type: 'autocomplete'
          })))
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    // Debounce to avoid excessive API calls
    const handler = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(handler)
  }, [searchTerm])
  
  // Load trending searches on component mount
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const response = await fetch('/api/search/trending')
        const data = await response.json()
        
        if (data.trending) {
          setTrendingSearches(data.trending.map((text: string) => ({
            text,
            type: 'trending'
          })))
        }
      } catch (error) {
        console.error('Error fetching trending searches:', error)
      }
    }
    
    fetchTrendingSearches()
  }, [])
  
  // Load search history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('searchHistory')
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        setSearchHistory(parsedHistory.map((text: string) => ({
          text,
          type: 'history'
        })))
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }, [])
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const allItems = [...suggestions, ...trendingSearches, ...searchHistory, ...aiSuggestions]
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev < allItems.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : allItems.length - 1
          )
          break
        case 'Enter':
          if (highlightedIndex >= 0 && highlightedIndex < allItems.length) {
            e.preventDefault()
            onSelectSuggestion(allItems[highlightedIndex].text)
          }
          break
        case 'Escape':
          e.preventDefault()
          setHighlightedIndex(-1)
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [suggestions, trendingSearches, searchHistory, highlightedIndex, onSelectSuggestion])
  
  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.querySelector(`[data-index="${highlightedIndex}"]`)
      highlightedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])
  
  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions, trendingSearches, searchHistory])
  
  // Prepare all items to display
  const allItems = [
    ...(searchTerm ? suggestions.map((item, index) => ({ ...item, dataIndex: index })) : []),
    ...(!searchTerm ? trendingSearches.map((item, index) => ({ ...item, dataIndex: suggestions.length + index })) : []),
    ...(!searchTerm ? searchHistory.map((item, index) => ({ ...item, dataIndex: suggestions.length + trendingSearches.length + index })) : [])
  ]
  
  // Generate more AI suggestions based on current context
  const aiSuggestions = !searchTerm ? [
    { text: "Departamentos con vista al mar", type: 'ai' as const, dataIndex: allItems.length },
    { text: "Autos familiares económicos", type: 'ai' as const, dataIndex: allItems.length + 1 },
    { text: "Casas en venta con jardín", type: 'ai' as const, dataIndex: allItems.length + 2 },
    { text: "Motos usadas buen estado", type: 'ai' as const, dataIndex: allItems.length + 3 },
    { text: "Oficinas en alquiler centro", type: 'ai' as const, dataIndex: allItems.length + 4 },
    { text: "Terrenos construcción cerca ciudad", type: 'ai' as const, dataIndex: allItems.length + 5 },
    { text: "Teléfonos móviles gama alta", type: 'ai' as const, dataIndex: allItems.length + 6 },
    { text: "Portatiles para estudiantes", type: 'ai' as const, dataIndex: allItems.length + 7 },
    { text: "Bicicletas montaña aluminio", type: 'ai' as const, dataIndex: allItems.length + 8 },
    { text: "Muebles oficina ergonómicos", type: 'ai' as const, dataIndex: allItems.length + 9 }
  ] : []
  
  // Quick filters
  const quickFilters = [
    { id: 'location', label: 'Ubicación', icon: <MapPin className="h-3 w-3" /> },
    { id: 'price', label: 'Precio', icon: <Tag className="h-3 w-3" /> },
    { id: 'rating', label: 'Valoración', icon: <Star className="h-3 w-3" /> },
    { id: 'new', label: 'Más recientes', icon: <Flame className="h-3 w-3" /> },
  ]
  
  // Mock exclusive offers
  const exclusiveOffers = [
    "¡30% descuento en anuncios destacados!",
    "Publica gratis durante este fin de semana",
    "Destaca tu anuncio con fotos premium"
  ]
  
  // Add AI suggestions to all items
  const displayItems = [...allItems, ...aiSuggestions]
  
  // Calculate max height based on content
  const getMaxHeight = () => {
    let height = 0;
    
    if (loading) height += 50;
    if (searchTerm && suggestions.length === 0 && !loading) height += 50;
    if (searchTerm && suggestions.length > 0) height += 40 + Math.min(suggestions.length, 5) * 40;
    
    if (!searchTerm) {
      // Add height for exclusive offers
      height += 70;
      // Add height for quick filters
      height += 50;
      
      if (trendingSearches.length > 0) height += 70;
      if (searchHistory.length > 0) height += 70;
      if (aiSuggestions.length > 0) height += 100;
    }
    
    return Math.min(height, 400);
  };
  
  if (!searchTerm && !trendingSearches.length && !searchHistory.length && !aiSuggestions.length) return null;
  
  return (
    <motion.div
      ref={suggestionsRef}
      initial={{ opacity: 0, y: position === 'top' ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === 'top' ? -10 : 10 }}
      transition={{ duration: 0.15 }}
      className={`absolute z-50 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-full overflow-y-auto rounded-xl shadow-xl ${
        appearance === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-900'
      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
      style={{ 
        maxHeight: `${getMaxHeight()}px`,
        scrollbarWidth: 'thin', 
        scrollbarColor: appearance === 'dark' ? '#334155 #1e293b' : '#e2e8f0 #f8fafc' 
      }}
    >
      <div className="p-2 space-y-3">
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm">Buscando sugerencias...</span>
          </div>
        )}
        
        {/* No results message */}
        {searchTerm && !loading && suggestions.length === 0 && (
          <div className="py-1 text-center text-sm opacity-70">
            No se encontraron sugerencias para &quot;{searchTerm}&quot;
          </div>
        )}
        
        {/* Quick filters */}
        {!searchTerm && (
          <div className="border-b pb-2 mb-2">
            <div className="flex items-center mb-1">
              <Filter className="h-4 w-4 mr-1 text-blue-500" />
              <h3 className="text-sm font-medium">Filtros rápidos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id === selectedFilter ? null : filter.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFilter === filter.id
                      ? appearance === 'dark' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700'
                      : appearance === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Exclusive offers */}
        {!searchTerm && (
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-2 mb-2">
            <div className="flex items-center mb-1">
              <Tag className="h-4 w-4 mr-1 text-blue-500" />
              <h3 className="text-sm font-medium">Ofertas exclusivas</h3>
            </div>
            <div className="space-y-1">
              {exclusiveOffers.map((offer, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                  <span>{offer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Autocomplete suggestions */}
        {searchTerm && suggestions.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center mb-1">
              <Search className="h-4 w-4 mr-1 text-blue-500" />
              <h3 className="text-sm font-medium">Sugerencias</h3>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {suggestions.map((item, index) => (
                <li 
                  key={`suggestion-${index}`}
                  data-index={index}
                  onClick={() => onSelectSuggestion(item.text)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                    highlightedIndex === index 
                      ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                      : 'hover:bg-opacity-10 hover:bg-white'
                  }`}
                >
                  <Search className="h-4 w-4 opacity-70 flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Trending, History and AI in a horizontal layout when no search term */}
        {!searchTerm && (
          <div className="space-y-3">
            {/* Trending searches */}
            {trendingSearches.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center mb-1">
                  <TrendingUp className="h-4 w-4 mr-1 text-rose-500" />
                  <h3 className="text-sm font-medium">Tendencias</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trendingSearches.map((item, index) => (
                    <button 
                      key={`trending-${index}`}
                      data-index={suggestions.length + index}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                        highlightedIndex === (suggestions.length + index)
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
                      <span className="truncate">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search history */}
            {searchHistory.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    <h3 className="text-sm font-medium">Búsquedas recientes</h3>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('searchHistory')
                      setSearchHistory([])
                    }}
                    className="text-xs opacity-60 hover:opacity-100"
                    aria-label="Borrar historial de búsquedas"
                    title="Borrar historial de búsquedas"
                  >
                    Borrar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchHistory.map((item, index) => (
                    <div 
                      key={`history-${index}`}
                      data-index={suggestions.length + trendingSearches.length + index}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                        highlightedIndex === (suggestions.length + trendingSearches.length + index)
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <Clock className="h-3.5 w-3.5 opacity-70 mr-1.5" />
                      <span className="truncate cursor-pointer" onClick={() => onSelectSuggestion(item.text)}>{item.text}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const filtered = searchHistory.filter((_, i) => i !== index)
                          setSearchHistory(filtered)
                          localStorage.setItem('searchHistory', JSON.stringify(filtered.map(item => item.text)))
                        }}
                        className="ml-1.5 opacity-60 hover:opacity-100"
                        aria-label="Eliminar esta búsqueda del historial"
                        title="Eliminar esta búsqueda"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* AI suggestions - in a horizontal layout */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                  <h3 className="text-sm font-medium">Sugerencias inteligentes</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aiSuggestions.map((item, index) => (
                    <button 
                      key={`ai-${index}`}
                      data-index={item.dataIndex}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                        highlightedIndex === item.dataIndex
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'} ${index < 4 ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : ''}`}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center h-3.5 w-3.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                        <Sparkles className="h-2 w-2 text-white" />
                      </div>
                      <span className="truncate">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
} 