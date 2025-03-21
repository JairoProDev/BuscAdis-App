'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/search/SearchBar';
import AdisoSection from '@/components/home/AdisoSection';
import CategoryFilters from '@/components/search/CategoryFilters';
import SearchFilters from '@/components/search/SearchFilters';
import { CategoryId } from '@/types/marketplace';
import { categories } from '@/data/mockCategories';
import AdvancedFilters from '@/components/search/AdvancedFilters';
import { useSearchParams } from 'next/navigation';
import AdisoCard from '@/components/AdisoCard';
import LoadingState from '@/components/ui/LoadingState';
import Pagination from '@/components/ui/Pagination';
import { SearchService } from '@/services/search.service';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        limit: 12,
    });
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [publications, setPublications] = useState<any[]>([]);

    const handleSearch = (query: string) => {
        console.log('Búsqueda:', { query, filters, category: selectedCategory });
        setSearchTerm(query);
        setFilters((prev) => ({
            ...prev,
            search: query,
            page: 1,
        }));
    };

    const handleFiltersChange = (newFilters: any) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1,
        }));
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category as CategoryId);
        setFilters((prev) => ({
            ...prev,
            category,
            page: 1,
        }));
    };

    useEffect(() => {
        const fetchPublications = async () => {
            setLoading(true);
            console.log("Filters at start of fetchPublications:", filters); // Log inicial de los filtros
            try {
                const data = await SearchService.searchPublications(filters);
                console.log("Data from SearchService:", data);
                setPublications(data.publications || []);
                setResults(data.publications || []);
                setTotalPages(data.pages);
                setError('');
            } catch (err: any) {
                console.error('Error al cargar los anuncios:', err);
                setError(`Error al cargar los anuncios: ${err.message}`);
                setPublications([]);
                setResults([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };
        fetchPublications();
    }, [filters]);

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    if (loading) return <LoadingState text="Cargando anuncios..." />;
    if (error) return <div>{error}</div>;

    if (!results || results.length === 0) {
        return <div>No hay anuncios disponibles.</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto mb-8">
                    <SearchBar initialValue={filters.search} onSearch={handleSearch} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <CategoryFilters onCategoryChange={handleCategoryChange} />
                        <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
                        <AdvancedFilters />
                    </aside>

                    <main className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-8">
                                 <p className="text-gray-600">No se encontraron anuncios</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.map((publication: any) => (
                                        <AdisoCard key={publication.id} adiso={publication} />
                                    ))}
                                </div>

                                <Pagination
                                    currentPage={filters.page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />

                                {selectedCategory && (
                                    <AdisoSection
                                        title={`Anuncios destacados en ${categories.find((cat) => cat.id === selectedCategory)?.name || 'Categoría'}`}
                                        adisos={(categories as any)[selectedCategory] || []}
                                    />
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </motion.div>
    );
}

