'use client'

import { useState, useEffect } from 'react'
import StickySearchContainer from './StickySearchContainer'
import ResultsContainer from './ResultsContainer'
import type { Publication as CorePublication } from '@/types/publications'
import { isEqual } from 'lodash'

type FilterValue = string | number | boolean | (string | number)[] | null;

interface SearchOptions {
  category?: string;
  location?: string;
  filters?: Record<string, unknown>;
  type?: string;
  subType?: string;
}

// THIS SECTION DEFINES THE PROPS AND VIEWMODE, IT SHOULD NOT BE DELETED
interface SearchLayoutProps {
    initialResults?: CorePublication[]
    loading?: boolean
    onSearch?: (query: string, options?: SearchOptions) => void
    onFilterChange?: (filters: Record<string, FilterValue>) => void
    totalResults?: number
    onPublicationClick?: (publication: CorePublication, e: React.MouseEvent<HTMLAnchorElement>) => void
    children?: React.ReactNode
    className?: string
    useEnhancedSearch?: boolean
}

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
    const [results, setResults] = useState<CorePublication[]>(initialResults)

    // Update results when initialResults change
    useEffect(() => {
        if (!isEqual(results, initialResults)) {
            setResults(initialResults)
        }
    }, [initialResults, results])

    // Handle search from the search bar
    const handleSearch = (query: string, options: SearchOptions = {}) => {
        if (onSearch) {
            onSearch(query, options)
        }
    }

    // Handle filter changes from the filters bar
    const handleFilterChange = (filters: Record<string, unknown>) => {
        if (onFilterChange) {
            onFilterChange(filters as Record<string, FilterValue>)
        }
    }

    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            {/* Sticky Search Container */}
            <StickySearchContainer 
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />

            {/* Results Container */}
            <div className="pt-8"> {/* Normal padding since header is no longer sticky */}
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