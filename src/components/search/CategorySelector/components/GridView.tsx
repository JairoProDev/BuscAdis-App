'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../types';
import { CategoryCard } from './CategoryCard';
import { StarIcon } from '@heroicons/react/24/outline';
import { getCategoryImage } from '../utils';

interface GridViewProps {
  categories: Category[];
  activeCategory?: string;
  onCategorySelect: (categorySlug: string) => void;
  showAllOption?: boolean;
  cols?: number;
}

const GridView: React.FC<GridViewProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
  showAllOption = true,
  cols = 4
}) => {
  // Validar que se muestren solo las 8 categorías principales
  const validCategories = categories.filter(cat => 
    ['empleos', 'inmuebles', 'vehiculos', 'servicios', 'productos', 'eventos', 'negocios', 'comunidad'].includes(cat.slug)
  );

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
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-${cols} gap-3`}>
        {/* Opción "Todas las categorías" */}
        {showAllOption && (
          <motion.div
            variants={itemVariants}
            className="aspect-square"
          >
            <CategoryCard
              category={{
                id: 'all',
                slug: 'all',
                name: 'Todas',
                image: getCategoryImage('default') // Adding an image for the "All" option
              }}
              isActive={activeCategory === 'all' || !activeCategory}
              onClick={() => onCategorySelect('all')}
              variant="square"
            />
          </motion.div>
        )}
        
        {/* Listar categorías */}
        {validCategories.map((category) => (
          <motion.div
            key={category.id}
            variants={itemVariants}
            className="aspect-square"
          >
            <CategoryCard
              category={category}
              isActive={category.slug === activeCategory}
              onClick={() => onCategorySelect(category.slug)}
              variant="square"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GridView; 