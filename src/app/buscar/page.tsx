'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '@/components/search/SearchBar'
import AdisoSection from '@/components/home/AdisoSection'
import CategoryFilters from '@/components/search/CategoryFilters'
import SearchFilters from '@/components/search/SearchFilters'
import { CategoryId } from '@/types/marketplace'
import { categories } from '@/data/mockCategories'
import { mockData } from '@/data/mockData'
import AdvancedFilters from '@/components/search/AdvancedFilters'
import { ClassifiedadsService } from '@/services/classifiedads.service'
import { useSearchParams } from 'next/navigation'
import AdisoCard from '@/components/AdisoCard'
import LoadingState from '@/components/ui/LoadingState'
import Pagination from '@/components/ui/Pagination'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('q') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  const handleSearch = (query: string) => {
    console.log('Búsqueda:', { query, filters, category: selectedCategory })
    setSearchTerm(query)
    setFilters(prev => ({
      ...prev,
      search: query,
      page: 1
    }))
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }

  const filteredData = selectedCategory
    ? { [selectedCategory]: mockData[selectedCategory] }
    : mockData

  useEffect(() => {
    const fetchClassifiedads = async () => {
      setLoading(true)
      try {
        const result = await ClassifiedadsService.getClassifiedads({
          ...filters,
          sortBy: 'created_at',
          sortOrder: 'desc'
        })
        
        setResults(result.classifiedads)
        setTotalPages(result.totalPages)
      } catch (err) {
        setError('Error al cargar los anuncios')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClassifiedads()
  }, [filters])

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar 
            initialValue={filters.search}
            onSearch={handleSearch}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <aside className="lg:col-span-1">
            <CategoryFilters onFilterChange={handleFiltersChange} />
          </aside>

          {/* Resultados */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No se encontraron anuncios</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((classifiedad) => (
                    <AdisoCard key={classifiedad.id} adiso={classifiedad} />
                  ))}
                </div>
                
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
} 