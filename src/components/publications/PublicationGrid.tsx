'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Publication } from '@/components/search/SearchResults'
import PublicationCard from '@/components/publications/PublicationCard'
// import useMediaQuery from '@/hooks/useMediaQuery'

interface PublicationGridProps {
  publications: Publication[]
  loading: boolean
  onPublicationClick?: (publication: Publication) => void
  selectedPublicationId?: string
  className?: string
  viewMode?: 'grid' | 'list'
}

export default function PublicationGrid({
  publications,
  loading,
  onPublicationClick,
  selectedPublicationId,
  className = '',
  viewMode = 'grid'
}: PublicationGridProps) {
  // const isMobile = !useMediaQuery('(min-width: 768px)')
  
  // Calculate columns based on viewport and view mode
  // const getColumnCount = () => {
  //   if (viewMode === 'list') return 1 // Single column for list mode
  //   if (isMobile) return 2 // 2 columns on mobile
  //   return 3 // 3 columns on desktop (since we're in split view)
  // }

  // Get grid classes based on view mode
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'flex flex-col gap-3'
    }
    return 'grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'
  }

  // Convert Publication to PublicationData format for PublicationCard
  const convertToPublicationData = (pub: Publication) => {
    // Helper to safely convert location
    const convertLocation = (loc: Publication['location']) => {
      if (typeof loc === 'string') {
        return {
          district: loc,
          province: '',
          city: '',
          country: 'Perú'
        }
      }
      
      if (loc && typeof loc === 'object') {
        return {
          district: loc.district || '',
          province: loc.province || '',
          city: loc.city || '',
          country: 'Perú'
        }
      }
      
      return {
        district: '',
        province: '',
        city: '',
        country: 'Perú'
      }
    }

    return {
      id: pub.id,
      title: pub.title,
      description: pub.description || '',
      categorySlug: pub.categorySlug || '',
      subcategorySlug: pub.subcategorySlug || null,
      subSubcategorySlug: pub.subSubcategorySlug || null,
      transactionType: 'venta', // Default value since Publication doesn't have this
      value: pub.price || 0,
      currency: pub.currency || 'PEN',
      valueType: 'fixed', // Default value since Publication doesn't have this
      size: 0, // Default value since Publication doesn't have this
      location: convertLocation(pub.location),
      images: pub.images || [],
      whatsapp: pub.contactPhone || '',
      createdAt: pub.createdAt || new Date().toISOString(),
      views: pub.views || 0,
      featured: false, // Default value since Publication doesn't have this
      premium: pub.premium || false,
    }
  }

  // Render skeleton loaders during loading state
  if (loading && publications.length === 0) {
    const skeletonClasses = viewMode === 'list' 
      ? 'flex flex-col gap-3'
      : 'grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'
    
    return (
      <div className={`${skeletonClasses} ${className}`}>
        {Array.from({ length: 8 }).map(() => (
          <div
            key={`skeleton-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            {viewMode === 'list' ? (
              <>
                <div className="w-40 h-32 bg-slate-700/50 relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent"></div>
                </div>
                <div className="flex-1 p-4 space-y-2">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-3 bg-slate-700/50 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-700/50 rounded w-1/4"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-56 bg-slate-700/50 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent"></div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-start mt-2">
                    <div className="h-3 bg-slate-700/50 rounded w-20"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!loading && publications.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-400">No se encontraron publicaciones</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`${getGridClasses()} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {publications.map((publication) => (
        <PublicationCard
          key={publication.id}
          publication={convertToPublicationData(publication)}
          onPublicationClick={onPublicationClick ? () => onPublicationClick(publication) : undefined}
          viewMode={viewMode}
          className={selectedPublicationId === publication.id ? 'ring-2 ring-blue-500' : ''}
        />
      ))}
    </motion.div>
  )
} 