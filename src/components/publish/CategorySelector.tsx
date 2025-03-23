'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRightIcon,
  TagIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { categories } from '@/data/categories'
import { Logger } from '@/services/logging.service'

interface SubCategory {
  id: string;
  name: string;
  selected?: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
  description?: string;
  subcategories?: SubCategory[];
}

interface CategorySelectorProps {
  categories: CategoryOption[];
  value: {
    category: CategoryOption | null;
    subcategory?: SubCategory | null;
  };
  onChange: (selection: { category: CategoryOption; subcategory?: SubCategory }) => void;
}

type CategoryName = keyof typeof categories;

const categoryList: CategoryOption[] = Object.entries(categories).map(([name, data]) => ({
  id: name.toLowerCase(),
  name: name as CategoryName,
  description: data.description,
  subcategories: [
    // Empleos
    ...(name === 'Empleos' ? [
      { id: 'full-time', name: 'Tiempo Completo' },
      { id: 'part-time', name: 'Medio Tiempo' },
      { id: 'freelance', name: 'Freelance' },
      { id: 'internship', name: 'Prácticas' },
      { id: 'temporary', name: 'Temporal' },
      { id: 'remote', name: 'Trabajo Remoto' }
    ] : []),
    // Inmuebles
    ...(name === 'Inmuebles' ? [
      { id: 'houses', name: 'Casas en Venta' },
      { id: 'apartments', name: 'Departamentos en Venta' },
      { id: 'rent', name: 'Alquiler' },
      { id: 'rooms', name: 'Habitaciones' },
      { id: 'land', name: 'Terrenos' },
      { id: 'commercial', name: 'Locales Comerciales' }
    ] : []),
    // Vehículos
    ...(name === 'Vehículos' ? [
      { id: 'cars', name: 'Autos' },
      { id: 'motorcycles', name: 'Motos' },
      { id: 'trucks', name: 'Camiones' },
      { id: 'vans', name: 'Camionetas' },
      { id: 'parts', name: 'Repuestos' },
      { id: 'accessories', name: 'Accesorios' }
    ] : []),
    // Servicios
    ...(name === 'Servicios' ? [
      { id: 'home', name: 'Servicios para el Hogar' },
      { id: 'professional', name: 'Servicios Profesionales' },
      { id: 'tech', name: 'Servicios Tecnológicos' },
      { id: 'health', name: 'Servicios de Salud' },
      { id: 'beauty', name: 'Belleza y Bienestar' },
      { id: 'events', name: 'Eventos y Fiestas' }
    ] : []),
    // Productos
    ...(name === 'Productos' ? [
      { id: 'electronics', name: 'Electrónicos' },
      { id: 'furniture', name: 'Muebles y Decoración' },
      { id: 'fashion', name: 'Ropa y Accesorios' },
      { id: 'sports', name: 'Deportes y Fitness' },
      { id: 'books', name: 'Libros y Revistas' },
      { id: 'collectibles', name: 'Coleccionables' }
    ] : []),
    // Turismo
    ...(name === 'Turismo' ? [
      { id: 'hotels', name: 'Hoteles y Hospedajes' },
      { id: 'tours', name: 'Tours y Excursiones' },
      { id: 'transport', name: 'Transporte Turístico' },
      { id: 'guides', name: 'Guías Turísticos' },
      { id: 'packages', name: 'Paquetes Turísticos' },
      { id: 'activities', name: 'Actividades y Experiencias' }
    ] : []),
    // Eventos
    ...(name === 'Eventos' ? [
      { id: 'concerts', name: 'Conciertos y Música' },
      { id: 'theater', name: 'Teatro y Espectáculos' },
      { id: 'workshops', name: 'Talleres y Seminarios' },
      { id: 'sports', name: 'Eventos Deportivos' },
      { id: 'festivals', name: 'Festivales' },
      { id: 'corporate', name: 'Eventos Corporativos' }
    ] : []),
    // Educación
    ...(name === 'Educación' ? [
      { id: 'courses', name: 'Cursos y Capacitaciones' },
      { id: 'tutoring', name: 'Clases Particulares' },
      { id: 'languages', name: 'Idiomas' },
      { id: 'online', name: 'Cursos Online' },
      { id: 'materials', name: 'Material Educativo' },
      { id: 'coaching', name: 'Coaching y Mentoría' }
    ] : []),
    // Mascotas
    ...(name === 'Mascotas' ? [
      { id: 'dogs', name: 'Perros' },
      { id: 'cats', name: 'Gatos' },
      { id: 'other-pets', name: 'Otras Mascotas' },
      { id: 'accessories', name: 'Accesorios' },
      { id: 'food', name: 'Alimentos' },
      { id: 'services', name: 'Servicios para Mascotas' }
    ] : [])
  ].filter(Boolean)
}));

export default function CategorySelector({
  categories,
  value,
  onChange
}: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(value?.category || null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(
    value?.subcategory || null
  );
  const [showSubcategories, setShowSubcategories] = useState(false);

  useEffect(() => {
    if (value?.category) {
      setSelectedCategory(value.category);
      setShowSubcategories(!!value.subcategory);
    }
    if (value?.subcategory) {
      setSelectedSubcategory(value.subcategory);
    }
  }, [value]);

  const handleCategorySelect = (category: CategoryOption) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setShowSubcategories(true);
    Logger.info(`Categoría seleccionada: ${category.name}`);
    
    if (!category.subcategories || category.subcategories.length === 0) {
      onChange({ category });
    }
  };

  const handleSubcategorySelect = (subcategory: SubCategory) => {
    setSelectedSubcategory(subcategory);
    Logger.info(`Subcategoría seleccionada: ${subcategory.name}`);
    
    if (selectedCategory) {
      onChange({
        category: selectedCategory,
        subcategory
      });
    }
  };

  const handleBack = () => {
    setShowSubcategories(false);
    setSelectedSubcategory(null);
    Logger.debug('Volviendo a la lista de categorías');
  };

  const renderCategoryCard = (category: CategoryOption) => {
    const isSelected = selectedCategory?.id === category.id;
    
    return (
      <motion.button
        key={category.id}
        onClick={() => handleCategorySelect(category)}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          isSelected
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-primary-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isSelected ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <TagIcon className={`w-6 h-6 ${
                isSelected ? 'text-primary-600' : 'text-gray-500'
              }`} />
            </div>
            <div>
              <h3 className={`font-medium ${
                isSelected ? 'text-primary-900' : 'text-gray-900'
              }`}>
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
          </div>
          {category.subcategories && category.subcategories.length > 0 && (
            <ChevronRightIcon className={`w-5 h-5 ${
              isSelected ? 'text-primary-500' : 'text-gray-400'
            }`} />
          )}
        </div>
      </motion.button>
    );
  };

  const renderSubcategoryCard = (subcategory: SubCategory) => {
    const isSelected = selectedSubcategory?.id === subcategory.id;
    
    return (
      <motion.button
        key={subcategory.id}
        onClick={() => handleSubcategorySelect(subcategory)}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          isSelected
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-primary-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${
              isSelected ? 'text-primary-900' : 'text-gray-900'
            }`}>
              {subcategory.name}
            </h3>
            {subcategory.description && (
              <p className="text-sm text-gray-500">{subcategory.description}</p>
            )}
          </div>
          {isSelected && (
            <CheckCircleIcon className="w-5 h-5 text-primary-500" />
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!showSubcategories ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-medium text-gray-900">
              Selecciona una categoría
            </h2>
            <div className="grid gap-3">
              {categories.map(renderCategoryCard)}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subcategories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Volver a categorías</span>
              </button>
              <span className="text-sm text-gray-500">
                {selectedCategory?.name}
              </span>
            </div>

            <h2 className="text-lg font-medium text-gray-900">
              Selecciona una subcategoría
            </h2>

            <div className="grid gap-3">
              {selectedCategory?.subcategories?.map(renderSubcategoryCard)}
            </div>

            {selectedCategory?.subcategories?.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Esta categoría no tiene subcategorías disponibles
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selección actual */}
      {(selectedCategory || selectedSubcategory) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 rounded-xl"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Tu selección:
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <span>{selectedCategory?.name}</span>
            {selectedSubcategory && (
              <>
                <ChevronRightIcon className="w-4 h-4" />
                <span>{selectedSubcategory.name}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
} 