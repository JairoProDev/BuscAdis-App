// src/components/search/FilterBar.tsx
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface FilterOptions {
    category?: string;
    location?: string;
    sortBy?: string;
}

interface FilterBarProps {
    onFilterChange: (filters: FilterOptions) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('');

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        onFilterChange({ category: value });
    };

    const handleLocationChange = (value: string) => {
        setSelectedLocation(value);
        onFilterChange({ location: value });
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        onFilterChange({ sortBy: value });
    };

    const categorias = ['Todos', 'Vehículos', 'Inmuebles', 'Empleo', 'Servicios', 'Productos', 'Eventos', 'Educación', 'Turismo', 'Mascotas', 'Negocios', 'Otros'];
    const ubicaciones = ['Todas', 'Cusco', 'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Huancayo', 'Tacna'];
    const ordenes = ['Relevancia', 'Precio (Menor a Mayor)', 'Precio (Mayor a Menor)', 'Fecha (Más Reciente)'];

    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <Select onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                    {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                            {categoria}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select onValueChange={handleLocationChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                    {ubicaciones.map((ubicacion) => (
                        <SelectItem key={ubicacion} value={ubicacion}>
                            {ubicacion}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select onValueChange={handleSortChange}>
                <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                    {ordenes.map((orden) => (
                        <SelectItem key={orden} value={orden}>
                            {orden}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default FilterBar;