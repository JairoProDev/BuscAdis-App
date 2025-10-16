'use client'

import { useState, useEffect } from 'react'
import SearchBar from '../SearchBar'
import FiltersBar from '../FiltersBar'
import Breadcrumbs from '../Breadcrumbs'

interface SearchOptions {
  category?: string;
  location?: string;
  filters?: Record<string, unknown>;
  type?: string;
  subType?: string;
}

interface StickySearchContainerProps {
  onSearch?: (query: string, options?: SearchOptions) => void
  onFilterChange?: (filters: Record<string, unknown>) => void
  className?: string
}

export default function StickySearchContainer({ 
  onSearch, 
  onFilterChange, 
  className = '' 
}: StickySearchContainerProps) {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Become sticky after scrolling 100px
      setIsSticky(scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`w-full z-40 transition-all duration-300 ease-out ${
      isSticky 
        ? 'fixed top-0 left-0 right-0 shadow-lg transform-gpu' 
        : 'relative'
    } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <SearchBar 
          onSearch={onSearch || (() => {})}
          className={isSticky ? 'rounded-none' : ''}
        />
        
        {/* Breadcrumbs */}
        <div className="py-2">
          <Breadcrumbs />
        </div>
        
        {/* Filters Bar */}
        <FiltersBar onFilterChange={onFilterChange} />
      </div>
    </div>
  )
} 