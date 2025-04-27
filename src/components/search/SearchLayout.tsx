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
import { MapView } from './MapView'
import { SplitLayout } from './SplitLayout'

// Remove this placeholder component since we have the real MapView component
// const MapComponent = ({ 
//   className = '' 
// }: { 
//   publications?: Publication[],
//   loading?: boolean,
//   onMarkerClick?: (publication: Publication, e: React.MouseEvent<Element>) => void,
//   className?: string
// }) => (
//   <div className={`${className} flex items-center justify-center`}>
//     <p className="text-slate-400">Vista de mapa en desarrollo</p>
//   </div>
// );

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

type ViewMode = 'grid' | 'list';

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
    const [listViewMode, setListViewMode] = useState<ViewMode>('grid')
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
    // New state for the selected publication in map view
    const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
    // State to control map visibility
    const [isMapVisible, setIsMapVisible] = useState(true)

    // Responsive - solo usamos isMobile
    const isMobile = useMediaQuery('(max-width: 640px)')
    const isTablet = useMediaQuery('(max-width: 1024px)')

    // --- Hooks (useEffect para cargar categorías y actualizar resultados) ---
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
        if (initialResults) {
             setResults(initialResults);
        }
    }, [initialResults]);

    // Add a function to handle publication selection in the map
    const handleSelectPublication = (publication: Publication | null) => {
        setSelectedPublication(publication);
    }

    // Toggle map visibility
    const toggleMapVisibility = () => {
        setIsMapVisible(!isMapVisible);
        if (selectedPublication && !isMapVisible) {
            // If we're showing the map again and there's a selected publication, clear it
            setSelectedPublication(null);
        }
    }

    // --- Manejadores de eventos (handleSearch, handleCategoryChange, etc.) ---
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

    // --- Renderizadores de secciones (renderSearchHeader, renderCategorySelector) ---
    const renderSearchHeader = () => {
        return (
            <div className="mb-2">
                <div className="flex flex-col gap-4 max-w-3xl">
                    {useEnhancedSearch ? (
                        <KeywordSearchBox
                            initialValue={searchQuery}
                            onSearch={handleSearch}
                            appearance="dark"
                            showLabel={false}
                            autoFocus={false}
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
            <div className="mb-4">
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

    // --- MODIFICADO: Renderizar barra de filtros con los botones de vista y mapa ---
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

                {/* Controles de vista */}
                <div className="flex items-center gap-2">
                    {/* Toggle de vista para los resultados */}
                    <div className="inline-flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                        {/* Botón Vista Cuadrícula */}
                        <button
                            className={`p-2 rounded transition-colors duration-200 ${
                                listViewMode === 'grid'
                                    ? 'bg-teal-500 text-white'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                            onClick={() => setListViewMode('grid')}
                            aria-label="Ver en cuadrícula"
                            title="Vista Cuadrícula"
                        >
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>

                        {/* Botón Vista Lista */}
                        <button
                            className={`p-2 rounded transition-colors duration-200 ${
                                listViewMode === 'list'
                                    ? 'bg-teal-500 text-white'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                            onClick={() => setListViewMode('list')}
                            aria-label="Ver en lista"
                            title="Vista Lista"
                        >
                            <ListBulletIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Botón para mostrar/ocultar el mapa */}
                    {showMap && !isMobile && (
                        <button
                            className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                                isMapVisible
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                            }`}
                            onClick={toggleMapVisibility}
                            aria-label={isMapVisible ? 'Ocultar mapa' : 'Mostrar mapa'}
                        >
                            <MapIcon className="w-5 h-5" />
                            <span className="font-medium">{isMapVisible ? 'Ocultar mapa' : 'Mostrar mapa'}</span>
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // --- Renderizado Principal (reestructurado completamente) ---
    return (
        <div className={`w-full ${className}`}>
            {/* Top content section with increased spacing */}
            <div className="mb-6">
                {/* Selector de Categorías */}
                {renderCategorySelector()}

                {/* Cabecera de búsqueda with increased spacing */}
                <div className="mb-4">
                    {renderSearchHeader()}
                </div>

                {/* Filtros */}
                {category && (
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
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

                {/* Barra de filtro y controles */}
                {renderFilterBar()}
            </div>

            {/* Contenido principal - Layout dividido o completo */}
            {!isMobile && isMapVisible ? (
                // Desktop view with map - adjust the proportions (60/40 split)
                <div className="flex h-[calc(100vh-280px)] min-h-[500px]">
                    {/* Left panel - publications list - make wider (60%) */}
                    <div className="w-3/5 pr-3 overflow-auto">
                        <SearchResults
                            results={results}
                            loading={loading}
                            activeCategory={category}
                            showInteractionButtons={true}
                            onPublicationClick={(pub, e) => {
                                e.preventDefault();
                                handleSelectPublication(pub);
                                if (onPublicationClick) onPublicationClick(pub, e);
                            }}
                            viewType={listViewMode}
                        />
                        
                        {/* Load more button */}
                        {hasMore && onLoadMore && (
                            <div className="mt-6 mb-4 text-center">
                                <button
                                    onClick={onLoadMore}
                                    disabled={loading}
                                    className={`px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Cargando...' : 'Cargar más resultados'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right panel - map or publication details - make narrower (40%) */}
                    <div className="w-2/5 pl-2">
                        {selectedPublication ? (
                            // Publication details
                            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 h-full p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-white">{selectedPublication.title}</h2>
                                    <button
                                        onClick={() => setSelectedPublication(null)}
                                        className="p-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300"
                                        aria-label="Cerrar detalles"
                                        title="Cerrar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {selectedPublication.images && selectedPublication.images.length > 0 && (
                                    <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                                        <img
                                            src={selectedPublication.images[0]}
                                            alt={selectedPublication.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                {selectedPublication.price && (
                                    <p className="text-2xl font-bold text-teal-400 mb-2">
                                        {new Intl.NumberFormat('es-PE', {
                                            style: 'currency',
                                            currency: selectedPublication.currency || 'PEN',
                                            maximumFractionDigits: 0
                                        }).format(selectedPublication.price)}
                                    </p>
                                )}
                                
                                <p className="text-slate-300 mb-4">{selectedPublication.description}</p>
                                
                                {selectedPublication.location && typeof selectedPublication.location !== 'string' && (
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-white mb-2">Ubicación</h3>
                                        <div className="flex items-center text-slate-400 mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>
                                                {[
                                                    selectedPublication.location.address, 
                                                    selectedPublication.location.district, 
                                                    selectedPublication.location.province
                                                ].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex gap-2 mt-4">
                                    <button 
                                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                        aria-label="Me gusta"
                                        title="Me gusta"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    <button 
                                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                        aria-label="Guardar"
                                        title="Guardar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Map view
                            <MapView
                                publications={results}
                                selectedPublicationId={null}
                                onSelectPublication={handleSelectPublication}
                                loading={loading}
                                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 h-full"
                            />
                        )}
                    </div>
                </div>
            ) : (
                // Vista móvil o mapa oculto - vista completa
                <div>
                    <SearchResults
                        results={results}
                        loading={loading}
                        activeCategory={category}
                        showInteractionButtons={true}
                        onPublicationClick={onPublicationClick}
                        viewType={listViewMode}
                    />
                    
                    {/* Botón Cargar Más */}
                    {hasMore && onLoadMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={onLoadMore}
                                disabled={loading}
                                className={`px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Cargando...' : 'Cargar más resultados'}
                            </button>
                        </div>
                    )}

                    {/* Para móviles, mostrar un botón flotante para abrir el mapa */}
                    {isMobile && showMap && (
                        <button
                            className="fixed bottom-4 right-4 bg-teal-500 text-white p-3 rounded-full shadow-lg z-10"
                            onClick={toggleMapVisibility}
                            aria-label="Ver mapa"
                        >
                            <MapIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}