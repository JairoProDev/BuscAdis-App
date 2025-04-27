'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Publication } from '@/components/search/SearchResults'
import PublicationCard from '@/components/publications/PublicationCard'
import useMediaQuery from '@/hooks/useMediaQuery'

interface PublicationGridProps {
  publications: Publication[]
  loading: boolean
  onPublicationClick?: (publication: Publication, e: React.MouseEvent<HTMLElement>) => void
  selectedPublicationId?: string
  className?: string
}

export default function PublicationGrid({
  publications,
  loading,
  onPublicationClick,
  selectedPublicationId,
  className = ''
}: PublicationGridProps) {
  const isMobile = !useMediaQuery('(min-width: 768px)')
  
  // Calculate columns based on viewport
  const getColumnCount = () => {
    if (isMobile) return 2 // 2 columns on mobile
    return 3 // 3 columns on desktop (since we're in split view)
  }

  // Render skeleton loaders during loading state
  if (loading && publications.length === 0) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 ${className}`}>
        {Array.from({ length: getColumnCount() * 3 }).map((_, index) => (
          <div 
            key={`skeleton-${index}`} 
            className="bg-slate-800 rounded-xl overflow-hidden shadow h-[280px] animate-pulse"
          >
            <div className="h-40 bg-slate-700"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              <div className="flex justify-between mt-2">
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
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
      className={`grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {publications.map((publication, index) => (
        <PublicationCard
          key={`grid-${publication.id}`}
          publication={publication}
          onPublicationClick={onPublicationClick}
          isSelected={publication.id === selectedPublicationId}
          index={index}
        />
      ))}
    </motion.div>
  )
} 