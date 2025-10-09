'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import PublicationCard from '@/components/publications/PublicationCard'
import { PublicationData } from '@/types'

interface ContentRowProps {
  title: string
  description?: string
  publications: PublicationData[]
  onViewAll?: () => void
  categoryId?: string
  isLoading?: boolean
  showViewAll?: boolean
  onPublicationClick?: (publication: PublicationData) => void
  isSidebarOpen?: boolean
}

export default function ContentRow({
  title,
  description,
  publications,
  onViewAll,
  // categoryId, // Unused variable
  isLoading = false,
  showViewAll = true,
  onPublicationClick,
  isSidebarOpen = false
}: ContentRowProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  // Set up scroll listener when component mounts
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      // Initial check
      handleScroll()
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -380, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 380, behavior: 'smooth' })
    }
  }

  // Skeleton loading para mantener el layout
  if (isLoading) {
    return (
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 animate-pulse"></div>
            {description && (
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
            )}
          </div>
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 animate-pulse"></div>
        </div>
        
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map(() => (
            <div key={`skeleton-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="flex-shrink-0 w-44 lg:w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!publications.length) return null

  return (
    <div className="mb-8 lg:mb-12">
      {/* Header Section */}
      <div className="flex items-centerna sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-8">
        <div className="space-y-1">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            <span className="text-sm lg:text-base">Ver más</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      {/* Scrollable Content */}
      <div className="relative group">
        {/* Navigation Buttons - Solo en desktop */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800 hover:scale-110"
            aria-label="Scroll izquierda"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800 hover:scale-110"
            aria-label="Scroll derecha"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}
        {/* Content Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-2 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {publications.map((publication, index) => (
            <motion.div
              key={`content-${publication.id || publication.title?.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`flex-shrink-0 snap-start ${isSidebarOpen ? 'w-44 lg:w-56' : 'w-44 lg:w-64'}`}
            >
              <PublicationCard
                publication={publication}
                viewMode="grid"
                onPublicationClick={onPublicationClick}
              />
            </motion.div>
          ))}
          {/* Ver más card */}
          {showViewAll && onViewAll && publications.length >= 6 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: publications.length * 0.1, duration: 0.4 }}
              className="flex-shrink-0 w-44 lg:w-64 snap-start"
            >
              <button
                onClick={onViewAll}
                className="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-teal-400 text-teal-500 bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 gap-2 p-4"
              >
                <ArrowRightIcon className="w-8 h-8" />
                <span className="font-semibold">Ver más</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 