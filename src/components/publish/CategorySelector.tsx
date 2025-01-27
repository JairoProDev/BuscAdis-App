'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CategoryOption, CategorySelectorProps } from '@/types/categories'
import Image from 'next/image'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const categories: CategoryOption[] = [
  {
    id: 'jobs',
    name: 'Empleos',
    icon: '/icons/categories/jobs.svg',
    description: 'Ofertas y búsqueda de empleo',
    subcategories: [
      { id: 'full-time', name: 'Tiempo Completo' },
      { id: 'part-time', name: 'Medio Tiempo' },
      { id: 'freelance', name: 'Freelance' },
      { id: 'internship', name: 'Prácticas' }
    ]
  },
  {
    id: 'real-estate',
    name: 'Inmuebles',
    icon: '/icons/categories/real-estate.svg',
    description: 'Propiedades en venta y alquiler',
    subcategories: [
      { id: 'houses', name: 'Casas' },
      { id: 'apartments', name: 'Apartamentos' },
      { id: 'offices', name: 'Oficinas' },
      { id: 'land', name: 'Terrenos' }
    ]
  },
  {
    id: 'vehicles',
    name: 'Vehículos',
    icon: '/icons/categories/vehicles.svg',
    description: 'Autos, motos y más',
    subcategories: [
      { id: 'cars', name: 'Autos' },
      { id: 'motorcycles', name: 'Motos' },
      { id: 'trucks', name: 'Camiones' },
      { id: 'parts', name: 'Repuestos' }
    ]
  },
  {
    id: 'services',
    name: 'Servicios',
    icon: '/icons/categories/services.svg',
    description: 'Servicios profesionales',
    subcategories: [
      { id: 'home', name: 'Hogar' },
      { id: 'professional', name: 'Profesionales' },
      { id: 'tech', name: 'Tecnología' },
      { id: 'health', name: 'Salud' }
    ]
  },
  {
    id: 'products',
    name: 'Productos',
    icon: '/icons/categories/products.svg',
    description: 'Artículos nuevos y usados',
    subcategories: [
      { id: 'electronics', name: 'Electrónicos' },
      { id: 'furniture', name: 'Muebles' },
      { id: 'fashion', name: 'Moda' },
      { id: 'other', name: 'Otros' }
    ]
  },
  {
    id: 'events',
    name: 'Eventos',
    icon: '/icons/categories/events.svg',
    description: 'Eventos y entretenimiento',
    subcategories: [
      { id: 'concerts', name: 'Conciertos' },
      { id: 'workshops', name: 'Talleres' },
      { id: 'sports', name: 'Deportes' },
      { id: 'other-events', name: 'Otros' }
    ]
  },
  {
    id: 'education',
    name: 'Educación',
    icon: '/icons/categories/education.svg',
    description: 'Cursos y formación',
    subcategories: [
      { id: 'courses', name: 'Cursos' },
      { id: 'tutoring', name: 'Tutorías' },
      { id: 'languages', name: 'Idiomas' },
      { id: 'other-edu', name: 'Otros' }
    ]
  },
  {
    id: 'tourism',
    name: 'Turismo',
    icon: '/icons/categories/tourism.svg',
    description: 'Alojamiento y experiencias',
    subcategories: [
      { id: 'hotels', name: 'Hoteles' },
      { id: 'tours', name: 'Tours' },
      { id: 'experiences', name: 'Experiencias' },
      { id: 'transport', name: 'Transporte' }
    ]
  },
  {
    id: 'pets',
    name: 'Mascotas',
    icon: '/icons/categories/pets.svg',
    description: 'Animales y accesorios',
    subcategories: [
      { id: 'dogs', name: 'Perros' },
      { id: 'cats', name: 'Gatos' },
      { id: 'accessories', name: 'Accesorios' },
      { id: 'services', name: 'Servicios' }
    ]
  }
];

export default function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryOption | null>(selectedCategory || null);
  const [showSubcategories, setShowSubcategories] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory.id);
      if (category) {
        setActiveCategory(category);
        setShowSubcategories(true);
      }
    }
  }, [selectedCategory]);

  const handleCategoryClick = (category: CategoryOption) => {
    setActiveCategory(category);
    setShowSubcategories(true);
  };

  const handleSubcategoryClick = (subcategory: CategoryOption) => {
    if (!activeCategory) return;
    
    onSelect({
      ...activeCategory,
      subcategory
    });
  };

  const handleBack = () => {
    setShowSubcategories(false);
    setActiveCategory(null);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!showSubcategories ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 bg-white rounded-xl border-2 transition-all text-left group
                  ${activeCategory?.id === category.id 
                    ? 'border-primary-500 shadow-lg shadow-primary-500/20' 
                    : 'border-primary-100 hover:border-primary-300 hover:shadow-md'
                  }`}
              >
                <div className="flex items-start gap-4">
                  {category.icon && (
                    <div className="w-12 h-12 rounded-lg bg-primary-50 p-2 group-hover:bg-primary-100">
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary-900 group-hover:text-primary-700">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-primary-600">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-primary-400 group-hover:text-primary-600" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="subcategories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button
              onClick={handleBack}
              className="text-sm text-primary-600 hover:text-primary-800 transition-colors mb-4 flex items-center gap-1"
            >
              ← Volver a categorías
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCategory?.subcategories?.map((subcategory) => (
                <motion.button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-white rounded-xl border-2 border-primary-100 hover:border-primary-300 transition-all text-left flex items-center justify-between group"
                >
                  <span className="text-primary-900 group-hover:text-primary-700">
                    {subcategory.name}
                  </span>
                  <ChevronRightIcon className="w-5 h-5 text-primary-400 group-hover:text-primary-600" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 