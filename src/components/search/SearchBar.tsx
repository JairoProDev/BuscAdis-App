'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MicrophoneIcon, CameraIcon, FilterIcon } from '@/components/icons'
import { categories } from '@/data/mockCategories'

interface Suggestion {
  text: string
  categoryId: string
  subTypeId: string
}

const generateSuggestions = () => {
  const suggestions: Suggestion[] = []
  categories.forEach(category => {
    category.types.forEach(type => {
      suggestions.push({
        text: `${type.name} en ${category.name}`,
        categoryId: category.id,
        subTypeId: type.id
      })
    })
  })
  return suggestions.slice(0, 5) // Limitamos a 5 sugerencias
}

const SUGGESTIONS = generateSuggestions()

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState(SUGGESTIONS)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query) {
      const filtered = SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.categoryId.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.subTypeId.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(SUGGESTIONS)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !inputRef.current?.contains(event.target as Node) &&
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

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="¿Qué estás buscando?"
          className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg rounded-full border-2 border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 pr-24 md:pr-32"
        />
        <div className="absolute right-2 flex items-center space-x-1 md:space-x-2">
          <button 
            className="p-1.5 md:p-2 text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
            aria-label="Buscar por voz"
            title="Buscar por voz"
          >
            <MicrophoneIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button 
            className="p-1.5 md:p-2 text-primary-500 hover:bg-primary-50 rounded-full transition-colors"
            aria-label="Buscar por imagen"
            title="Buscar por imagen"
          >
            <CameraIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button 
            className="p-1.5 md:p-2 text-primary-500 hover:bg-primary-50 rounded-full transition-colors sm:hidden"
            aria-label="Abrir filtros"
            title="Abrir filtros"
          >
            <FilterIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] bg-white shadow-xl border border-primary-100 rounded-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white p-4 border-b border-primary-100">
              <div className="text-sm font-medium text-primary-600">Sugerencias populares</div>
            </div>
            <div className="p-4 space-y-2">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion.text)
                    onSearch(suggestion.text)
                    setIsFocused(false)
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <span className="text-primary-800">{suggestion.text}</span>
                  <span className="text-sm text-primary-500 bg-primary-50/50 px-2 py-1 rounded-full">
                    {suggestion.categoryId}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 