'use client'

import { useEffect, useState } from 'react'
import { SearchIcon, TrendingIcon } from '@/components/icons'

interface SearchSuggestionsProps {
  query: string
  category?: string
  onSelect: (suggestion: string) => void
}

export default function SearchSuggestions({ query, category, onSelect }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [trending, setTrending] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        // Aquí implementaremos la lógica de sugerencias
        const response = await fetch(`/api/search/suggestions?q=${query}&category=${category || ''}`)
        const data = await response.json()
        setSuggestions(data.suggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [query, category])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Aquí implementaremos las búsquedas tendencia
        const response = await fetch(`/api/search/trending?category=${category || ''}`)
        const data = await response.json()
        setTrending(data.trending)
      } catch (error) {
        console.error('Error fetching trending searches:', error)
      }
    }

    if (!query) {
      fetchTrending()
    }
  }, [category, query])

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl p-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-3/4" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl">
      {query ? (
        suggestions.length > 0 ? (
          <ul className="py-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-primary-50 cursor-pointer flex items-center gap-3"
                onClick={() => onSelect(suggestion)}
              >
                <SearchIcon className="w-5 h-5 text-primary-600" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-gray-500">No se encontraron sugerencias</div>
        )
      ) : (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <TrendingIcon className="w-4 h-4" />
            Búsquedas populares
          </h3>
          <ul className="space-y-2">
            {trending.map((term, index) => (
              <li
                key={index}
                className="hover:text-primary-600 cursor-pointer"
                onClick={() => onSelect(term)}
              >
                {term}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 