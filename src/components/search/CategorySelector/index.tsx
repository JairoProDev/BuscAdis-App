'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, CategorySelectorProps, Subcategory, SubSubcategory } from './types';
import { generateBreadcrumbs, getCategories, getCategoryIcon, getSubSubcategoryEmoji, getCategoryImage } from './utils';
import GridView from './components/GridView';
import SubcategoryList from './components/SubcategoryList';
import SubSubcategoryList from './components/SubSubcategoryList';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getSubcategories, getSubSubcategories } from '@/data/categories-data';

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
    try {
      setLoading(true);
      // Cargar categorías desde categories-data
      const data = getCategories();
      
      // Asegurarse de que todas las categorías tengan una imagen válida
      const categoriesWithImages = data.map(category => ({
        ...category,
        image: getCategoryImage(category.slug)
      }));
      
      setCategories(categoriesWithImages);
      setLoading(false);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('No se pudieron cargar las categorías');
      setLoading(false);
    }
  }, []);
  
  // Cargar subcategorías cuando cambia la categoría activa
  useEffect(() => {
    if (!activeCategory || activeCategory === 'all') {
      setCurrentSubcategories([]);
      setCurrentSubSubcategories([]);
      return;
    }
    
    try {
      // Obtener subcategorías del servicio
      const subcats = getSubcategories(activeCategory);
      
      // Convertir al formato que espera el componente
      const formattedSubcats: Subcategory[] = subcats.map(sub => ({
        id: sub.id,
        slug: sub.id,
        name: sub.name,
        // Cada subcategoría debe tener su propio icono
        icon: getCategoryIcon(sub.id),
        parentId: activeCategory
      }));
      
      setCurrentSubcategories(formattedSubcats);
      
      // Si hay una subcategoría activa, cargar sus subsubcategorías
      if (activeSubcategory) {
        const subsubcats = getSubSubcategories(activeCategory, activeSubcategory);
        
        // Convertir al formato que espera el componente
        const formattedSubSubcats: SubSubcategory[] = subsubcats.map(subsub => ({
          id: subsub.id,
          slug: subsub.id,
          name: subsub.name,
          emoji: getSubSubcategoryEmoji(subsub.id),
          parentId: activeSubcategory
        }));
        
        setCurrentSubSubcategories(formattedSubSubcats);
      } else {
        setCurrentSubSubcategories([]);
      }
    } catch (err) {
      console.error('Error loading subcategories:', err);
      setCurrentSubcategories([]);
      setCurrentSubSubcategories([]);
    }
  }, [activeCategory, activeSubcategory]);
  
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
            cols={4}
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