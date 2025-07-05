'use client'

import { useState, useEffect } from 'react'
import { useSearch } from '@/contexts/SearchContext'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import LocationSelector from '../LocationSelector'
import SimpleSelector from '../CategorySelector/SimpleSelector'
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'
import { ANALYTICS_CONFIG } from '@/config/analytics'

interface SearchBarProps {
  onSearch?: (query: string, options?: Record<string, string>) => void
  className?: string
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const { searchState, updateSearch } = useSearch()
  const [searchQuery, setSearchQuery] = useState(searchState.query || '')
  const { trackSearch, trackUserAction } = useGoogleAnalytics()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Track search event
      trackSearch(searchQuery, undefined)
      
      // Track user action
      trackUserAction(
        ANALYTICS_CONFIG.EVENTS.SEARCH_PERFORMED,
        ANALYTICS_CONFIG.CATEGORIES.SEARCH,
        searchQuery
      )

      if (onSearch) {
        onSearch(searchQuery, {
          category: searchState.category || '',
          subcategory: searchState.subcategory || '',
          subsubcategory: searchState.subSubcategory || ''
        })
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    updateSearch({ query: searchQuery })
  }, [searchQuery, updateSearch])

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 ${className}`}>
      {/* Main Search Row - Responsive */}
      <div className="flex gap-2 sm:gap-4 items-center p-3 sm:p-6">
        {/* Location Selector - Oculto en mobile por problemas de props */}
        {/* <div className="flex-shrink-0 hidden sm:block">
          <LocationSelector />
        </div> */}

        {/* Category Selector - Compacto en mobile */}
        <div className="flex-shrink-0">
          <div className="relative">
            <SimpleSelector />
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="¿Qué estás buscando?"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm sm:text-base"
          />
        </div>

        {/* Search Button - Responsive */}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
        >
          <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline text-sm font-medium">Buscar</span>
        </button>
      </div>
    </div>
  )
} 