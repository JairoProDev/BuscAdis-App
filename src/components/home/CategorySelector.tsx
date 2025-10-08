'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  className?: string;
}

const categories = [
  {
    id: 'all',
    name: 'Todos',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50',
    borderColor: 'border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600'
  },
  {
    id: 'empleos',
    name: 'Empleos',
    icon: BriefcaseIcon,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50',
    borderColor: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-700 dark:hover:border-emerald-600'
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    icon: HomeIcon,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50',
    borderColor: 'border-orange-200 hover:border-orange-300 dark:border-orange-700 dark:hover:border-orange-600'
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    icon: TruckIcon,
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50',
    borderColor: 'border-red-200 hover:border-red-300 dark:border-red-700 dark:hover:border-red-600'
  },
  {
    id: 'servicios',
    name: 'Servicios',
    icon: WrenchScrewdriverIcon,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50',
    borderColor: 'border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600'
  },
  {
    id: 'productos',
    name: 'Productos',
    icon: ShoppingBagIcon,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50',
    borderColor: 'border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600'
  },
  {
    id: 'negocios',
    name: 'Negocios',
    icon: ChartBarIcon,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50',
    borderColor: 'border-indigo-200 hover:border-indigo-300 dark:border-indigo-700 dark:hover:border-indigo-600'
  },
  {
    id: 'eventos',
    name: 'Eventos',
    icon: CalendarIcon,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/30 dark:hover:bg-pink-900/50',
    borderColor: 'border-pink-200 hover:border-pink-300 dark:border-pink-700 dark:hover:border-pink-600'
  },
  {
    id: 'comunidad',
    name: 'Comunidad',
    icon: UserGroupIcon,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:hover:bg-teal-900/50',
    borderColor: 'border-teal-200 hover:border-teal-300 dark:border-teal-700 dark:hover:border-teal-600'
  }
];

export default function CategorySelector({ 
  selectedCategory = 'all', 
  onCategorySelect,
  className = '' 
}: CategorySelectorProps) {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    console.log('🎯 CategorySelector: Button clicked:', categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      // Navegar a la página de búsqueda con la categoría seleccionada (URL limpia y SEO-friendly)
      if (categoryId === 'all') {
        router.push('/buscar');
      } else {
        router.push(`/${categoryId}`);
      }
    }
  };

  return (
    <AnimatePresence>
      {true && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`w-full ${className}`}
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

              {/* Category Grid */}
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-2 justify-center lg:justify-start">
                  {categories.map((category) => {
                    const IconComponent = typeof category.icon === 'string' ? null : category.icon;
                    const isSelected = selectedCategory === category.id;
                    
                    return (
                      <motion.button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`
                          flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all duration-300 
                          flex flex-col items-center justify-center gap-2
                          ${category.bgColor}
                          ${category.borderColor}
                          ${isSelected 
                            ? 'shadow-lg scale-105 ring-2 ring-teal-500/50 dark:ring-teal-400/50' 
                            : 'hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-teal-300/50 dark:hover:ring-teal-400/30'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Icon */}
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          bg-gradient-to-br ${category.color}
                        `}>
                          {typeof category.icon === 'string' ? (
                            <span className="text-white text-lg">{category.icon}</span>
                          ) : IconComponent ? (
                            <IconComponent className="w-5 h-5 text-white" />
                          ) : null}
                        </div>
                        
                        {/* Category Name */}
                        <span className={`
                          text-xs font-medium text-center leading-tight
                          ${isSelected 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                          }
                        `}>
                          {category.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Gradient overlays for scroll indication */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 dark:from-gray-800/80 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 dark:from-gray-800/80 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
