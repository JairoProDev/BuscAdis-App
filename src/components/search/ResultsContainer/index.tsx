'use client'

import { useState } from 'react'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import SearchResults from '../SearchResults'
import type { Publication as CorePublication } from '@/types/publications'
import type { Publication as SearchResultPublication } from '../SearchResults'

type ViewMode = 'grid' | 'list'

interface ResultsContainerProps {
  results: CorePublication[]
  loading?: boolean
  totalResults?: number
  onPublicationClick?: (publication: CorePublication, e: React.MouseEvent<HTMLAnchorElement>) => void
  className?: string
}

// Adapter function to convert CorePublication to SearchResultPublication
const adaptToSearchResultPublication = (pub: CorePublication): SearchResultPublication => {
  return {
    id: String(pub.id || pub._id || `fallback-id-${Math.random().toString(36).substr(2, 9)}`),
    title: pub.title,
    description: pub.description,
    price: pub.amount ?? 0,
    currency: pub.currency || 'PEN',
    categorySlug: pub.categorySlug,
    subcategorySlug: pub.subcategorySlug || undefined,
    subSubcategorySlug: pub.subSubcategorySlug || undefined,
    location: pub.location
      ? {
          address: pub.location.address || '',
          district: pub.location.district || undefined,
          province: pub.location.province || undefined,
        }
      : 'Ubicación no especificada',
    contactName: pub.contact?.name || '',
    contactPhone: pub.contact?.phones?.[0] || '',
    contactEmail: pub.contact?.email || undefined,
    status: 'active',
    createdAt: pub.createdAt ? new Date(pub.createdAt).toISOString() : new Date().toISOString(),
    images: pub.images || [],
    premium: pub.premium || false,
    verified: false,
    slug: pub.slug || undefined,
    attributes: pub.attributes || {},
  }
}

export default function ResultsContainer({
  results,
  loading = false,
  totalResults = 0,
  onPublicationClick,
  className = ''
}: ResultsContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Convert results to SearchResultPublication format
  const adaptedResults = results.map(adaptToSearchResultPublication)

  // Handle publication click and convert back to CorePublication
  const handlePublicationClick = (publication: SearchResultPublication, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onPublicationClick) {
      // Find the original CorePublication
      const originalPublication = results.find(result => 
        String(result.id || result._id) === publication.id
      )
      if (originalPublication) {
        onPublicationClick(originalPublication, e)
      }
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? (
              'Buscando...'
            ) : (
              `${totalResults} ${totalResults === 1 ? 'resultado' : 'resultados'} encontrados`
            )}
          </h2>
        </div>

        {/* View Mode Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Vista en cuadrícula"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Vista en lista"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4 sm:px-6 lg:px-8">
        <SearchResults
          results={adaptedResults}
          loading={loading}
          viewType={viewMode}
          onPublicationClick={handlePublicationClick}
        />
      </div>
    </div>
  )
} 