'use client';

import { useState, useEffect } from 'react';
//import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
//import { CategoryId } from '@/types/marketplace';
import { SearchService } from '@/services/search.service';
import LoadingState from '@/components/ui/LoadingState';
import { AlertCircle } from 'lucide-react';
import AnunciosGrid from '@/components/AnunciosGrid';
//import AdvancedSearch from '@/components/search/AdvancedSearch'; // Importar AdvancedSearch
//import MapComponent from '@/components/search/MapComponent'; // Importar MapComponent
//import FilterBar from '@/components/search/FilterBar'; // Importar FilterBar
import Pagination from '@/components/ui/Pagination'; // Importar Pagination
import Link from 'next/link';
import { mongoFetch } from '@/lib/dbConnect';

interface Publication {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    categorySlug: string;
    location: string;
    contactName: string;
    status: string;
    createdAt: string;
    images?: string[];
}

interface PublicationCardProps {
    publication: Publication;
}

// Simple publication card component
const PublicationCard: React.FC<PublicationCardProps> = ({ publication }) => {
    const formatPrice = (price: number, currency: string) => {
        if (!price) return 'Precio a consultar';

        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency || 'PEN',
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Default image if none provided
    const imageUrl = publication.images && publication.images.length > 0
        ? publication.images[0]
        : '/images/placeholder.jpg';

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full border border-teal-500/20 hover:border-cyan-400/30">
            <div className="relative h-48 bg-gray-700">
                <img
                    src={imageUrl}
                    alt={publication.title}
                    className="w-full h-full object-cover"
                />
                {publication.id && publication.id.includes('premium') && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md border border-white/10">
                        Premium
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-white line-clamp-2">{publication.title}</h3>
                <p className="text-cyan-100 text-sm mt-2 line-clamp-2">{publication.description}</p>
                <div className="mt-3 flex items-center text-sm text-teal-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{publication.location}</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-teal-400">
                        {formatPrice(publication.price, publication.currency)}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-cyan-300">
                        {publication.categorySlug}
                    </span>
                </div>
            </div>
        </div>
    );
};

const BuscadorAvisos = () => {
    const searchParams = useSearchParams();
    //const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        limit: 12,
    });
    const [results, setResults] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [noResults, setNoResults] = useState(false);

    const handleSearch = (newFilters: Record<string, any>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1,
        }));
    };

    const fetchPublications = async () => {
        setLoading(true);
        try {
            // Use MongoDB browser adapter
            const response = await mongoFetch('/api/publications', {
                queryParams: {
                    category: filters.category,
                    query: filters.search,
                    page: filters.page.toString(),
                    limit: filters.limit.toString()
                }
            });

            setResults(response.publications || []);
            setTotalPages(response.pages || 1);
            setNoResults((response.publications || []).length === 0);
            setError('');
        } catch (err: any) {
            console.error('Error al cargar los anuncios:', err);
            setError(`Error al cargar los anuncios: ${err.message}`);
            setResults([]);
            setTotalPages(1);
            setNoResults(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    if (loading) return <LoadingState text="Cargando anuncios..." />;

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-slate-900 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                Encuentra todo lo que buscas
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/4">
                    {/* Search filters with premium styling */}
                    <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-teal-500/20 relative overflow-hidden">
                        {/* Platinum-like gradient edge effect */}
                        <div className="absolute inset-0 border border-teal-500/30 rounded-lg bg-gradient-to-r from-teal-700 via-slate-900 to-cyan-700 opacity-50 pointer-events-none"></div>

                        <h2 className="text-xl font-semibold mb-4 relative z-10 text-white">Filtros</h2>
                        <div className="mb-4 relative z-10">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Buscar</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-white"
                                value={filters.search}
                                onChange={(e) => handleSearch({ search: e.target.value })}
                                placeholder="¿Qué estás buscando?"
                            />
                        </div>

                        <div className="mb-4 relative z-10">
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                            <select
                                id="category-select"
                                className="w-full px-4 py-2 border border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-900 text-white"
                                value={filters.category}
                                onChange={(e) => handleSearch({ category: e.target.value })}
                                aria-label="Seleccionar categoría"
                            >
                                <option value="">Todas las categorías</option>
                                <option value="inmuebles">Inmuebles</option>
                                <option value="empleos">Empleos</option>
                                <option value="servicios">Servicios</option>
                                <option value="vehiculos">Vehículos</option>
                            </select>
                        </div>

                        <button
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg relative z-10"
                            onClick={() => fetchPublications()}
                        >
                            Buscar
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-3/4">
                    {error ? (
                        <div className="bg-red-900 text-red-300 p-4 rounded-lg mb-6 border border-red-700">
                            <div className="flex items-center mb-2">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                <h3 className="text-lg font-semibold">Error</h3>
                            </div>
                            <p>{error}</p>
                            <button
                                className="mt-2 text-sm text-blue-300 hover:text-blue-500 font-medium"
                                onClick={() => fetchPublications()}
                            >
                                Intentar de nuevo
                            </button>
                        </div>
                    ) : noResults ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-slate-800 rounded-lg shadow-md border border-teal-500/20">
                            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                            <h2 className="text-2xl font-semibold text-white mb-2">No se encontraron resultados</h2>
                            <p className="text-gray-500 text-center mb-6">Intenta modificar tu búsqueda o explora todos los anuncios disponibles.</p>
                        </div>
                    ) : (
                        <div>
                            {/* Results grid with premium styling */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((publication) => (
                                    <PublicationCard key={publication.id} publication={publication} />
                                ))}
                            </div>
                            <div className="mt-8">
                                <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={handlePageChange} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* <MapComponent publications={publications} /> {/* Usar MapComponent */}
        </div>
    );
};

export default BuscadorAvisos;