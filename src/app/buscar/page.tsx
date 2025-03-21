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
import Input from '@/components/ui/Input';
import Button  from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, List, Grid, AlertCircle } from 'lucide-react';
import AnunciosGrid from '@/components/AnunciosGrid';

const categorias = ['Todos', 'Vehículos', 'Inmuebles', 'Empleo', 'Servicios', 'Productos', 'Eventos', 'Educación', 'Turismo', 'Mascotas', 'Negocios', 'Otros'];
const ubicaciones = ['Todas', 'Cusco', 'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Huancayo', 'Tacna'];

const BuscadorAvisos = () => {
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
    const [busqueda, setBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('Todas');
    const [isListView, setIsListView] = useState(false);
    const [noResults, setNoResults] = useState(false);

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

    const handleBuscar = async () => {
        setLoading(true);
        console.log("Filters at start of fetchPublications:", filters); // Log inicial de los filtros
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
    }, [busqueda, categoriaSeleccionada, ubicacionSeleccionada]);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Encuentra lo que buscas</h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                    type="text"
                    placeholder="Buscar anuncios..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleBuscar} className="bg-blue-500 hover:bg-blue-700 text-white">
                    <Search className="mr-2" /> Buscar
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                
                <div className="w-full lg:w-3/4">
                    {loading ? (
                        <LoadingState text="Cargando anuncios..." />
                    ) : noResults ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h2>
                            <p className="text-gray-500 text-center mb-6">Intenta modificar tu búsqueda o explora todos los anuncios disponibles.</p>
                        </div>
                    ) : (
                        <AnunciosGrid anuncios={results} isListView={isListView} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuscadorAvisos;

