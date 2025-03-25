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

const BuscadorAvisos = () => {
    const searchParams = useSearchParams();
    //const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        limit: 12,
    });
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [publications, setPublications] = useState<any[]>([]);
    const [isListView, setIsListView] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const handleSearch = (newFilters: any) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1,
        }));
    };
    const handleBuscar = async () => {
        setLoading(true);
        console.log("Filters at start of fetchPublications:", filters);
        try {
            const data = await SearchService.searchPublications(filters);
            console.log("Data from SearchService:", data);
            setPublications(data.publications || []);
            setResults(data.publications || []);
            setTotalPages(data.pages);
            setError('');
            setNoResults(data.publications.length === 0);
        } catch (err: any) {
            console.error('Error al cargar los anuncios:', err);
            setError(`Error al cargar los anuncios: ${err.message}`);
            setPublications([]);
            setResults([]);
            setTotalPages(1);
            setNoResults(true);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
      handleBuscar();
    }, [filters]);
    
    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    if (loading) return <LoadingState text="Cargando anuncios..." />;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Encuentra todo lo que buscas</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/4">
                    {/*<AdvancedSearch onSearch={handleSearch} /> {/* Usar AdvancedSearch */}
                </div>

                <div className="w-full lg:w-3/4">
                  {/*   <FilterBar onFilterChange={handleSearch} />  Usar FilterBar */}
                    {loading ? (
                        <LoadingState text="Cargando anuncios..." />
                    ) : noResults ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h2>
                            <p className="text-gray-500 text-center mb-6">Intenta modificar tu búsqueda o explora todos los anuncios disponibles.</p>
                        </div>
                    ) : (
                        <div>
                            <AnunciosGrid anuncios={results} isListView={isListView} />
                            <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={handlePageChange} /> {/* Usar Pagination */}
                        </div>
                    )}
                </div>
            </div>

            {/* <MapComponent publications={publications} /> {/* Usar MapComponent */}
        </div>
    );
};

export default BuscadorAvisos;