'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  HomeIcon, 
  TruckIcon, 
  WrenchIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { CategoriesService } from '@/services/categories.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Map category IDs to their corresponding icon components
const CATEGORY_ICONS = {
  'empleos': BriefcaseIcon,
  'inmuebles': HomeIcon,
  'vehiculos': TruckIcon,
  'servicios': WrenchIcon,
  'productos': ShoppingBagIcon,
  'eventos': CalendarIcon,
  'negocios': ChartBarIcon,
  'comunidad': UserGroupIcon
};

// Map category IDs to their corresponding bg colors
const CATEGORY_COLORS = {
  'empleos': 'bg-blue-500',
  'inmuebles': 'bg-green-500',
  'vehiculos': 'bg-amber-500',
  'servicios': 'bg-purple-500',
  'productos': 'bg-red-500',
  'eventos': 'bg-pink-500',
  'negocios': 'bg-yellow-500',
  'comunidad': 'bg-teal-500'
};

interface Category {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await CategoriesService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error loading categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!categories || categories.length === 0) {
    return <div className="text-gray-500 text-center py-4">No categories found</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {categories.map((category, index) => {
        // Get the icon component for this category
        const IconComponent = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS] || BriefcaseIcon;
        const bgColor = CATEGORY_COLORS[category.id as keyof typeof CATEGORY_COLORS] || 'bg-gray-500';
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/${category.id}`}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 text-center cursor-pointer">
                <div className={`w-12 h-12 rounded-full ${bgColor} mx-auto mb-3 flex items-center justify-center text-white`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-800">{category.name}</h3>
                {category.count !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">{category.count} anuncios</p>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
