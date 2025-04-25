'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Category, SubSubcategory, Subcategory } from '../types';
import { getCategoryColor } from '../utils';

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

  // Configurar clases base para el botón
  const baseClasses = 'group relative rounded-lg transition-all duration-200 overflow-hidden';
  
  // Clases específicas según el tipo de variante
  const variantClasses = {
    square: isActive
      ? `bg-${color}-100 border-2 border-${color}-400 shadow-md`
      : `bg-white border border-gray-200 hover:border-${color}-400 hover:shadow-md`,
    horizontal: isActive
      ? `bg-${color}-100 border-2 border-${color}-400 shadow-md`
      : `bg-white border border-gray-200 hover:border-${color}-400 hover:shadow-md`,
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        {
          'w-full h-28 p-2 flex flex-col items-center justify-center text-center': variant === 'square',
          'w-full p-3 flex items-center gap-3': variant === 'horizontal',
        }
      )}
    >
      {isMainCategory && (
        <div className={cn(
          variant === 'square' ? 'w-12 h-12 mb-2' : 'w-10 h-10',
          'relative overflow-hidden rounded-lg'
        )}>
          <Image
            src={category.image as string}
            alt={category.name}
            width={variant === 'square' ? 48 : 40}
            height={variant === 'square' ? 48 : 40}
            className="object-cover"
          />
        </div>
      )}

      {isSubcategory && !isMainCategory && (
        <div className={cn(
          variant === 'square' ? 'w-12 h-12 mb-2 mx-auto' : 'w-10 h-10',
          `text-${color}-500 p-1`
        )}>
          {React.createElement(category.icon as React.ElementType, {
            className: 'w-full h-full'
          })}
        </div>
      )}

      {isSubSubcategory && (
        <div className={cn(
          variant === 'square' ? 'text-2xl mb-1' : 'text-xl',
          'flex items-center justify-center'
        )}>
          {category.emoji}
        </div>
      )}

      <div className={variant === 'horizontal' ? 'flex-1' : ''}>
        <p className={cn(
          'font-medium overflow-hidden',
          variant === 'square' ? 'text-sm line-clamp-2' : 'text-base text-left'
        )}>
          {category.name}
        </p>
        
        {showCount && category.count !== undefined && (
          <p className={cn(
            'text-gray-500 text-xs',
            variant === 'horizontal' ? 'text-left mt-0.5' : 'mt-1'
          )}>
            {category.count.toLocaleString()} {category.count === 1 ? 'anuncio' : 'anuncios'}
          </p>
        )}
      </div>
    </button>
  );
}; 