'use client'

import React from 'react'

interface SearchHeaderProps {
  title: string
  totalResults?: number
  isLoading?: boolean
}

export default function SearchHeader({
  title,
  totalResults = 0,
  isLoading = false
}: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white capitalize mb-2 md:mb-0">
          {title}
        </h1>
        <div className="text-slate-300">
          {isLoading ? (
            <span>Buscando...</span>
          ) : (
            <span>{totalResults} resultados</span>
          )}
        </div>
      </div>
    </div>
  )
} 