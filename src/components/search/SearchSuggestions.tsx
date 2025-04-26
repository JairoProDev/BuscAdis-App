'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, Clock, Sparkles, X } from 'lucide-react'
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
  
  // Add AI suggestions to all items
  const displayItems = [...allItems, ...aiSuggestions]
  
  // Calculate max height based on content
  const getMaxHeight = () => {
    let height = 0;
    
    if (loading) height += 50;
    if (searchTerm && suggestions.length === 0 && !loading) height += 50;
    if (searchTerm && suggestions.length > 0) height += 40 + Math.min(suggestions.length, 5) * 40;
    
    if (!searchTerm) {
      if (trendingSearches.length > 0) height += 50;
      if (searchHistory.length > 0) height += 50;
      if (aiSuggestions.length > 0) height += 50;
    }
    
    return Math.min(height, 350);
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
      <div className="p-2 space-y-2">
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-xs">Buscando sugerencias...</span>
          </div>
        )}
        
        {/* No results message */}
        {searchTerm && !loading && suggestions.length === 0 && (
          <div className="py-1 text-center text-xs opacity-70">
            No se encontraron sugerencias para &quot;{searchTerm}&quot;
          </div>
        )}
        
        {/* Autocomplete suggestions */}
        {searchTerm && suggestions.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-medium uppercase opacity-60 px-1">Sugerencias</h3>
            <ul className="flex flex-wrap gap-1">
              {suggestions.map((item, index) => (
                <li 
                  key={`suggestion-${index}`}
                  data-index={index}
                  onClick={() => onSelectSuggestion(item.text)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-xs ${
                    highlightedIndex === index 
                      ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                      : 'hover:bg-opacity-10 hover:bg-white'
                  }`}
                >
                  <Search className="h-3 w-3 opacity-70 flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Trending, History and AI in a horizontal layout when no search term */}
        {!searchTerm && (
          <div className="space-y-2">
            {/* Trending searches */}
            {trendingSearches.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-medium uppercase flex items-center gap-1 opacity-60 px-1">
                  <TrendingUp className="h-3 w-3" />
                  Tendencias
                </h3>
                <div className="flex flex-wrap gap-1">
                  {trendingSearches.map((item, index) => (
                    <button 
                      key={`trending-${index}`}
                      data-index={suggestions.length + index}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer ${
                        highlightedIndex === (suggestions.length + index)
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <TrendingUp className="h-3 w-3 text-rose-500" />
                      <span className="truncate">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search history */}
            {searchHistory.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-medium uppercase flex items-center gap-1 opacity-60">
                    <Clock className="h-3 w-3" />
                    Búsquedas recientes
                  </h3>
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
                <div className="flex flex-wrap gap-1">
                  {searchHistory.map((item, index) => (
                    <div 
                      key={`history-${index}`}
                      data-index={suggestions.length + trendingSearches.length + index}
                      className={`flex items-center px-2 py-0.5 rounded-full text-xs cursor-pointer ${
                        highlightedIndex === (suggestions.length + trendingSearches.length + index)
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <Clock className="h-3 w-3 opacity-70 mr-1" />
                      <span className="truncate cursor-pointer" onClick={() => onSelectSuggestion(item.text)}>{item.text}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const filtered = searchHistory.filter((_, i) => i !== index)
                          setSearchHistory(filtered)
                          localStorage.setItem('searchHistory', JSON.stringify(filtered.map(item => item.text)))
                        }}
                        className="ml-1 opacity-60 hover:opacity-100"
                        aria-label="Eliminar esta búsqueda del historial"
                        title="Eliminar esta búsqueda"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* AI suggestions - in a horizontal layout */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-medium uppercase flex items-center gap-1 opacity-60 px-1">
                  <Sparkles className="h-3 w-3" />
                  Sugerencias inteligentes
                </h3>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.map((item, index) => (
                    <button 
                      key={`ai-${index}`}
                      data-index={item.dataIndex}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer ${
                        highlightedIndex === item.dataIndex
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'} ${index < 4 ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : ''}`}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center h-3 w-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
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