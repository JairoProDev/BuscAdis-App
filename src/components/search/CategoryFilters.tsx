'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CategoryId } from '@/types/marketplace'
import { CategoriesService } from '@/services/categories.service'
import { supabase } from '@/lib/supabaseClient'
import LoadingState from '@/components/ui/LoadingState'

interface CategoryFiltersProps {
  selectedCategory: CategoryId | null
  selectedType: string | null
  onSelectCategory: (category: CategoryId | null) => void
  onSelectType: (type: string | null) => void
  onFilterChange: (filter: any) => void
}

export default function CategoryFilters({
  selectedCategory,
  selectedType,
  onSelectCategory,
  onSelectType,
  onFilterChange
}: CategoryFiltersProps) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await CategoriesService.getCategories();
        const categoriesArray = Object.entries(categoriesData).map(([key, value]) => ({
          id: key.toLowerCase(),
          name: key,
          ...value
        }));
        setCategories(categoriesArray);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const fetchCategoryTypes = async () => {
      if (!selectedCategory) {
        setCategoryTypes([]);
        return;
      }

      setTypesLoading(true);

      try {
        // Ejemplo de cómo podrías obtener subcategorías de Supabase
        const { data, error } = await supabase
          .from('category_types')
          .select('*')
          .eq('category_id', selectedCategory);
          
        if (error) throw error;
        
        // Si no hay subcategorías en la base de datos, usar datos estáticos
        if (!data || data.length === 0) {
          // Usar datos estáticos como fallback
          const staticTypes = [
            { id: 'all', name: 'Todos' },
            { id: 'featured', name: 'Destacados' },
            { id: 'recent', name: 'Recientes' }
          ];
          
          setCategoryTypes(staticTypes);
        } else {
          setCategoryTypes(data);
        }
      } catch (error) {
        console.error('Error fetching category types:', error);
        setCategoryTypes([]);
      } finally {
        setTypesLoading(false);
      }
    };

    fetchCategoryTypes();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    onSelectCategory(categoryId);
    onFilterChange({ category: categoryId });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Categorías</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleCategoryChange('')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-primary-100 text-primary-700'
              : 'hover:bg-gray-100'
          }`}
        >
          Todas las categorías
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-gray-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Subtipos con scroll horizontal */}
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
  )
} 