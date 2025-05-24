'use client'

import { useState, useEffect, type ReactNode, useMemo, useCallback } from 'react'
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
import type { Publication as CorePublication } from '@/types/publications'
import type { Publication as SearchResultsPublicationType } from './SearchResults'
import { isEqual } from 'lodash'


type FilterValue = string | number | boolean | (string | number)[] | null;

// THIS SECTION DEFINES THE PROPS AND VIEWMODE, IT SHOULD NOT BE DELETED
interface SearchLayoutProps {
    initialResults?: CorePublication[]
    initialCategory?: string
    initialSubcategory?: string
    initialQuery?: string
    loading?: boolean
    onSearch?: (query: string, options?: Record<string, string>) => void
    onFilterChange?: (filters: Record<string, FilterValue>) => void
    totalResults?: number
    onPublicationClick?: (publication: CorePublication, e: React.MouseEvent<HTMLAnchorElement>) => void
    children?: ReactNode
    className?: string
    useEnhancedSearch?: boolean
}

type ViewMode = 'grid' | 'list';
// END OF SECTION THAT SHOULD NOT BE DELETED

// Adapter: CorePublication from @/types/publications.ts => SearchResultsPublicationType for SearchResults.tsx
function adaptToSearchResultsPublication(pub: CorePublication): SearchResultsPublicationType {
  return {
    title: pub.title,
    description: pub.description,
    categorySlug: pub.categorySlug,
    subcategorySlug: pub.subcategorySlug || undefined,
    subSubcategorySlug: pub.subSubcategorySlug || undefined,
    images: pub.images || [],
    attributes: pub.attributes || {},
    createdAt: pub.createdAt ? new Date(pub.createdAt).toISOString() : new Date().toISOString(),

    id: String(pub.id || pub._id || `fallback-id-${Math.random().toString(36).substr(2, 9)}`),
    price: pub.amount ?? 0,
    currency: pub.currency || 'PEN',
    contactName: pub.contact?.name || '',
    contactPhone: pub.contact?.phones?.[0] || '',
    contactEmail: pub.contact?.email || undefined,
    status: 'active', 
    premium: pub.premium || false,
    slug: pub.slug || undefined,

    location: pub.location
        ? {
            address: pub.location.address || '',
            district: pub.location.district || undefined,
            province: pub.location.province || undefined,
          }
        : 'Ubicación no especificada',
    
    verified: false,
    rating: undefined,
    views: undefined,
    bookmarks: undefined,
    categoryName: undefined,
    distance: undefined,
  };
}

// Adapter: SearchResultsPublicationType from SearchResults.tsx => CorePublication for internal use / prop callback
function adaptToCorePublication(pub: SearchResultsPublicationType): CorePublication {
  const originalLocation: CorePublication['location'] = 
    typeof pub.location === 'object' && pub.location !== null
    ? {
        province: 'Cusco', 
        district: pub.location.district || null,
        address: pub.location.address || null,
        referencePoint: null, 
        coordinates: null, 
      }
    : { province: 'Cusco', district: null, address: null, referencePoint: null, coordinates: null };

  const corePub: CorePublication = {
    title: pub.title,
    description: pub.description,
    images: pub.images || [],
    categorySlug: pub.categorySlug,
    subcategorySlug: pub.subcategorySlug || '',
    subSubcategorySlug: pub.subSubcategorySlug || null,
    attributes: pub.attributes || {},
    createdAt: pub.createdAt ? new Date(pub.createdAt) : undefined,
    
    _id: pub.id, 
    id: pub.id,

    amount: pub.price ?? null,
    currency: pub.currency as CorePublication['currency'] || null,
    negotiable: (pub as any).negotiable !== undefined ? (pub as any).negotiable : null,

    location: originalLocation,

    contact: {
        phones: pub.contactPhone ? [pub.contactPhone] : [],
        email: pub.contactEmail || null,
        name: pub.contactName || null,
    },
    
    premium: pub.premium || false,
    slug: pub.slug || null,
  };
  return corePub;
}


export default function SearchLayout({
    initialResults = [],
    initialCategory,
    initialSubcategory,
    initialQuery = '',
    loading = false,
    onSearch,
    onFilterChange,
    // onLoadMore, // Removed
    // hasMore = false, // Removed
    totalResults = 0,
    onPublicationClick, // Expects CorePublication
    className = '',
    useEnhancedSearch = true,
}: SearchLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Memoize search params to prevent unnecessary re-renders
    const memoizedSearchParams = useMemo(() => {
        return {
            q: searchParams?.get('q') || '',
            category: searchParams?.get('category') || '',
            subcategory: searchParams?.get('subcategory') || '',
            subsubcategory: searchParams?.get('subsubcategory') || ''
        }
    }, [searchParams])

    // Estados del componente - Optimizados
    const [searchQuery, setSearchQuery] = useState(initialQuery || memoizedSearchParams.q)
    const [category, setCategory] = useState(initialCategory || memoizedSearchParams.category)
    const [subcategory, setSubcategory] = useState(initialSubcategory || memoizedSearchParams.subcategory)
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(memoizedSearchParams.subsubcategory)
    const [results, setResults] = useState<CorePublication[]>(initialResults)
    const [listViewMode, setListViewMode] = useState<ViewMode>('grid')
    const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({})
    const [selectedPublication, setSelectedPublication] = useState<CorePublication | null>(null)

    // Memoize categoriesData to prevent unnecessary re-renders
    const [categoriesData, setCategoriesData] = useState<Array<{
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

    // Responsive
    const isMobile = useMediaQuery('(max-width: 640px)')

    // Load categories only once
    useEffect(() => {
        let mounted = true
        const loadCategories = async () => {
            try {
                const response = await CategoriesService.getCategories()
                if (mounted) {
                    setCategoriesData(response)
                }
            } catch (error) {
                console.error('Failed to load categories:', error)
            }
        }
        loadCategories()
        return () => { mounted = false }
    }, [])

    // Update results only when initialResults changes
    useEffect(() => {
        if (!isEqual(results, initialResults)) {
            setResults(initialResults)
        }
    }, [initialResults])

    // Memoize handlers to prevent unnecessary re-renders
    const handleSearch = useCallback((query: string, options?: Record<string, string>) => {
        setSearchQuery(query)
        const newParams = new URLSearchParams(searchParams?.toString())

        // Update URL params
        if (query) newParams.set('q', query); else newParams.delete('q')
        if (options?.category) { 
            setCategory(options.category)
            newParams.set('category', options.category)
        } else if (options?.category === '') {
            setCategory('')
            newParams.delete('category')
        }

        if (options?.subcategory) {
            setSubcategory(options.subcategory)
            newParams.set('subcategory', options.subcategory)
        } else if (options?.subcategory === '') {
            setSubcategory('')
            newParams.delete('subcategory')
        }

        if (options?.subsubcategory) {
            setSelectedSubSubcategory(options.subsubcategory)
            newParams.set('subsubcategory', options.subsubcategory)
        } else if (options?.subsubcategory === '') {
            setSelectedSubSubcategory('')
            newParams.delete('subsubcategory')
        }

        const combinedOptions = {
            category: options?.category !== undefined ? options.category : category,
            subcategory: options?.subcategory !== undefined ? options.subcategory : subcategory,
            subsubcategory: options?.subsubcategory !== undefined ? options.subsubcategory : selectedSubSubcategory,
            ...activeFilters
        }

        // Batch URL update with state updates
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false })

        if (onSearch) {
            onSearch(query, combinedOptions)
        } else if (onFilterChange) {
            onFilterChange({ ...combinedOptions, q: query })
        }
    }, [searchParams, category, subcategory, selectedSubSubcategory, activeFilters, pathname, router, onSearch, onFilterChange])

    const handleCategoryChange = useCallback((newCategory: string) => {
        setCategory(newCategory)
        setSubcategory('')
        setSelectedSubSubcategory('')
        setActiveFilters({})
        
        const params = new URLSearchParams(searchParams?.toString())
        if (newCategory) params.set('category', newCategory); else params.delete('category')
        params.delete('subcategory')
        params.delete('subsubcategory')
        
        // Batch URL update with filter change
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        
        if (onFilterChange) {
            onFilterChange({ 
                category: newCategory, 
                subcategory: '', 
                subsubcategory: '', 
                q: searchQuery || '' 
            })
        }
    }, [searchParams, pathname, router, onFilterChange, searchQuery])

    const handleSubcategoryChange = useCallback((newSubcategory: string) => {
        setSubcategory(newSubcategory)
        setSelectedSubSubcategory('')
        
        const params = new URLSearchParams(searchParams?.toString())
        if (newSubcategory) params.set('subcategory', newSubcategory); else params.delete('subcategory')
        params.delete('subsubcategory')
        
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        
        if (onFilterChange) {
            onFilterChange({ 
                category, 
                subcategory: newSubcategory, 
                subsubcategory: '', 
                q: searchQuery || '' 
            })
        }
    }, [searchParams, pathname, router, category, onFilterChange, searchQuery])

    const handleSubSubcategoryChange = useCallback((newSubSubcategory: string) => {
        setSelectedSubSubcategory(newSubSubcategory)
        
        const params = new URLSearchParams(searchParams?.toString())
        if (newSubSubcategory) params.set('subsubcategory', newSubSubcategory); else params.delete('subsubcategory')
        
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        
        if (onFilterChange) {
            onFilterChange({ 
                category, 
                subcategory, 
                subsubcategory: newSubSubcategory, 
                q: searchQuery || '' 
            })
        }
    }, [searchParams, pathname, router, category, subcategory, onFilterChange, searchQuery])

    // This handler is called when a publication is clicked within SearchResults component
    const handleSearchResultsPublicationClick = useCallback((pubFromSearchResults: SearchResultsPublicationType, e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const corePub = adaptToCorePublication(pubFromSearchResults);
        setSelectedPublication(corePub); 

        const newParams = new URLSearchParams(searchParams?.toString());
        if (corePub.id) newParams.set('publicationId', corePub.id); // Use id (or _id if preferred)
        
        if (corePub.title) {
            const titleSlug = corePub.title.toLowerCase()
                .replace(/[^\w\s-]/g, '') // remove non-alphanumeric characters except spaces and hyphens
                .replace(/\s+/g, '-')    // replace spaces with hyphens
                .replace(/-+/g, '-');   // replace multiple hyphens with a single one
            newParams.set('title', titleSlug);
        }
        
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
        
        // If there's an onPublicationClick prop passed to SearchLayout, call it with CorePublication
        if (onPublicationClick) {
            onPublicationClick(corePub, e);
        }
    }, [searchParams, pathname, router, onPublicationClick]);

    // Memoize filter change handler
    const handleFilterChange = useCallback((key: string, value: FilterValue) => {
        setActiveFilters(prev => {
            const updated = { ...prev, [key]: value }
            if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                delete updated[key]
            }
            
            const allSearchParams = {
                ...updated,
                category,
                subcategory,
                subsubcategory: selectedSubSubcategory,
                q: searchQuery || ''
            }

            const params = new URLSearchParams()
            Object.entries(allSearchParams).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    if (Array.isArray(v)) {
                        params.set(k, v.join(','))
                    } else {
                        params.set(k, String(v))
                    }
                }
            })
            
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
            if (onFilterChange) {
                onFilterChange(allSearchParams)
            }
            return updated
        })
    }, [category, subcategory, selectedSubSubcategory, searchQuery, pathname, router, onFilterChange])

    // Modulariza la vista de detalles de publicación
    // This panel now expects CorePublication
    function PublicationDetailsPanel({ publication, onClose }: { publication: CorePublication, onClose: () => void }) {
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
                    {publication.images && publication.images.length > 0 && (
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
                                        }).format(publication.amount as number)}
                                        {(publication.negotiable) && ( 
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
                                    {[ publication.location?.address, 
                                       publication.location?.district, 
                                       publication.location?.province
                                    ].filter(Boolean).join(', ')}
                                </p>
                                {(publication.location?.coordinates) && (
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
                                    {(publication.userSince) && ( 
                                        <p className="text-sm text-slate-400">Miembro desde {new Date(publication.userSince).getFullYear()}</p>
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
                                    if (selectedPublication && selectedPublication.slug && selectedPublication.id) { 
                                        router.push(`/anuncio/${selectedPublication.slug}/${selectedPublication.id}`);
                                    } else if (selectedPublication && selectedPublication.id) {
                                        router.push(`/anuncio/${String(selectedPublication.id)}`);
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
                        <div className="flex-1 w-full max-w-full overflow-hidden">
                            <div className="relative w-full max-w-full">
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
                    </div>

                    {/* Filter chips */}
                    {category && (
                        <div className="mb-4">
                            <FilterChips
                                category={category}
                                activeFilters={activeFilters}
                                onFilterChange={handleFilterChange}
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
                            results={results.map(adaptToSearchResultsPublication)}
                            loading={loading}
                            activeCategory={category}
                            showInteractionButtons={true}
                            onPublicationClick={handleSearchResultsPublicationClick}
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