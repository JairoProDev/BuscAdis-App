'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CategoriesService } from '@/services/categories.service';
import { 
  BriefcaseIcon, 
  HomeIcon, 
  TruckIcon, 
  WrenchIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Map category IDs to their corresponding icon components
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'empleos': BriefcaseIcon,
  'inmuebles': HomeIcon,
  'vehiculos': TruckIcon,
  'servicios': WrenchIcon,
  'productos': ShoppingBagIcon,
  'eventos': CalendarIcon,
  'negocios': ChartBarIcon,
  'comunidad': UserGroupIcon
};

interface Category {
  id: string;
  name: string;
  count?: number;
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
    // Find the selected category
    const selected = categories.find((category) => category.id === categoryId) || null;

    // Update the selected category and filter the results
    onSelectCategory(selected);
    onFilterChange({ category: selected });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-2 rounded bg-red-50">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3">Categorías</h3>

        {/* Category buttons with icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((category) => {
            const IconComponent = CATEGORY_ICONS[category.id] || BriefcaseIcon;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center p-3 rounded-lg border transition-all ${
                  selectedCategory?.id === category.id
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{category.name}</span>
                {category.count !== undefined && (
                  <span className="ml-auto text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded-full">
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategories section */}
      <AnimatePresence>
        {selectedCategory && categoryTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <h3 className="font-semibold text-lg mb-3">Subcategorías de {selectedCategory.name}</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {categoryTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => onSelectType(type.id)}
                  className={`text-left p-3 rounded-lg border ${
                    selectedType === type.id
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{type.name}</span>
                    {type.count !== undefined && (
                      <span className="text-xs bg-gray-100 text-gray-700 py-1 px-2 rounded-full">
                        {type.count}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}