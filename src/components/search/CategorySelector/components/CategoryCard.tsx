'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Category, SubSubcategory, Subcategory } from '../types';
import { getCategoryColor } from '../utils';
import { motion } from 'framer-motion';

export type CategoryCardVariant = 'square' | 'horizontal';

type CategoryCardProps = {
  category: Category | Subcategory | SubSubcategory;
  isActive?: boolean;
  onClick?: () => void;
  showCount?: boolean;
  variant?: CategoryCardVariant;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isActive = false,
  onClick,
  showCount = false,
  variant = 'square',
}) => {
  // Determinar si es una categoría principal (con imagen)
  const isMainCategory = 'image' in category && category.image;

  // Determinar si es una subcategoría (con ícono)
  const isSubcategory = 'icon' in category && category.icon;
  
  // Determinar si es una subsubcategoría (con emoji)
  const isSubSubcategory = 'emoji' in category && category.emoji;

  // Obtener el color para la categoría (aplica a todos los tipos)
  const color = getCategoryColor(category.slug);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl overflow-hidden transition-all duration-300',
        variant === 'square' ? 'w-full h-32 flex flex-col items-center justify-center text-center' : 'w-full py-3 px-4 flex items-center gap-4',
        isActive 
          ? `bg-gradient-to-br from-white to-${color}-50 shadow-md border border-${color}-300` 
          : `bg-white hover:bg-gradient-to-br hover:from-white hover:to-${color}-50 border border-gray-100 hover:border-${color}-200 hover:shadow-lg`
      )}
    >
      {/* Círculo decorativo de fondo */}
      <div 
        className={cn(
          'absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          variant === 'square' ? '-bottom-6 -right-6' : '-right-4 top-1/2 transform -translate-y-1/2'
        )}
        style={{
          width: variant === 'square' ? '120px' : '80px',
          height: variant === 'square' ? '120px' : '80px',
          background: `radial-gradient(circle, rgba(var(--${color}-200-rgb), 0.4) 0%, rgba(var(--${color}-200-rgb), 0) 70%)`,
          borderRadius: '50%',
        }}
      />

      {isMainCategory && (
        <div className={cn(
          variant === 'square' ? 'w-16 h-16 mb-3' : 'w-12 h-12',
          'relative overflow-hidden rounded-full shadow-sm'
        )}>
          <Image
            src={category.image as string}
            alt={category.name}
            width={variant === 'square' ? 64 : 48}
            height={variant === 'square' ? 64 : 48}
            className="object-cover"
          />
        </div>
      )}

      {isSubcategory && !isMainCategory && (
        <div className={cn(
          variant === 'square' ? 'w-16 h-16 mb-3 mx-auto' : 'w-12 h-12',
          `text-${color}-500 p-1`
        )}>
          {React.createElement(category.icon as React.ElementType, {
            className: 'w-full h-full'
          })}
        </div>
      )}

      {isSubSubcategory && (
        <div className={cn(
          variant === 'square' ? 'text-3xl mb-2' : 'text-2xl',
          'flex items-center justify-center'
        )}>
          {category.emoji}
        </div>
      )}

      <div className={cn(
        'z-10 relative', 
        variant === 'horizontal' ? 'flex-1' : ''
      )}>
        <p className={cn(
          'font-medium overflow-hidden',
          variant === 'square' ? 'text-sm line-clamp-2' : 'text-base text-left',
          `group-hover:text-${color}-700 transition-colors duration-200`
        )}>
          {category.name}
        </p>
        
        {showCount && category.count !== undefined && (
          <p className={cn(
            `text-${color}-500 text-xs`,
            variant === 'horizontal' ? 'text-left mt-1' : 'mt-1.5'
          )}>
            {category.count.toLocaleString()} {category.count === 1 ? 'anuncio' : 'anuncios'}
          </p>
        )}
      </div>
    </motion.button>
  );
}; 