'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
    MapIcon,
    Squares2X2Icon,
    ListBulletIcon
} from '@heroicons/react/24/outline'
import SearchResults, { Publication } from './SearchResults'
import useMediaQuery from '@/hooks/useMediaQuery'
import AdvancedSearchBar from './AdvancedSearchBar'
import KeywordSearchBox from './KeywordSearchBox'
import CategorySelector from './CategorySelector'
import FilterChips from '@/components/search/FilterChips'
import { CategoriesService } from '@/services/categories.service'

// Componente simple de mapa (placeholder)
const MapComponent = ({ 
  className = '' 
}: { 
  publications?: Publication[],
  loading?: boolean,
  onMarkerClick?: (publication: Publication, e: React.MouseEvent<Element>) => void,
  className?: string
}) => (
  <div className={`${className} flex items-center justify-center`}>
    <p className="text-slate-400">Vista de mapa en desarrollo</p>
  </div>
);

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

type ViewMode = 'grid' | 'list' | 'map';

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
    showMap = true,
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
    const [currentView, setCurrentView] = useState<ViewMode>('grid')
    const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({})
    const [categories, setCategories] = useState<Array<{ 
      id: string, 
      name: string,
      subcategories?: Array<{
        id: string,
        name: string,
        subsubcategories?: Array<{
          id: string,
          name: string
        }>
      }>
    }>>([])

    // Responsive - solo usamos isMobile
    const isMobile = useMediaQuery('(max-width: 640px)')

    // --- Hooks (useEffect para cargar categorías y actualizar resultados) ---
    // (Sin cambios aquí, mantenemos la lógica existente)
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

    useEffect(() => {
        // Solo actualiza si initialResults es diferente de nulo/undefined
        // Evita borrar resultados si initialResults viene vacío en renderizados posteriores
        if (initialResults) {
             setResults(initialResults);
        }
    }, [initialResults]);

    // --- Manejadores de eventos (handleSearch, handleCategoryChange, etc.) ---
    // (Sin cambios aquí, mantenemos la lógica existente para búsqueda y filtros)
    const handleSearch = (query: string, options?: Record<string, string>) => {
        setSearchQuery(query)
        const newParams = new URLSearchParams(searchParams?.toString());

        if (query) newParams.set('q', query); else newParams.delete('q');
        if (options?.category) { setCategory(options.category); newParams.set('category', options.category); }
        if (options?.subcategory) { setSubcategory(options.subcategory); newParams.set('subcategory', options.subcategory); }
        if (options?.subsubcategory) { setSelectedSubSubcategory(options.subsubcategory); newParams.set('subsubcategory', options.subsubcategory); }

        const combinedOptions = {
            category: options?.category || category,
            subcategory: options?.subcategory || subcategory,
            subsubcategory: options?.subsubcategory || selectedSubSubcategory,
            ...activeFilters // Incluir filtros activos si es necesario
        };

        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });

        if (onSearch) {
            onSearch(query, combinedOptions);
        } else if (onFilterChange) { // Fallback to onFilterChange if onSearch not provided
            onFilterChange({ ...combinedOptions, q: query });
        }
    }

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        setSubcategory('');
        setSelectedSubSubcategory('');
        setActiveFilters({});
        const currentQuery = searchQuery || '';
        const filtersToApply = { category: newCategory, subcategory: '', subsubcategory: '', q: currentQuery };

        // Actualizar URL
        const params = new URLSearchParams(searchParams?.toString());
        if (newCategory) params.set('category', newCategory); else params.delete('category');
        params.delete('subcategory');
        params.delete('subsubcategory');
        // Eliminar filtros específicos de atributos al cambiar categoría
        Object.keys(activeFilters).forEach(key => params.delete(key));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });


        if (onFilterChange) {
            onFilterChange(filtersToApply);
        }
    }

     const handleSubcategoryChange = (newSubcategory: string) => {
        setSubcategory(newSubcategory);
        setSelectedSubSubcategory('');
        const currentQuery = searchQuery || '';
        const filtersToApply = { ...activeFilters, category, subcategory: newSubcategory, subsubcategory: '', q: currentQuery };

        // Actualizar URL
        const params = new URLSearchParams(searchParams?.toString());
        if (newSubcategory) params.set('subcategory', newSubcategory); else params.delete('subcategory');
        params.delete('subsubcategory');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });

        if (onFilterChange) {
            onFilterChange(filtersToApply);
        }
    }

    const handleSubSubcategoryChange = (newSubSubcategory: string) => {
        setSelectedSubSubcategory(newSubSubcategory);
        const currentQuery = searchQuery || '';
        const filtersToApply = { ...activeFilters, category, subcategory, subsubcategory: newSubSubcategory, q: currentQuery };

        // Actualizar URL
        const params = new URLSearchParams(searchParams?.toString());
        if (newSubSubcategory) params.set('subsubcategory', newSubSubcategory); else params.delete('subsubcategory');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });

        if (onFilterChange) {
            onFilterChange(filtersToApply);
        }
    }


    const handleFilterChange = (newFilters: Record<string, unknown>) => {
        // Combina filtros anteriores y nuevos si es necesario, o reemplaza
        const updatedFilters = { ...activeFilters, ...newFilters };
        // Eliminar filtros con valor undefined, null o ''
        Object.keys(updatedFilters).forEach(key => {
             if (updatedFilters[key] === undefined || updatedFilters[key] === null || updatedFilters[key] === '') {
                  delete updatedFilters[key];
             }
        });

        setActiveFilters(updatedFilters);

         // Actualizar URL con los filtros
        const params = new URLSearchParams(searchParams?.toString());
        Object.entries(updatedFilters).forEach(([key, value]) => {
             if (value !== undefined && value !== null && value !== '') {
                  params.set(key, String(value));
             } else {
                  params.delete(key);
             }
        });
         // Asegurarse de que las categorías y query estén presentes si existen
         if (category) params.set('category', category);
         if (subcategory) params.set('subcategory', subcategory);
         if (selectedSubSubcategory) params.set('subsubcategory', selectedSubSubcategory);
         if (searchQuery) params.set('q', searchQuery);

         router.push(`${pathname}?${params.toString()}`, { scroll: false });


        if (onFilterChange) {
            onFilterChange({
                ...updatedFilters,
                category,
                subcategory,
                subsubcategory: selectedSubSubcategory,
                q: searchQuery || '' // Incluir query actual
            });
        }
    }

    // REMOVED: toggleMapView ya no es necesaria, usamos setCurrentView directamente


    // --- Renderizadores de secciones (renderSearchHeader, renderCategorySelector) ---
    // (Sin cambios aquí)
     const renderSearchHeader = () => {
        return (
            <div className="mb-2">
                <div className="flex flex-col gap-4">
                    {useEnhancedSearch ? (
                        <KeywordSearchBox
                            initialValue={searchQuery}
                            onSearch={handleSearch}
                            appearance="dark"
                            showLabel={false}
                            autoFocus={false} // Cambiado a false para evitar autofocus indeseado en recargas/filtros
                            placeholder="¿Qué estás buscando hoy?"
                            showVoiceSearch={true}
                            showImageSearch={true}
                            showAiAssist={true}
                            className="w-full"
                        />
                    ) : (
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

     const renderCategorySelector = () => {
        return (
            <div className="mb-2">
                <div className="flex flex-col">
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

    // --- MODIFICADO: Renderizar barra de filtros con los nuevos botones de vista ---
    const renderFilterBar = () => {
        return (
            <div className="flex items-center justify-between mb-3">
                {/* Información de resultados */}
                <div>
                     {/* Título dinámico */}
                     <h1 className="text-xl font-bold text-white">
                         {searchQuery ? `Resultados para "${searchQuery}"` :
                          selectedSubSubcategory && subcategory && category ? 
                            categories.find(c => c.id === category)?.subcategories?.find(sc => sc.id === subcategory)?.subsubcategories?.find(ssc => ssc.id === selectedSubSubcategory)?.name :
                          subcategory && category ?
                            categories.find(c => c.id === category)?.subcategories?.find(sc => sc.id === subcategory)?.name :
                          category ? 
                            categories.find(c => c.id === category)?.name :
                          'Todos los anuncios'}
                     </h1>
                    <p className="text-sm text-slate-400">
                        {loading ? 'Buscando...' : `${totalResults || results.length} anuncios encontrados`}
                    </p>
                </div>

                {/* Controles de vista - AHORA INDEPENDIENTES Y AGRUPADOS */}
                <div className="inline-flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                     {/* Botón Vista Cuadrícula */}
                     <button
                         className={`p-2 rounded transition-colors duration-200 ${
                             currentView === 'grid'
                                 ? 'bg-teal-500 text-white'
                                 : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                         }`}
                         onClick={() => setCurrentView('grid')}
                         aria-label="Ver en cuadrícula"
                         title="Vista Cuadrícula"
                     >
                         <Squares2X2Icon className="w-5 h-5" />
                     </button>

                     {/* Botón Vista Lista */}
                     <button
                         className={`p-2 rounded transition-colors duration-200 ${
                             currentView === 'list'
                                 ? 'bg-teal-500 text-white'
                                 : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                         }`}
                         onClick={() => setCurrentView('list')}
                         aria-label="Ver en lista"
                         title="Vista Lista"
                     >
                         <ListBulletIcon className="w-5 h-5" />
                     </button>

                     {/* Botón Vista Mapa (condicional) */}
                     {showMap && (
                         <button
                             className={`p-2 rounded transition-colors duration-200 ${
                                 currentView === 'map'
                                     ? 'bg-teal-500 text-white'
                                     : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                             }`}
                             onClick={() => setCurrentView('map')}
                             aria-label="Ver en mapa"
                             title="Vista Mapa"
                         >
                             <MapIcon className="w-5 h-5" />
                         </button>
                     )}
                 </div>
            </div>
        )
    }

    // --- Renderizado Principal ---
    return (
        <div className={`w-full ${className}`}>
            {/* Selector de Categorías */}
            {renderCategorySelector()}

            {/* Cabecera de búsqueda */}
            {renderSearchHeader()}

             {/* Barra de Filtros Horizontales y Chips (puedes ajustar su posición) */}
            {category && ( // Mostrar solo si hay una categoría seleccionada
                 <div className="mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      {/* Ejemplo: Botón para abrir filtros avanzados (si usas AdvancedFilterDrawer) */}
                      {/*
                      <AdvancedFilterDrawer
                           activeFilters={activeFilters}
                           onApplyFilters={handleFilterChange}
                           category={category} // Pasa la categoría para filtros específicos
                      >
                           <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm">
                                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                <span>Filtros ({filterCount})</span>
                           </button>
                      </AdvancedFilterDrawer>
                      */}

                      {/* Barra de filtros horizontales (ejemplo) */}
                      {/* <HorizontalFilterBar filters={definicionDeFiltros} onChange={handleFilterChange} /> */}

                      {/* Chips de filtros - Nuevo diseño */}
                      <div className="mb-2 relative z-20 overflow-visible">
                        <FilterChips
                          category={category}
                          activeFilters={activeFilters}
                          onFilterChange={handleFilterChange}
                          className="pt-1 pb-0"
                        />
                      </div>
                 </div>
             )}

            {/* Barra de filtro con total y controles de vista */}
            {renderFilterBar()}

            {/* Contenido principal (Resultados o Mapa) */}
            <div className="flex flex-col lg:flex-row gap-3">
                {/* Resultados/Mapa */}
                <div className="flex-grow w-full">
                    {currentView === 'map' && showMap ? ( // Mostrar mapa solo si está habilitado y seleccionado
                        <MapComponent
                            publications={results}
                            loading={loading}
                            onMarkerClick={onPublicationClick} // O un manejador específico para el mapa
                            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 min-h-[400px] lg:min-h-[600px]" // Estilo ejemplo
                        />
                    ) : (
                        // Vista de resultados (Grid o Lista)
                        <SearchResults
                            results={results}
                            loading={loading}
                            // hasMore={hasMore} // Ya no se pasa hasMore, el botón está abajo
                            activeCategory={category}
                            showInteractionButtons={true}
                            onPublicationClick={onPublicationClick}
                            viewType={currentView === 'map' ? 'grid' : currentView} // Pasa grid/list. Si está en map, muestra grid por defecto al volver.
                        />
                    )}

                    {/* Botón Cargar Más (solo si no estamos en vista de mapa) */}
                    {currentView !== 'map' && hasMore && onLoadMore && (
                        <div className="mt-6 text-center"> {/* Aumentado margen superior */}
                            <button
                                onClick={onLoadMore}
                                disabled={loading} // Deshabilitar mientras carga
                                className={`px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Cargando...' : 'Cargar más resultados'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}