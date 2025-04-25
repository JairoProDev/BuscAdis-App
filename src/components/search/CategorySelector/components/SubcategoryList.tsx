'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SubcategoryListProps } from '../types';
import CategoryCard from './CategoryCard';

const SubcategoryList: React.FC<SubcategoryListProps> = ({
  subcategories,
  activeSubcategory,
  onSubcategoryClick,
}) => {
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  // Animaciones
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="mt-4 mb-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h3 className="text-sm font-medium text-gray-400 dark:text-gray-400 mb-2">
        Subcategorías
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {subcategories.map((subcategory) => (
          <motion.div key={subcategory.id} variants={itemVariants}>
            <CategoryCard
              category={subcategory}
              isActive={subcategory.slug === activeSubcategory}
              onClick={() => onSubcategoryClick(subcategory.slug)}
              variant="horizontal"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SubcategoryList; 