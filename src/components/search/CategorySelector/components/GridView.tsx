'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CategoryCard from './CategoryCard';
import { Category } from '../types';

interface GridViewProps {
  categories: Category[];
  activeCategory?: string;
  onCategorySelect: (categorySlug: string) => void;
  showAllOption?: boolean;
}

const GridView: React.FC<GridViewProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
  showAllOption = true,
}) => {
  // Agregar opción "Todos" si es necesario
  const allCategories = showAllOption
    ? [
        {
          id: 'all',
          name: 'Todos',
          slug: 'all',
        },
        ...categories
      ]
    : categories;
  
  // Animaciones para el contenedor y los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren"
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {allCategories.map((category) => (
        <motion.div key={category.id} variants={itemVariants} className="h-24">
          <CategoryCard
            category={category}
            isActive={category.slug === activeCategory}
            onClick={() => onCategorySelect(category.slug)}
            variant="square"
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GridView; 