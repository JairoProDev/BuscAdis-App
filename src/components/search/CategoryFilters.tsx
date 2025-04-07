'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fetchCategories, fetchCategoryTypes } from '@/services/categories.service';

interface Category {
  id: string;
  name: string;
}

interface CategoryType {
  id: string;
  name: string;
  emoji?: string; // Opcional, si tienes emojis
  count?: number; // Opcional, para cantidades
}

interface CategoryFiltersProps {
  selectedCategory: Category | null;
  selectedType: string | null;
  onSelectCategory: (category: Category | null) => void;
  onSelectType: (type: string | null) => void;
  onFilterChange: (filter: any) => void;
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
  const [typesLoading, setTypesLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await fetchCategories();
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

      setTypesLoading(true);

      try {
        const categoryTypesData = await fetchCategoryTypes(selectedCategory.id);
        setCategoryTypes(categoryTypesData);
      } catch (error) {
        console.error('Error loading category types:', error);
        setCategoryTypes([]);
      } finally {
        setTypesLoading(false);
      }
    };

    loadCategoryTypes();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId: string | null) => {
    const selected = categories.find((category) => category.id === categoryId) || null;
    onSelectCategory(selected);
    onFilterChange({ category: selected });
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
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex overflow-x-auto hide-scrollbar -mx-4 px-4"
          >
            <div className="flex gap-2 min-w-max pb-2">
              <motion.button
                onClick={() => onSelectType(null)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedType === null
                    ? 'bg-white text-primary-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🌟</span>
                <span>Todos</span>
              </motion.button>
              {categoryTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => onSelectType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedType === type.id
                      ? 'bg-white text-primary-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{type.emoji}</span>
                  <span>{type.name}</span>
                  <span className="text-xs opacity-60">({type.count})</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}