'use client'

import { useState, useEffect, useRef } from 'react'
import { SearchIcon, MicrophoneIcon, CameraIcon, FilterIcon } from '@/components/icons'
import SearchSuggestions from './SearchSuggestions'
import SearchFilters from './SearchFilters'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  category?: string
  onSearch: (query: string) => Promise<void>
}

export default function SearchBar({ category, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'es-ES'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        void onSearch(transcript)
      }

      recognition.start()
    }
  }

  const handleImageSearch = async () => {
    // Implementar búsqueda por imagen
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    void onSearch(suggestion)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <SearchIcon className="w-6 h-6 text-primary-600" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={`Buscar en ${category || 'todas las categorías'}...`}
          className="flex-1 outline-none text-lg"
          aria-label="Campo de búsqueda"
        />
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceSearch}
            className="p-2 hover:bg-primary-50 rounded-full transition"
            title="Búsqueda por voz"
            type="button"
            aria-label="Buscar por voz"
          >
            <MicrophoneIcon className={`w-6 h-6 ${isListening ? 'text-red-500' : 'text-primary-600'}`} />
          </button>
          
          <button
            onClick={handleImageSearch}
            className="p-2 hover:bg-primary-50 rounded-full transition"
            title="Búsqueda por imagen"
            type="button"
            aria-label="Buscar por imagen"
          >
            <CameraIcon className="w-6 h-6 text-primary-600" />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-primary-50 rounded-full transition"
            title="Filtros avanzados"
            type="button"
            aria-label="Mostrar filtros avanzados"
          >
            <FilterIcon className="w-6 h-6 text-primary-600" />
          </button>
        </div>
      </div>

      {showSuggestions && (
        <SearchSuggestions
          query={debouncedQuery}
          category={category}
          onSelect={handleSuggestionSelect}
        />
      )}

      {showFilters && (
        <SearchFilters
          category={category}
          onApply={(filters) => {
            // Aplicar filtros
            setShowFilters(false)
          }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
} 