'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
  ViewColumnsIcon, 
  MapIcon
} from '@heroicons/react/24/outline'
import SearchResults, { Publication } from './SearchResults'
import useMediaQuery from '@/hooks/useMediaQuery'
import AdvancedSearchBar from './AdvancedSearchBar'
import KeywordSearchBox from './KeywordSearchBox'
import CategorySelector from './CategorySelector'
import AdvancedFilterDrawer from './AdvancedFilterDrawer'
import HorizontalFilterBar from './HorizontalFilterBar'
import { CategoriesService } from '@/services/categories.service'

interface SearchLayoutProps {
  initialResults?: Publication[]
  initialCategory?: string
  initialSubcategory?: string
  initialQuery?: string
  loading?: boolean
  onSearch?: (query: string, options?: Record<string, string>) => void
  onFilterChange?: (filters: Record<string, unknown>) => void
  onLoadMore?: () => void
  hasMore?: boolean
  totalResults?: number
  showMap?: boolean
  onPublicationClick?: (publication: Publication, e: React.MouseEvent<HTMLAnchorElement>) => void
  children?: ReactNode
  className?: string
  useEnhancedSearch?: boolean
}

export default function SearchLayout({
  initialResults = [],
  initialCategory,
  initialSubcategory,
  initialQuery = '',
  loading = false,
  onSearch,
  onFilterChange,
  onLoadMore,
  hasMore = false,
  totalResults = 0,
  showMap = false,
  onPublicationClick,
  className = '',
  useEnhancedSearch = true,
}: SearchLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Estados del componente
  const [searchQuery, setSearchQuery] = useState(initialQuery || searchParams?.get('q') || '')
  const [category, setCategory] = useState(initialCategory || searchParams?.get('category') || '')
  const [subcategory, setSubcategory] = useState(initialSubcategory || searchParams?.get('subcategory') || '')
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(searchParams?.get('subsubcategory') || '')
  const [results, setResults] = useState<Publication[]>(initialResults)
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'map'>('grid')
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({})
  const [filterCount, setFilterCount] = useState(0)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  
  // Responsive
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await CategoriesService.getCategories()
        setCategories(response)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    
    loadCategories()
  }, [])
  
  // Actualizar resultados cuando cambian las props iniciales
  useEffect(() => {
    if (initialResults && initialResults.length > 0) {
      setResults(initialResults)
    }
  }, [initialResults])
  
  // Manejar la búsqueda
  const handleSearch = (query: string, options?: Record<string, string>) => {
    setSearchQuery(query)
    
    // Si hay categoría/subcategoría/subsubcategoría en las opciones, actualizar estados
    if (options?.category) {
      setCategory(options.category)
    }
    
    if (options?.subcategory) {
      setSubcategory(options.subcategory)
    }
    
    if (options?.subsubcategory) {
      setSelectedSubSubcategory(options.subsubcategory)
    }
    
    // Actualizar URL sin causar recarga de página
    const params = new URLSearchParams(searchParams?.toString())
    
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    
    if (options?.category || category) {
      params.set('category', options?.category || category)
    }
    
    if (options?.subcategory || subcategory) {
      params.set('subcategory', options?.subcategory || subcategory)
    }
    
    if (options?.subsubcategory || selectedSubSubcategory) {
      params.set('subsubcategory', options?.subsubcategory || selectedSubSubcategory)
    }
    
    const newPath = `${pathname}?${params.toString()}`
    router.push(newPath, { scroll: false })
    
    // Llamar al callback si está definido
    if (onSearch) {
      onSearch(query, { 
        category: options?.category || category, 
        subcategory: options?.subcategory || subcategory,
        subsubcategory: options?.subsubcategory || selectedSubSubcategory
      })
    }
  }
  
  // Manejar cambio de categoría con preservación de la consulta
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setSubcategory('')
    setSelectedSubSubcategory('')
    setActiveFilters({})
    setFilterCount(0)
    
    // Preservar la consulta de búsqueda actual
    const currentQuery = searchQuery || ''
    
    // Llamar al callback si está definido
    if (onFilterChange) {
      onFilterChange({ 
        category: newCategory, 
        subcategory: '', 
        subsubcategory: '',
        q: currentQuery  // Preservar la consulta
      })
    }
  }
  
  // Manejar cambio de filtros
  const handleFilterChange = (filters: Record<string, unknown>) => {
    setActiveFilters(filters)
    setFilterCount(Object.keys(filters).length)
    
    if (onFilterChange) {
      onFilterChange({ 
        ...filters, 
        category, 
        subcategory, 
        subsubcategory: selectedSubSubcategory 
      })
    }
  }
  
  // Manejar cambio de subcategoría con preservación de la consulta
  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
    setSelectedSubSubcategory('')
    
    // Preservar la consulta de búsqueda actual
    const currentQuery = searchQuery || ''
    
    // Llamar al callback si está definido
    if (onFilterChange) {
      onFilterChange({ 
        ...activeFilters,
        category, 
        subcategory: newSubcategory, 
        subsubcategory: '',
        q: currentQuery  // Preservar la consulta
      })
    }
  }
  
  // Manejar cambio de subsubcategoría con preservación de la consulta
  const handleSubSubcategoryChange = (newSubSubcategory: string) => {
    setSelectedSubSubcategory(newSubSubcategory)
    
    // Preservar la consulta de búsqueda actual
    const currentQuery = searchQuery || ''
    
    // Llamar al callback si está definido
    if (onFilterChange) {
      onFilterChange({ 
        ...activeFilters,
        category, 
        subcategory, 
        subsubcategory: newSubSubcategory,
        q: currentQuery  // Preservar la consulta
      })
    }
  }
  
  // Alternar vista de mapa
  const toggleMapView = () => {
    setCurrentView(currentView === 'map' ? 'grid' : 'map')
  }
  
  // Renderizar barra superior de búsqueda
  const renderSearchHeader = () => {
    return (
      <div className="mb-2">
        <div className="flex flex-col gap-4">
          {useEnhancedSearch ? (
            // Usar nuestro nuevo componente KeywordSearchBox con todas las opciones
            <KeywordSearchBox
              initialValue={searchQuery}
              onSearch={handleSearch}
              appearance="dark"
              showLabel={false}
              autoFocus={true}
              placeholder="¿Qué estás buscando hoy?"
              showVoiceSearch={true}
              showImageSearch={true}
              showAiAssist={true}
              className="w-full"
            />
          ) : (
            // Usar la barra de búsqueda avanzada existente
            <AdvancedSearchBar 
              initialValue={searchQuery}
              onSearch={handleSearch}
              selectedCategory={category}
              selectedSubcategory={subcategory}
              selectedSubSubcategory={selectedSubSubcategory}
              onSelectCategory={handleCategoryChange}
              onSelectSubcategory={handleSubcategoryChange}
              onSelectSubSubcategory={handleSubSubcategoryChange}
              placeholder="¿Qué estás buscando en BuscAdis?"
            />
          )}
        </div>
      </div>
    )
  }
  
  // Renderizar selector de categorías con estilo mejorado
  const renderCategorySelector = () => {
    return (
      <div className="mb-4 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 shadow-sm">
        <div className="flex flex-col space-y-2">
          <CategorySelector
            activeCategory={category}
            activeSubcategory={subcategory}
            activeSubSubcategory={selectedSubSubcategory}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={handleSubcategoryChange}
            onSubSubcategoryChange={handleSubSubcategoryChange}
            showCounts={true}
            variant="horizontal"
            className="w-full"
            showAllOption={true}
            maxVisible={isMobile ? 4 : 8}
          />
        </div>
      </div>
    )
  }
  
  // Renderizar barra de filtros
  const renderFilterBar = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        {/* Información de resultados */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {searchQuery ? (
              <span>Resultados para &quot;{searchQuery}&quot;</span>
            ) : category ? (
              <span>{initialCategory || category}</span>
            ) : (
              <span>Todos los anuncios</span>
            )}
          </h1>
          
          <p className="text-slate-400">
            {loading ? 'Buscando...' : `${totalResults || results.length} anuncios encontrados`}
          </p>
        </div>
        
        {/* Controles de vista */}
        <div className="flex items-center space-x-2">
          {/* Botón de filtros - Mobile lo muestra como botón, Desktop como panel */}
          {!isLg && (
            <AdvancedFilterDrawer
              selectedCategory={category || undefined}
              initialFilters={activeFilters}
              categories={categories}
              onCategoryChange={(cat) => {
                if (cat) handleCategoryChange(cat.id);
              }}
              onFilterChange={handleFilterChange}
              filterCount={filterCount}
            />
          )}
          
          {/* Toggle de vista de mapa */}
          {showMap && (
            <button
              onClick={toggleMapView}
              className={`p-2 rounded-lg border ${
                currentView === 'map' 
                  ? 'bg-teal-500 border-teal-600 text-white' 
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              aria-label={currentView === 'map' ? "Mostrar lista" : "Mostrar mapa"}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          )}
          
          {/* Toggle de vista de columnas (solo en desktop) */}
          {(
            <button
              onClick={() => setCurrentView(currentView === 'list' ? 'grid' : 'list')}
              className={`p-2 rounded-lg border ${
                currentView === 'list' 
                  ? 'bg-teal-500 border-teal-600 text-white' 
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              aria-label={currentView === 'list' ? "Ver en cuadrícula" : "Ver en lista"}
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* Selector de Categorías (que ahora contiene los breadcrumbs) */}
      {renderCategorySelector()}
      
      {/* Cabecera de búsqueda */}
      {renderSearchHeader()}
      
      {/* Horizontal Filter Bar - New! */}
      {category && (
        <div className="mb-4">
          <HorizontalFilterBar
            category={category}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            className=""
          />
        </div>
      )}
      
      {/* Barra de filtro y controles */}
      {renderFilterBar()}
      
      {/* Contenido principal */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel de filtros (Optional - can be commented out if only using horizontal filters) */}
        {/*
        {isLg && (
          <div className="w-full lg:w-72 flex-shrink-0">
            <SearchFilters
              category={category}
              activeFilters={activeFilters}
              onFiltersChange={handleFilterChange}
              className="sticky top-4"
              compact={false}
            />
          </div>
        )}
        */}
        
        {/* Resultados - make it full width now */}
        <div className="flex-grow w-full">
          {currentView === 'map' ? (
            // Vista de mapa
            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 h-[600px] flex items-center justify-center">
              <p className="text-slate-400">Vista de mapa en desarrollo</p>
            </div>
          ) : (
            // Vista de resultados
            <SearchResults
              results={results}
              loading={loading}
              hasMore={hasMore}
              activeCategory={category}
              showInteractionButtons={true}
              onPublicationClick={onPublicationClick}
              viewType={currentView}
            />
          )}
          
          {/* Botón Cargar Más */}
          {hasMore && onLoadMore && (
            <div className="mt-6 text-center">
              <button 
                onClick={onLoadMore} 
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
              >
                Cargar más resultados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 