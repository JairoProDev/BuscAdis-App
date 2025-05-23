'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
    // MapIcon, // Eliminado porque la funcionalidad del mapa fue removida en la versión "después"
    Squares2X2Icon,
    ListBulletIcon
} from '@heroicons/react/24/outline'
import SearchResults from './SearchResults'
import useMediaQuery from '@/hooks/useMediaQuery'
import AdvancedSearchBar from './AdvancedSearchBar' // Asegúrate que la ruta sea correcta
import KeywordSearchBox from './KeywordSearchBox'   // Asegúrate que la ruta sea correcta
import CategorySelector from './CategorySelector'
import FilterChips from '@/components/search/FilterChips'
import { CategoriesService } from '@/services/categories.service'
// import { MapView } from './MapView' // Eliminado porque la funcionalidad del mapa fue removida
import type { Publication } from '@/types/publications'
import type { Publication as SearchResultsPublication } from './SearchResults'


type FilterValue = string | number | boolean | (string | number)[] | null;

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
    onPublicationClick?: (publication: Publication, e: React.MouseEvent<HTMLAnchorElement>) => void
    children?: ReactNode
    className?: string
    useEnhancedSearch?: boolean
}

type ViewMode = 'grid' | 'list';

// Adaptador para SearchResults y MapView
function adaptPublicationForSearchResults(pub: Publication): SearchResultsPublication {
  return {
    ...pub,
    id: String(pub._id || pub.id || 'fallback-id'),
    price: pub.amount ?? 0,
    contactName: pub.contact?.name || '',
    contactPhone: pub.contact?.phones?.[0] || '', // Agregado para SearchResults
    currency: pub.currency || 'PEN',
    status: 'active', // Asumiendo que todas las que llegan aquí están activas
    location: pub.location && typeof pub.location === 'object'
        ? {
            city: pub.location.city || undefined,
            region: pub.location.region || undefined,
            district: pub.location.district || undefined,
            province: pub.location.province || undefined,
            address: pub.location.address || '',
            neighborhood: pub.location.neighborhood || undefined,
          }
        : (typeof pub.location === 'string' ? pub.location : 'Ubicación no especificada'),
    createdAt: pub.createdAt ? new Date(pub.createdAt).toISOString() : new Date().toISOString(),
    attributes: pub.attributes || {},
    images: pub.images || [],
    premium: pub.premium || false,
    slug: pub.slug || undefined,
    categorySlug: pub.categorySlug || 'unknown',
    subcategorySlug: pub.subcategorySlug || undefined,
    subSubcategorySlug: pub.subSubcategorySlug || undefined,
    // Otros campos según necesidad
  };
}

// Función para adaptar de vuelta si es necesario (reverseAdapter)
function reverseAdaptPublication(pub: SearchResultsPublication): Publication {
  const originalLocation = typeof pub.location === 'object'
    ? {
        city: pub.location.city,
        region: pub.location.region,
        district: pub.location.district,
        province: pub.location.province,
        address: pub.location.address,
        neighborhood: pub.location.neighborhood,
        // Asegúrate de que `coordinates` se maneje si es necesario
      }
    : { province: 'Cusco', address: pub.location || '' }; // Fallback si es string

  return {
    _id: String(pub.id || 'fallback-id'), // Asumiendo que quieres mantener _id
    id: String(pub.id || 'fallback-id'),
    title: pub.title,
    description: pub.description,
    amount: pub.price ?? 0,
    currency: pub.currency || 'PEN',
    categorySlug: pub.categorySlug,
    subcategorySlug: pub.subcategorySlug,
    subSubcategorySlug: pub.subSubcategorySlug,
    location: originalLocation as any, // Puede requerir un tipado más específico
    contact: {
        name: pub.contactName || '',
        phones: pub.contactPhone ? [pub.contactPhone] : [],
        email: pub.contactEmail || undefined
    },
    images: pub.images,
    premium: pub.premium,
    attributes: pub.attributes || {},
    createdAt: pub.createdAt ? new Date(pub.createdAt) : undefined,
    slug: pub.slug,
    // ...otros campos obligatorios de tu tipo Publication
  } as Publication;
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
    onPublicationClick,
    className = '',
    useEnhancedSearch = true, // Valor por defecto
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
    const [categoriesData, setCategoriesData] = useState<Array<{ // Renombrado para evitar conflicto con 'category' state
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

    // Responsive - solo usamos isMobile
    const isMobile = useMediaQuery('(max-width: 640px)')

    // --- Hooks (useEffect para cargar categorías y actualizar resultados) ---
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await CategoriesService.getCategories()
                setCategoriesData(response) // Usar el estado renombrado
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

    // --- Manejadores de eventos (handleSearch, handleCategoryChange, etc.) ---
    const handleSearch = (query: string, options?: Record<string, string>) => {
        setSearchQuery(query)
        const newParams = new URLSearchParams(searchParams?.toString());

        if (query) newParams.set('q', query); else newParams.delete('q');
        if (options?.category) { setCategory(options.category); newParams.set('category', options.category); }
        else if (options?.category === '') { setCategory(''); newParams.delete('category');} // Permitir limpiar categoría

        if (options?.subcategory) { setSubcategory(options.subcategory); newParams.set('subcategory', options.subcategory); }
        else if (options?.subcategory === '') { setSubcategory(''); newParams.delete('subcategory');}


        if (options?.subsubcategory) { setSelectedSubSubcategory(options.subsubcategory); newParams.set('subsubcategory', options.subsubcategory); }
        else if (options?.subsubcategory === '') { setSelectedSubSubcategory(''); newParams.delete('subsubcategory');}


        const combinedOptions = {
            category: options?.category !== undefined ? options.category : category,
            subcategory: options?.subcategory !== undefined ? options.subcategory : subcategory,
            subsubcategory: options?.subsubcategory !== undefined ? options.subsubcategory : selectedSubSubcategory,
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

    // Agregar estos estilos CSS personalizados
    const customStyles = {
        scrollbarThin: "scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-500",
        cardHover: "transition-transform duration-200 hover:translate-y-[-4px] hover:shadow-lg",
        glassEffect: "backdrop-filter backdrop-blur-sm bg-opacity-80",
        slateGradient: "bg-gradient-to-b from-slate-800 to-slate-900"
    };

    // Modulariza la vista de detalles de publicación
    function PublicationDetailsPanel({ publication, onClose }: { publication: Publication, onClose: () => void }) {
        return (
            <aside
                className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md h-full flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label={`Detalles de ${publication.title}`}
            >
                {/* Cabecera */}
                <div className="flex justify-between items-start p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-2" title={publication.title}>{publication.title}</h2>
                    <button
                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                        aria-label="Cerrar detalles"
                        title="Cerrar"
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {/* Galería de imágenes */}
                <div className="flex-1 overflow-y-auto">
                    {publication.images && publication.images.length > 0 ? (
                        <div className="relative">
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={publication.images[0]}
                                    alt={publication.title}
                                    className="w-full h-full object-cover"
                                />
                                {publication.images.length > 1 && (
                                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                                        1/{publication.images.length}
                                    </div>
                                )}
                            </div>
                            {publication.images.length > 1 && (
                                <div className="flex overflow-x-auto p-2 gap-2 bg-slate-100 dark:bg-slate-900">
                                    {publication.images.map((img, idx) => (
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
                    ) : (
                        <div className="flex items-center justify-center h-72 bg-slate-100 dark:bg-slate-900">
                            <p className="text-slate-500 dark:text-slate-400">No hay imágenes disponibles</p>
                        </div>
                    )}
                    <div className="p-4">
                        {/* Precio y datos principales */}
                        <div className="flex flex-wrap justify-between items-start mb-4">
                            <div>
                                {typeof publication.amount === 'number' && (
                                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                                        {new Intl.NumberFormat('es-PE', {
                                            style: 'currency',
                                            currency: publication.currency || 'PEN',
                                            maximumFractionDigits: 0
                                        }).format(publication.amount)}
                                        {(publication as any).negotiable && ( // Type assertion if negotiable is not in Publication
                                            <span className="text-sm font-normal text-teal-500 dark:text-teal-300 ml-2">Negociable</span>
                                        )}
                                    </p>
                                )}
                                {/* Fecha de publicación (usando createdAt) */}
                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Publicado {publication.createdAt ? new Date(publication.createdAt).toLocaleDateString() : 'recientemente'}</span>
                                </div>
                            </div>
                            {/* Botones de acción (compartir) */}
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    className="flex items-center gap-1 py-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-white rounded-lg transition-colors"
                                    aria-label="Compartir"
                                    title="Compartir"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* Ubicación */}
                        {publication.location && typeof publication.location === 'object' && (
                            <div className="mb-4 bg-slate-750 p-3 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Ubicación
                                </h3>
                                <p className="text-slate-300">
                                    {[(publication.location as any).address, (publication.location as any).district, (publication.location as any).province].filter(Boolean).join(', ')}
                                </p>
                                {(publication.location as any).coordinates && (
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
                                {publication.description || 'No hay descripción disponible'}
                            </div>
                        </div>
                        {/* Características adicionales */}
                        {publication.attributes && Object.keys(publication.attributes).length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Características</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(publication.attributes).map(([key, value]) => (
                                        typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? (
                                            <div key={key} className="flex items-center p-2 bg-slate-750 rounded-lg">
                                                <span className="text-teal-400 font-medium mr-2 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                <span className="text-slate-300">{String(value)}</span>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Información de contacto */}
                        <div className="mb-4 bg-slate-750 p-3 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-2">Contacto</h3>
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold mr-3">
                                    {publication.contact?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{publication.contact?.name || 'Usuario de BuscAdis'}</p>
                                    {(publication as any).userSince && ( // Assuming userSince might be a property
                                        <p className="text-sm text-slate-400">Miembro desde {new Date((publication as any).userSince).getFullYear()}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-slate-300">
                                {publication.contact?.email && <div>Email: {publication.contact.email}</div>}
                                {publication.contact?.phones && publication.contact.phones.length > 0 && (
                                    <div>Tel: {publication.contact.phones.join(', ')}</div>
                                )}
                            </div>
                        </div>
                        {/* Botones de contacto */}
                        <div className="p-4 border-t border-slate-700 bg-slate-850">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                    className="flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors"
                                    aria-label="Llamar"
                                    title="Llamar ahora"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Llamar ahora
                                </button>
                                <button
                                    className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                                    aria-label="WhatsApp"
                                    title="WhatsApp"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp
                                </button>
                            </div>
                            <button
                                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                                aria-label="Ver completo"
                                title="Ver anuncio completo"
                                onClick={() => {
                                    if (selectedPublication?.slug) { // Asumiendo que quieres navegar al slug
                                        router.push(`/anuncio/${selectedPublication.slug}/${selectedPublication.id}`);
                                    } else if (selectedPublication?.id) {
                                        router.push(`/anuncio/${selectedPublication.id}`);
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver anuncio completo
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        );
    }

    // --- Renderizado Principal ---
    return (
        <div className={`w-full mx-auto ${className}`}>
            <div className="flex flex-col lg:flex-row w-full">
                {/* LEFT COLUMN - Search interface and results */}
                <div className="w-full lg:w-[calc(100%-360px)] lg:pr-6">
                    {/* Category selector */}
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

                    {/* Search bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 w-full">
                            {useEnhancedSearch ? (
                                <KeywordSearchBox
                                    initialValue={searchQuery}
                                    onSearch={handleSearch}
                                    appearance="dark"
                                    showLabel={false}
                                    autoFocus={false}
                                    placeholder="¿Qué buscas?"
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
                    </div>

                    {/* Filter chips */}
                    {category && (
                        <div className="mb-4">
                            <FilterChips
                                category={category}
                                activeFilters={activeFilters}
                                onFilterChange={(key, value) => {
                                    setActiveFilters((prev) => {
                                        const updated = { ...prev, [key]: value };
                                        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0) ) {
                                            delete updated[key];
                                        }
                                        
                                        const allSearchParams = {
                                            ...updated,
                                            category,
                                            subcategory,
                                            subsubcategory: selectedSubSubcategory,
                                            q: searchQuery || ''
                                        };

                                        const params = new URLSearchParams();
                                        Object.entries(allSearchParams).forEach(([k, v]) => {
                                            if (v !== undefined && v !== null && v !== '') {
                                                if (Array.isArray(v)) {
                                                    params.set(k, v.join(',')); // o manejar arrays de otra forma
                                                } else {
                                                    params.set(k, String(v));
                                                }
                                            }
                                        });
                                        
                                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                        if (onFilterChange) {
                                            onFilterChange(allSearchParams);
                                        }
                                        return updated;
                                    });
                                }}
                                className="pt-1 pb-0"
                            />
                        </div>
                    )}

                    {/* Result header with view toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-white dark:text-white">
                                {searchQuery ? `Resultados para "${searchQuery}"` :
                                 selectedSubSubcategory && subcategory && category ? `${categoriesData.find(c => c.id === category)?.name} > ${categoriesData.find(c => c.id === category)?.subcategories?.find(sc => sc.id === subcategory)?.name} > ${categoriesData.find(c => c.id === category)?.subcategories?.find(sc => sc.id === subcategory)?.subsubcategories?.find(ssc => ssc.id === selectedSubSubcategory)?.name}` :
                                 subcategory && category ? `${categoriesData.find(c => c.id === category)?.name} > ${categoriesData.find(c => c.id === category)?.subcategories?.find(sc => sc.id === subcategory)?.name}` :
                                 category ? categoriesData.find(c => c.id === category)?.name :
                                'Todos los anuncios'}
                            </h1>
                            <p className="text-sm text-slate-400 dark:text-slate-400">
                                {loading && results.length === 0 ? 'Buscando...' : `${totalResults || results.length} anuncios encontrados`}
                            </p>
                        </div>

                        {/* View mode toggle - Moved here */}
                        <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button
                                className={`p-2 rounded transition-colors duration-200 ${
                                    listViewMode === 'grid'
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                onClick={() => setListViewMode('grid')}
                                aria-label="Ver en cuadrícula"
                                title="Vista Cuadrícula"
                            >
                                <Squares2X2Icon className="w-5 h-5" />
                            </button>

                            <button
                                className={`p-2 rounded transition-colors duration-200 ${
                                    listViewMode === 'list'
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                onClick={() => setListViewMode('list')}
                                aria-label="Ver en lista"
                                title="Vista Lista"
                            >
                                <ListBulletIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search results */}
                    <div className="pr-2 pb-8">
                        <SearchResults
                            results={results.map(adaptPublicationForSearchResults)}
                            loading={loading}
                            activeCategory={category}
                            showInteractionButtons={true}
                            onPublicationClick={(pub, e) => {
                                e.preventDefault();
                                const adapted = reverseAdaptPublication(pub);
                                setSelectedPublication(adapted);
                                // Actualizar URL con datos de la publicación seleccionada
                                const newParams = new URLSearchParams(searchParams?.toString());
                                if (adapted.id) newParams.set('publicationId', adapted.id);
                                if (adapted.title) {
                                    const titleSlug = adapted.title.toLowerCase()
                                        .replace(/[^\w\s-]/g, '') // remove non-alphanumeric
                                        .replace(/\s+/g, '-');    // replace spaces with hyphens
                                    newParams.set('title', titleSlug);
                                }
                                router.push(`${pathname}?${newParams.toString()}`, { scroll: false });

                                if (onPublicationClick) onPublicationClick(adapted, e);
                            }}
                            viewType={listViewMode}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN - Publication details */}
                <div className="hidden lg:block lg:w-[360px]">
                    {selectedPublication && !isMobile && (
                        <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
                            <PublicationDetailsPanel
                                publication={selectedPublication}
                                onClose={() => {
                                    setSelectedPublication(null);
                                    const newParams = new URLSearchParams(searchParams?.toString());
                                    newParams.delete('publicationId');
                                    newParams.delete('title');
                                    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569; // slate-600
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155; // slate-700
                }
            `}</style>
        </div>
    );
}