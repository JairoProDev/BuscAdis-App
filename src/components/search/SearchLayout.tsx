'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useSearch } from '@/contexts/SearchContext'
import StickySearchContainer from './StickySearchContainer'
import ResultsContainer from './ResultsContainer'
import type { Publication as CorePublication } from '@/types/publications'
import { isEqual } from 'lodash'

type FilterValue = string | number | boolean | (string | number)[] | null;

// THIS SECTION DEFINES THE PROPS AND VIEWMODE, IT SHOULD NOT BE DELETED
interface SearchLayoutProps {
    initialResults?: CorePublication[]
    loading?: boolean
    onSearch?: (query: string, options?: Record<string, string>) => void
    onFilterChange?: (filters: Record<string, FilterValue>) => void
    totalResults?: number
    onPublicationClick?: (publication: CorePublication, e: React.MouseEvent<HTMLAnchorElement>) => void
    children?: ReactNode
    className?: string
    useEnhancedSearch?: boolean
}

type ViewMode = 'grid' | 'list';
// END OF SECTION THAT SHOULD NOT BE DELETED

export default function SearchLayout({
    initialResults = [],
    loading = false,
    onSearch,
    onFilterChange,
    totalResults = 0,
    onPublicationClick,
    children,
    className = '',
}: SearchLayoutProps) {
    const { searchState } = useSearch()
    const [results, setResults] = useState<CorePublication[]>(initialResults)

    // Update results when initialResults change
    useEffect(() => {
        if (!isEqual(results, initialResults)) {
            setResults(initialResults)
        }
    }, [initialResults, results])

    // Handle search from the search bar
    const handleSearch = (query: string, options: Record<string, string> = {}) => {
        if (onSearch) {
            onSearch(query, options)
        }
    }

    // Handle filter changes from the filters bar
    const handleFilterChange = (filters: Record<string, any>) => {
        if (onFilterChange) {
            onFilterChange(filters)
        }
    }

    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            {/* Sticky Search Container */}
            <StickySearchContainer 
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />

            {/* Results Container with proper top margin to account for sticky header */}
            <div className="pt-32"> {/* Adjust based on actual sticky header height */}
                <div className="max-w-7xl mx-auto">
                    <ResultsContainer
                        results={results}
                        loading={loading}
                        totalResults={totalResults}
                        onPublicationClick={onPublicationClick}
                    />
                </div>
            </div>

            {/* Children (if any) */}
            {children}
        </div>
    )
} 