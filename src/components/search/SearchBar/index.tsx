'use client'

import { useState, useEffect } from 'react'
import { useSearch } from '@/contexts/SearchContext'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import LocationSelector from '../LocationSelector'
import SimpleSelector from '../CategorySelector/SimpleSelector'

interface SearchBarProps {
  onSearch?: (query: string, options?: Record<string, string>) => void
  className?: string
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const { searchState, updateSearch } = useSearch()
  const [searchQuery, setSearchQuery] = useState(searchState.query || '')

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, {
        category: searchState.category || '',
        subcategory: searchState.subcategory || '',
        subsubcategory: searchState.subSubcategory || ''
      })
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
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Main Search Row */}
      <div className="flex gap-4 items-center">
        {/* Location Selector */}
        <div className="flex-shrink-0">
          <LocationSelector />
        </div>

        {/* Category Selector */}
        <div className="flex-shrink-0">
          <SimpleSelector />
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="¿Qué estás buscando?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>
    </div>
  )
} 