'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, Clock, Sparkles, X } from 'lucide-react'
import Image from 'next/image'

interface SearchSuggestionsProps {
  searchTerm: string
  isVisible: boolean
  onSelectSuggestion: (suggestion: string) => void
  onClose: () => void
  position?: 'top' | 'bottom'
  appearance?: 'light' | 'dark'
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
  isVisible,
  onSelectSuggestion,
  onClose,
  position = 'bottom',
  appearance = 'dark',
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
      if (!isVisible) return
      
      const allItems = [...suggestions, ...trendingSearches, ...searchHistory]
      
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
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, suggestions, trendingSearches, searchHistory, highlightedIndex, onSelectSuggestion, onClose])
  
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
  
  // Generate some AI suggestions based on current context
  const aiSuggestions = !searchTerm ? [
    { 
      text: "Departamentos con vista al mar", 
      type: 'ai' as const,
      dataIndex: allItems.length
    },
    { 
      text: "Autos familiares económicos", 
      type: 'ai' as const,
      dataIndex: allItems.length + 1
    }
  ] : []
  
  // Add AI suggestions to all items
  const displayItems = [...allItems, ...aiSuggestions]
  
  // Don't render anything if not visible
  if (!isVisible) return null
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={suggestionsRef}
          initial={{ opacity: 0, y: position === 'top' ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -10 : 10 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-50 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-full max-h-[70vh] overflow-y-auto rounded-xl shadow-xl ${
            appearance === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-900'
          } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
        >
          <div className="p-4 space-y-3">
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm">Buscando sugerencias...</span>
              </div>
            )}
            
            {/* No results message */}
            {searchTerm && !loading && suggestions.length === 0 && (
              <div className="py-3 text-center text-sm opacity-70">
                No se encontraron sugerencias para &quot;{searchTerm}&quot;
              </div>
            )}
            
            {/* Autocomplete suggestions */}
            {searchTerm && suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase opacity-60">Sugerencias</h3>
                <ul className="space-y-1">
                  {suggestions.map((item, index) => (
                    <li 
                      key={`suggestion-${index}`}
                      data-index={index}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                        highlightedIndex === index 
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : 'hover:bg-opacity-10 hover:bg-white'
                      }`}
                    >
                      <Search className="h-4 w-4 opacity-70" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Trending searches */}
            {!searchTerm && trendingSearches.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase flex items-center gap-1 opacity-60">
                  <TrendingUp className="h-3 w-3" />
                  Tendencias
                </h3>
                <ul className="space-y-1">
                  {trendingSearches.map((item, index) => (
                    <li 
                      key={`trending-${index}`}
                      data-index={suggestions.length + index}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                        highlightedIndex === (suggestions.length + index)
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : 'hover:bg-opacity-10 hover:bg-white'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 text-rose-500" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Search history */}
            {!searchTerm && searchHistory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
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
                  >
                    Borrar historial
                  </button>
                </div>
                <ul className="space-y-1">
                  {searchHistory.map((item, index) => (
                    <li 
                      key={`history-${index}`}
                      data-index={suggestions.length + trendingSearches.length + index}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer ${
                        highlightedIndex === (suggestions.length + trendingSearches.length + index)
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : 'hover:bg-opacity-10 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 opacity-70" />
                        <span>{item.text}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const filtered = searchHistory.filter((_, i) => i !== index)
                          setSearchHistory(filtered)
                          localStorage.setItem('searchHistory', JSON.stringify(filtered.map(item => item.text)))
                        }}
                        className="opacity-60 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* AI suggestions */}
            {!searchTerm && aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase flex items-center gap-1 opacity-60">
                  <Sparkles className="h-3 w-3" />
                  Sugerencias inteligentes
                </h3>
                <ul className="space-y-1">
                  {aiSuggestions.map((item, index) => (
                    <li 
                      key={`ai-${index}`}
                      data-index={item.dataIndex}
                      onClick={() => onSelectSuggestion(item.text)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                        highlightedIndex === item.dataIndex
                          ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                          : 'hover:bg-opacity-10 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-center h-4 w-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 