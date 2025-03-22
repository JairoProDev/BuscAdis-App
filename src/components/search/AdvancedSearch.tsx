// src/components/search/AdvancedSearch.tsx
import React, { useState } from 'react';

interface AdvancedSearchProps {
    onSearch: (filters: any) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    const handleSearch = () => {
        onSearch({ query, category, location, priceRange });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Filtros Avanzados</h2>
            {/* ... (código de filtros) ... */}
        </div>
    );
};

export default AdvancedSearch;