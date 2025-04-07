'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CategoriesService } from '@/services/categories.service'; // Usamos la clase directamente.

interface Category {
  id: string;
  name: string;
}

interface CategoryType {
  id: string;
  name: string;
  emoji?: string;
  count?: number;
}

interface CategoryFiltersProps {
  selectedCategory: Category | null;
  selectedType: string | null;
  onSelectCategory: (category: Category | null) => void;
  onSelectType: (type: string | null) => void;
  onFilterChange: (filter: { category?: Category | null; type?: string | null }) => void;
}

export default function CategoryFilters({
  selectedCategory,
  selectedType,
  onSelectCategory,
  onSelectType,
  onFilterChange,
}: CategoryFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await CategoriesService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Error al cargar las categorías');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadCategoryTypes = async () => {
      if (!selectedCategory) {
        setCategoryTypes([]);
        return;
      }

      try {
        const categoryTypesData = await CategoriesService.getCategoryWithTypes(selectedCategory.id);
        setCategoryTypes(categoryTypesData);
      } catch (error) {
        console.error('Error loading category types:', error);
        setCategoryTypes([]);
      }
    };

    loadCategoryTypes();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    // Encuentra la categoría seleccionada en la lista de categorías
    const selected = categories.find((category) => category.id === categoryId) || null;

    // Actualiza la categoría seleccionada en la función padre y filtra los resultados
    onSelectCategory(selected);
    onFilterChange({ category: selected });

    // Limpia los tipos asociados para la nueva selección de categoría
    setCategoryTypes([]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Categorías</h3>

      {/* Renderizar las categorías */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory?.id === category.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Renderizar los subtipos de la categoría seleccionada */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-2 overflow-x-auto hide-scrollbar"
          >
            {categoryTypes.map((type) => (
              <motion.button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className={`px-4 py-2 rounded-full ${
                  selectedType === type.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {type.emoji ? `${type.emoji} ` : ''}
                {type.name}
                {type.count ? ` (${type.count})` : ''}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}