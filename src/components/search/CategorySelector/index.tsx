'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoriesService } from '@/services/categories.service';
import { Category, CategorySelectorProps, Subcategory, SubSubcategory } from './types';
import { generateBreadcrumbs } from './utils';
import GridView from './components/GridView';
import SubcategoryList from './components/SubcategoryList';
import SubSubcategoryList from './components/SubSubcategoryList';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CategorySelector: React.FC<CategorySelectorProps> = ({
  activeCategory,
  activeSubcategory,
  activeSubSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onSubSubcategoryChange,
  showAllOption = true,
  className = '',
  showSubcategories = true
}) => {
  // Estado para las categorías y carga
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para subcategorías
  const [currentSubcategories, setCurrentSubcategories] = useState<Subcategory[]>([]);
  const [currentSubSubcategories, setCurrentSubSubcategories] = useState<SubSubcategory[]>([]);
  
  // Generar migas de pan
  const breadcrumbItems = activeCategory 
    ? generateBreadcrumbs(categories, activeCategory, activeSubcategory, activeSubSubcategory)
    : [];
  
  // Cargar categorías al iniciar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await CategoriesService.getCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('No se pudieron cargar las categorías');
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Función para cargar subcategorías
  const fetchSubcategories = useCallback(async (categorySlug: string): Promise<Subcategory[]> => {
    if (!categorySlug || categorySlug === 'all') return [];
    
    try {
      // Si la categoría ya tiene subcategorías, usarlas
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category && category.subcategories) {
        return category.subcategories;
      }
      
      // Si no, intentar cargarlas desde el servicio
      const result = await CategoriesService.getCategoryWithTypes(categorySlug);
      return result || [];
    } catch (error) {
      console.error('Error loading subcategories:', error);
      return [];
    }
  }, [categories]);
  
  // Cargar subcategorías cuando cambia la categoría activa
  useEffect(() => {
    if (!activeCategory || activeCategory === 'all') {
      setCurrentSubcategories([]);
      setCurrentSubSubcategories([]);
      return;
    }
    
    const loadSubcategories = async () => {
      const subcategoriesData = await fetchSubcategories(activeCategory);
      setCurrentSubcategories(subcategoriesData);
      
      // Cargar sub-subcategorías si hay una subcategoría activa
      if (activeSubcategory && subcategoriesData.length > 0) {
        const subcategory = subcategoriesData.find(sub => sub.slug === activeSubcategory);
        if (subcategory && subcategory.subsubcategories) {
          setCurrentSubSubcategories(subcategory.subsubcategories);
        } else {
          setCurrentSubSubcategories([]);
        }
      } else {
        setCurrentSubSubcategories([]);
      }
    };
    
    loadSubcategories();
  }, [activeCategory, activeSubcategory, fetchSubcategories]);
  
  // Manejar selección de categoría
  const handleCategoryClick = useCallback((categorySlug: string) => {
    if (onCategoryChange) {
      onCategoryChange(categorySlug);
    }
  }, [onCategoryChange]);
  
  // Manejar selección de subcategoría
  const handleSubcategoryClick = useCallback((subcategorySlug: string) => {
    if (onSubcategoryChange) {
      onSubcategoryChange(subcategorySlug);
    }
  }, [onSubcategoryChange]);
  
  // Manejar selección de sub-subcategoría
  const handleSubSubcategorySelect = useCallback((subsubcategory: SubSubcategory) => {
    if (onSubSubcategoryChange) {
      onSubSubcategoryChange(subsubcategory.slug);
    }
  }, [onSubSubcategoryChange]);
  
  // Renderizar el contenido según el estado de carga
  if (loading) {
    return (
      <div className="w-full flex justify-center py-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full text-center py-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  
  if (categories.length === 0) {
    return null;
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbItems.length > 0 && (
        <Breadcrumbs items={breadcrumbItems} />
      )}
      
      {/* Categorías principales en cuadrícula */}
      <AnimatePresence mode="wait">
        <motion.div
          key="categories"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GridView
            categories={categories}
            activeCategory={activeCategory}
            onCategorySelect={handleCategoryClick}
            showAllOption={showAllOption}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Subcategorías */}
      {showSubcategories && activeCategory && activeCategory !== 'all' && currentSubcategories.length > 0 && (
        <SubcategoryList
          subcategories={currentSubcategories}
          activeSubcategory={activeSubcategory}
          onSubcategoryClick={handleSubcategoryClick}
        />
      )}
      
      {/* Sub-subcategorías */}
      {showSubcategories && activeCategory && activeSubcategory && currentSubSubcategories.length > 0 && (
        <SubSubcategoryList
          subsubcategories={currentSubSubcategories}
          activeSubSubcategory={activeSubSubcategory}
          onSubSubcategoryClick={handleSubSubcategorySelect}
        />
      )}
    </div>
  );
};

export default CategorySelector; 