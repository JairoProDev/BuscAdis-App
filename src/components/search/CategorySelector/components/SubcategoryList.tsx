'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SubcategoryListProps } from '../types/index';
import { CategoryCard } from './CategoryCard';

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
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      className="my-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-400 dark:text-gray-400 whitespace-nowrap">
          Subcategorías:
        </h3>
        
        <div className="overflow-x-auto flex gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {subcategories.map((subcategory) => (
            <motion.div key={subcategory.id} variants={itemVariants} className="flex-shrink-0">
              <CategoryCard
                category={subcategory}
                isActive={subcategory.slug === activeSubcategory}
                onClick={() => onSubcategoryClick(subcategory.slug)}
                variant="horizontal"
                showCount={true}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SubcategoryList; 