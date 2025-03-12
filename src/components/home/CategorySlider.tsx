'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { categories as staticCategories } from '@/data/categories';
import { useEffect, useState } from 'react';
import { CategoriesService } from '@/services/categories.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Importar todos los iconos necesarios
import { 
  BriefcaseIcon, HomeIcon, TruckIcon, WrenchIcon, 
  ShoppingBagIcon, GlobeAltIcon, CalendarIcon, 
  AcademicCapIcon, HeartIcon, QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const iconMap = {
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  CalendarIcon,
  AcademicCapIcon,
  HeartIcon
};

export default function CategorySlider() {
  const [categories, setCategories] = useState(staticCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await CategoriesService.getCategories();
        console.log('Categories Data:', categoriesData); // Verificar datos
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Error al cargar las categorías');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {Object.entries(categories).map(([key, category]) => (
            <Link
              key={key}
              href={`/buscar?category=${key.toLowerCase()}`}
              className={`flex flex-col items-center justify-center h-32 rounded-xl bg-gradient-to-br ${category.gradient} text-white p-4 transform hover:scale-105 transition-all duration-300 shadow-md`}
            >
              {category.icon && (
                <category.icon className="w-10 h-10 mb-2" />
              )}
              <span className="font-medium text-center">{key}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 