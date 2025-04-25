'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getCategoryIcon, getCategoryColor } from '../utils';
import { CategoryCardProps } from '../types';

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isActive,
  onClick,
  variant = 'square'
}) => {
  // Obtener el ícono y color correspondientes a la categoría
  const IconComponent = getCategoryIcon(category.slug);
  const color = getCategoryColor(category.slug);
  
  if (variant === 'square') {
    // Vista cuadrada - icono arriba y texto abajo
    return (
      <motion.button
        className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 w-full h-full
          ${isActive 
            ? `bg-${color}-500 dark:bg-${color}-600 text-white border border-${color}-600 shadow-md` 
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
          }`}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={`p-3 rounded-full mb-2 
          ${isActive 
            ? 'bg-white/20' 
            : `bg-${color}-500/20 text-${color}-500`
          }`}
        >
          <IconComponent className="w-7 h-7" />
        </div>
        
        <span className="text-sm font-medium text-center">
          {category.name}
        </span>
      </motion.button>
    );
  }
  
  // Vista horizontal - icono a la izquierda
  return (
    <motion.button
      className={`flex items-center gap-2 p-2 px-3 rounded-md transition-all duration-300 w-full
        ${isActive 
          ? `bg-${color}-500 dark:bg-${color}-600 text-white border border-${color}-600 shadow-md` 
          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
        }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <IconComponent className={`w-5 h-5 ${!isActive ? `text-${color}-500` : ''}`} />
      
      <span className="text-sm font-medium">
        {category.name}
      </span>
    </motion.button>
  );
};

export default CategoryCard; 