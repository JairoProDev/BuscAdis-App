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

// Agregar estas definiciones de tipos cerca del inicio del archivo, antes de las interfaces
type FilterValue = string | number | boolean | null;

interface SearchLayoutProps {
    initialResults?: Publication[]
    initialCategory?: string
    initialSubcategory?: string
    initialQuery?: string
    loading?: boolean
    onSearch?: (query: string, options?: Record<string, string>) => void
    onFilterChange?: (filters: Record<string, FilterValue>) => void
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
    const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({})
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


    const handleFilterChange = (newFilters: Record<string, FilterValue>) => {
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

    // Agregar estos estilos CSS personalizados
    // En algún lugar cerca del final del archivo, antes del return final
    const customStyles = {
        scrollbarThin: "scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-500",
        cardHover: "transition-transform duration-200 hover:translate-y-[-4px] hover:shadow-lg",
        glassEffect: "backdrop-filter backdrop-blur-sm bg-opacity-80",
        slateGradient: "bg-gradient-to-b from-slate-800 to-slate-900"
    };

    // --- Renderizado Principal - COMPLETAMENTE RESTRUCTURADO
    return (
        <div className={`w-full ${className}`}>
            {/* COMPLETELY RESTRUCTURED: Fixed two-column layout */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] min-h-[600px]">
                {/* LEFT COLUMN - Search interface and results */}
                <div className="w-full lg:w-1/2 lg:pr-4">
                    {/* Category selector - constrained to left column */}
                    <div className="mb-4">
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
                    
                    {/* Search bar - constrained to left column */}
                    <div className="mb-4">
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
                                isMobile={isMobile}
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
                    
                    {/* Filter chips - constrained to left column */}
                    {category && (
                        <div className="mb-4">
                            <div className={`overflow-x-auto pb-2 ${customStyles.scrollbarThin}`}>
                                <div className="flex flex-nowrap w-full">
                                    <FilterChips
                                        category={category}
                                        activeFilters={activeFilters}
                                        onFilterChange={handleFilterChange}
                                        className="pt-1 pb-0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Result header and view toggles - constrained to left column */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
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

                        {/* View toggle buttons - ONLY IN LEFT COLUMN */}
                        <div className="inline-flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                            {/* Grid view button */}
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

                            {/* List view button */}
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
                    </div>
                    
                    {/* Search results - scrollable area in left column */}
                    <div className="h-[calc(100vh-300px)] overflow-y-auto pr-2 pb-24">
                        <SearchResults
                            results={results}
                            loading={loading}
                            activeCategory={category}
                            showInteractionButtons={true}
                            onPublicationClick={(pub, e) => {
                                e.preventDefault();
                                handleSelectPublication(pub);
                                
                                // Actualizar URL con datos de la publicación seleccionada
                                const newParams = new URLSearchParams(searchParams?.toString());
                                if (pub.id) newParams.set('publicationId', pub.id);
                                if (pub.title) {
                                    const titleSlug = pub.title.toLowerCase()
                                        .replace(/[^\w\s-]/g, '')
                                        .replace(/\s+/g, '-');
                                    newParams.set('title', titleSlug);
                                }
                                router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
                                
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
                </div>
                
                {/* RIGHT COLUMN - Map or Publication details */}
                {!isMobile && showMap && (
                    <div className="w-full lg:w-1/2 lg:pl-4 h-full">
                        <div className="relative h-full">
                            {/* Toggle button for map visibility */}
                            <button
                                className="absolute top-4 right-4 z-10 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-lg"
                                onClick={toggleMapVisibility}
                                aria-label={isMapVisible ? 'Ocultar mapa' : 'Mostrar mapa'}
                                title={isMapVisible ? 'Ocultar mapa' : 'Mostrar mapa'}
                            >
                                <MapIcon className="w-5 h-5" />
                                <span className="font-medium">{isMapVisible ? 'Ocultar mapa' : 'Mostrar mapa'}</span>
                            </button>
                            
                            {/* Either show the map or publication details */}
                            {selectedPublication ? (
                                // Diseño mejorado para los detalles de la publicación
                                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 h-full flex flex-col">
                                    {/* Cabecera con título y botones de acción */}
                                    <div className="flex justify-between items-start p-4 border-b border-slate-700">
                                        <h2 className="text-2xl font-bold text-white leading-tight">{selectedPublication.title}</h2>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                                                aria-label="Compartir"
                                                title="Compartir"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setSelectedPublication(null)}
                                                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                                                aria-label="Cerrar detalles"
                                                title="Cerrar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto">
                                        {/* Galería de imágenes */}
                                        {selectedPublication.images && selectedPublication.images.length > 0 && (
                                            <div className="relative">
                                                <div className="relative h-72 overflow-hidden">
                                                    <img
                                                        src={selectedPublication.images[0]}
                                                        alt={selectedPublication.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Indicador de imágenes */}
                                                    {selectedPublication.images.length > 1 && (
                                                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                                                            1/{selectedPublication.images.length}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Miniaturas si hay más de una imagen */}
                                                {selectedPublication.images.length > 1 && (
                                                    <div className="flex overflow-x-auto p-2 gap-2 bg-slate-900">
                                                        {selectedPublication.images.map((img, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                className="h-16 w-24 flex-shrink-0 rounded-md overflow-hidden border-2 border-transparent hover:border-teal-500 cursor-pointer transition-all"
                                                            >
                                                                <img src={img} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="p-4">
                                            {/* Precio y datos principales */}
                                            <div className="flex flex-wrap justify-between items-start mb-4">
                                                <div>
                                                    {selectedPublication.price && (
                                                        <p className="text-3xl font-bold text-teal-400 mb-1">
                                                            {new Intl.NumberFormat('es-PE', {
                                                                style: 'currency',
                                                                currency: selectedPublication.currency || 'PEN',
                                                                maximumFractionDigits: 0
                                                            }).format(selectedPublication.price)}
                                                            {selectedPublication.negotiable && 
                                                                <span className="text-sm font-normal text-teal-300 ml-2">Negociable</span>
                                                            }
                                                        </p>
                                                    )}
                                                    
                                                    {/* Fecha de publicación */}
                                                    <div className="flex items-center text-slate-400 text-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Publicado {selectedPublication.publishedAt || 'recientemente'}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Botones de acción (favorito, compartir) */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button 
                                                        className="flex items-center gap-1 py-1 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                                        aria-label="Me gusta"
                                                        title="Me gusta"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Favorito</span>
                                                    </button>
                                                    <button 
                                                        className="flex items-center gap-1 py-1 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                                        aria-label="Guardar"
                                                        title="Guardar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Guardar</span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Ubicación */}
                                            {selectedPublication.location && typeof selectedPublication.location !== 'string' && (
                                                <div className="mb-4 bg-slate-750 p-3 rounded-lg">
                                                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Ubicación
                                                    </h3>
                                                    <p className="text-slate-300">
                                                        {[
                                                            selectedPublication.location.address, 
                                                            selectedPublication.location.district, 
                                                            selectedPublication.location.province
                                                        ].filter(Boolean).join(', ')}
                                                    </p>
                                                    
                                                    {/* Mini mapa estático (simulado) */}
                                                    {selectedPublication.location.coordinates && (
                                                        <div className="mt-2 h-24 bg-slate-700 rounded-lg flex items-center justify-center">
                                                            <span className="text-sm text-slate-400">Ver ubicación en mapa</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Descripción */}
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
                                                <div className="text-slate-300 whitespace-pre-line">
                                                    {selectedPublication.description || "No hay descripción disponible"}
                                                </div>
                                            </div>
                                            
                                            {/* Características adicionales */}
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold text-white mb-2">Características</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedPublication.attributes && Object.entries(selectedPublication.attributes).map(([key, value]) => (
                                                        <div key={key} className="flex items-center p-2 bg-slate-750 rounded-lg">
                                                            <span className="text-teal-400 font-medium mr-2">{key}:</span>
                                                            <span className="text-slate-300">{value}</span>
                                                        </div>
                                                    ))}
                                                    
                                                    {/* Si no hay atributos, mostrar algunos datos de ejemplo basados en la categoría */}
                                                    {(!selectedPublication.attributes || Object.keys(selectedPublication.attributes).length === 0) && (
                                                        <>
                                                            <div className="flex items-center p-2 bg-slate-750 rounded-lg">
                                                                <span className="text-teal-400 font-medium mr-2">Categoría:</span>
                                                                <span className="text-slate-300">{category || 'General'}</span>
                                                            </div>
                                                            <div className="flex items-center p-2 bg-slate-750 rounded-lg">
                                                                <span className="text-teal-400 font-medium mr-2">Estado:</span>
                                                                <span className="text-slate-300">Disponible</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Información del vendedor */}
                                            <div className="mb-4 bg-slate-750 p-3 rounded-lg">
                                                <h3 className="text-lg font-semibold text-white mb-2">Vendedor</h3>
                                                <div className="flex items-center mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold mr-3">
                                                        {selectedPublication.seller?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{selectedPublication.seller?.name || 'Usuario de BuscAdis'}</p>
                                                        <p className="text-sm text-slate-400">Miembro desde {selectedPublication.seller?.joinDate || '2023'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-300">
                                                    {selectedPublication.seller?.description || 'Sin información adicional del vendedor'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Botones de contacto */}
                                    <div className="p-4 border-t border-slate-700 bg-slate-850">
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <button 
                                                className="flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors"
                                                aria-label="Llamar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                Llamar ahora
                                            </button>
                                            <button 
                                                className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                                                aria-label="WhatsApp"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                </svg>
                                                WhatsApp
                                            </button>
                                        </div>
                                        <button 
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                                            aria-label="Ver completo"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Ver anuncio completo
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
                )}
                
                {/* Mobile-only floating map button when map is hidden */}
                {isMobile && showMap && (
                    <button
                        className="fixed bottom-4 right-4 bg-teal-500 text-white p-3 rounded-full shadow-lg z-10"
                        onClick={toggleMapVisibility}
                        aria-label="Ver mapa"
                        title="Ver mapa"
                    >
                        <MapIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    )
}