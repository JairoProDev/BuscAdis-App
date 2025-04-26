'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
  ViewColumnsIcon, 
  MapIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import SearchResults, { Publication } from './SearchResults'
import useMediaQuery from '@/hooks/useMediaQuery'
import AdvancedSearchBar from './AdvancedSearchBar'
import KeywordSearchBox from './KeywordSearchBox'

interface SearchLayoutProps {
  initialResults?: Publication[]
  initialCategory?: string
  initialSubcategory?: string
  initialQuery?: string
  loading?: boolean
  onSearch?: (query: string, options?: any) => void
  onFilterChange?: (filters: any) => void
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
  children,
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
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMapView, setIsMapView] = useState(false)
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'map'>('grid')
  
  // Responsive
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  
  // Actualizar resultados cuando cambian las props iniciales
  useEffect(() => {
    if (initialResults && initialResults.length > 0) {
      setResults(initialResults)
    }
  }, [initialResults])
  
  // Manejar la búsqueda
  const handleSearch = (query: string, options?: any) => {
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
  
  // Manejar cambio de categoría
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setSubcategory('')
    setSelectedSubSubcategory('')
    
    // Llamar al callback si está definido
    if (onFilterChange) {
      onFilterChange({ category: newCategory, subcategory: '', subsubcategory: '' })
    }
  }
  
  // Manejar cambio de subcategoría
  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
    setSelectedSubSubcategory('')
    
    // Llamar al callback si está definido
    if (onFilterChange) {
      onFilterChange({ category, subcategory: newSubcategory, subsubcategory: '' })
    }
  }
  
  // Manejar cambio de subsubcategoría
  const handleSubSubcategoryChange = (newSubSubcategory: string) => {
    setSelectedSubSubcategory(newSubSubcategory)
    
    // Llamar al callback si está definido
    if (onFilterChange) {
      onFilterChange({ category, subcategory, subsubcategory: newSubSubcategory })
    }
  }
  
  // Alternar vista de mapa
  const toggleMapView = () => {
    setIsMapView(!isMapView)
    setCurrentView(currentView === 'map' ? 'grid' : 'map')
  }
  
  // Renderizar barra superior de búsqueda
  const renderSearchHeader = () => {
    return (
      <div className="mb-6">
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
  
  // Renderizar barra de filtros
  const renderFilterBar = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        {/* Información de resultados */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {searchQuery ? (
              <span>Resultados para "{searchQuery}"</span>
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
          {/* Botón de filtros (solo en móvil) */}
          {!isLg && (
            <button
              onClick={() => setIsFilterOpen(true)}
              className="p-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700"
              aria-label="Mostrar filtros"
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
          )}
          
          {/* Toggle de vista de mapa */}
          {showMap && (
            <button
              onClick={toggleMapView}
              className={`p-2 rounded-lg border ${
                isMapView 
                  ? 'bg-teal-500 border-teal-600 text-white' 
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              aria-label={isMapView ? "Mostrar lista" : "Mostrar mapa"}
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
  
  // Renderizar panel de filtros
  const renderFilters = () => {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Filtros</h2>
          
          {!isLg && (
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-slate-400 hover:text-white"
              aria-label="Cerrar filtros"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Aquí irían los filtros específicos */}
        {(
          <div>
          {/* Filtros por precío */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Precio</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Mínimo" 
                  className="w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="number" 
                  placeholder="Máximo" 
                  className="w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <button className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">
                Aplicar
              </button>
            </div>
          </div>
          
          {/* Filtro por ubicación */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Ubicación</h3>
            <select 
              className="w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-teal-500 focus:border-teal-500"
              aria-label="Filtrar por ubicación"
            >
              <option value="">Todas las ubicaciones</option>
              <option value="cusco">Cusco</option>
              <option value="lima">Lima</option>
              <option value="arequipa">Arequipa</option>
              <option value="trujillo">Trujillo</option>
            </select>
          </div>
          
          {/* Filtro por fecha */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Fecha de publicación</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" className="text-teal-500 focus:ring-teal-500" name="date" value="all" defaultChecked />
                <span className="ml-2 text-white">Todas</span>
              </label>
              <label className="flex items-center">
                <input type="radio" className="text-teal-500 focus:ring-teal-500" name="date" value="today" />
                <span className="ml-2 text-white">Hoy</span>
              </label>
              <label className="flex items-center">
                <input type="radio" className="text-teal-500 focus:ring-teal-500" name="date" value="week" />
                <span className="ml-2 text-white">Esta semana</span>
              </label>
              <label className="flex items-center">
                <input type="radio" className="text-teal-500 focus:ring-teal-500" name="date" value="month" />
                <span className="ml-2 text-white">Este mes</span>
              </label>
            </div>
          </div>
          
          {/* Más filtros específicos de categoría */}
          {category && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Filtros específicos</h3>
              <p className="text-slate-400 text-sm">
                Filtros adaptados para la categoría {category}
              </p>
            </div>
          )}
        
        
        {/* Botones de acción */}
        <div className="space-y-2">
          <button className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg">
            Aplicar filtros
          </button>
          <button className="w-full py-2 text-slate-300 hover:text-white transition-colors">
            Limpiar filtros
          </button>
        </div>
        </div>
        )}
      </div>
    )
  }
  
  // Renderizar modal de filtros para móvil
  const renderMobileFilterModal = () => {
    return (
      <AnimatePresence>
        {isFilterOpen && !isLg && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsFilterOpen(false)}
            />
            
            {/* Panel lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-[90%] max-w-md bg-slate-900 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {renderFilters()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* Cabecera de búsqueda */}
      {renderSearchHeader()}
      
      {/* Barra de filtro y controles */}
      {renderFilterBar()}
      
      {/* Contenido principal */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel de filtros (visible solo en desktop) */}
        {isLg && (
          <div className="w-full lg:w-72 flex-shrink-0">
            {renderFilters()}
          </div>
        )}
        
        {/* Resultados */}
        <div className="flex-grow">
          {isMapView ? (
            // Vista de mapa
            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 h-[600px] flex items-center justify-center">
              <p className="text-slate-400">Vista de mapa en desarrollo</p>
            </div>
          ) : (
            // Vista de resultados
            <SearchResults
              results={results}
              loading={loading}
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              activeCategory={category}
              showInteractionButtons={true}
              onPublicationClick={onPublicationClick}
              viewType={currentView}
            />
          )}
        </div>
      </div>
      
      {/* Modal de filtros para móvil */}
      {renderMobileFilterModal()}
    </div>
  )
} 