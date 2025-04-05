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
import { mongoFetch } from '@/lib/mongodb';

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
}

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

    const handleSearch = (newFilters: any) => {
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
    }, [filters]);
    
    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    if (loading) return <LoadingState text="Cargando anuncios..." />;
    
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Encuentra todo lo que buscas</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/4">
                    {/* Placeholder for AdvancedSearch */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={filters.search}
                                onChange={(e) => handleSearch({ search: e.target.value })}
                                placeholder="¿Qué estás buscando?"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={filters.category}
                                onChange={(e) => handleSearch({ category: e.target.value })}
                            >
                                <option value="">Todas las categorías</option>
                                <option value="inmuebles">Inmuebles</option>
                                <option value="empleos">Empleos</option>
                                <option value="servicios">Servicios</option>
                                <option value="vehiculos">Vehículos</option>
                            </select>
                        </div>
                        
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            onClick={() => fetchPublications()}
                        >
                            Buscar
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-3/4">
                    {error ? (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                            <div className="flex items-center mb-2">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                <h3 className="text-lg font-semibold">Error</h3>
                            </div>
                            <p>{error}</p>
                            <button 
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                onClick={() => fetchPublications()}
                            >
                                Intentar de nuevo
                            </button>
                        </div>
                    ) : noResults ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h2>
                            <p className="text-gray-500 text-center mb-6">Intenta modificar tu búsqueda o explora todos los anuncios disponibles.</p>
                        </div>
                    ) : (
                        <div>
                            <AnunciosGrid anuncios={results} isListView={false} />
                            <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={handlePageChange} />
                        </div>
                    )}
                </div>
            </div>

            {/* <MapComponent publications={publications} /> {/* Usar MapComponent */}
        </div>
    );
};

export default BuscadorAvisos;