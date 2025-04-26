'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SubSubcategoryListProps } from '../types';
import { getCategoryColor } from '../utils';

const SubSubcategoryList: React.FC<SubSubcategoryListProps> = ({
  subsubcategories,
  activeSubSubcategory,
  onSubSubcategoryClick,
}) => {
  if (!subsubcategories || subsubcategories.length === 0) {
    return null;
  }

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="mb-4 mt-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h3 className="text-xs font-medium text-gray-400 dark:text-gray-400 mb-2">
        Especialidades
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {subsubcategories.map((subsubcategory) => {
          const isActive = subsubcategory.slug === activeSubSubcategory;
          const emoji = subsubcategory.emoji || '🔹';
          const color = getCategoryColor(subsubcategory.slug);
          
          return (
            <motion.button
              key={subsubcategory.id}
              className={`inline-flex items-center py-1.5 px-3 text-sm rounded-md transition-colors ${
                isActive
                  ? `bg-${color}-500 text-white`
                  : `bg-white dark:bg-slate-800 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700`
              }`}
              onClick={() => onSubSubcategoryClick(subsubcategory)}
              variants={itemVariants}
            >
              <span className="mr-1.5">{emoji}</span>
              <span>{subsubcategory.name}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SubSubcategoryList; 