'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { MicrophoneIcon, CameraIcon, FilterIcon } from '@/components/icons'

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    { text: 'Apartamentos en venta', category: 'Inmuebles' },
    { text: 'Desarrollador frontend', category: 'Empleos' },
    { text: 'Toyota Corolla', category: 'Vehículos' },
    { text: 'iPhone 13', category: 'Electrónicos' },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
          <button className="p-1.5 md:p-2 text-primary-500 hover:bg-primary-50 rounded-full transition-colors">
            <MicrophoneIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button className="p-1.5 md:p-2 text-primary-500 hover:bg-primary-50 rounded-full transition-colors">
            <CameraIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button className="p-1.5 md:p-2 text-primary-500 hover:bg-primary-50 rounded-full transition-colors">
            <FilterIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              absolute w-full bg-white shadow-xl border border-primary-100 overflow-hidden z-50
              md:top-full md:rounded-2xl md:mt-2 md:max-h-[400px]
              fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[50vh]
              md:static md:transform-none
              overflow-y-auto
            `}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-primary-100">
              <div className="text-sm font-medium text-primary-600">Sugerencias populares</div>
            </div>
            <div className="p-4 space-y-2">
              {suggestions.map((suggestion, index) => (
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
                  <span className="text-sm text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                    {suggestion.category}
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