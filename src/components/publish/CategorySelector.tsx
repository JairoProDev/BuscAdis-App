'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { categories } from '@/data/categories'

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
  selectedCategory?: CategoryOption | null;
  onSelect: (category: CategoryOption) => void;
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

export default function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryOption | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      const category = categoryList.find(c => c.id === selectedCategory.id);
      if (category) {
        setActiveCategory(category);
        setShowSubcategories(true);
        const selected = category.subcategories?.find(sub => sub.selected);
        if (selected) {
          setSelectedSubcategory(selected);
        }
      }
    }
  }, [selectedCategory]);

  const handleCategoryClick = (category: CategoryOption) => {
    setActiveCategory(category);
    setShowSubcategories(true);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategory: SubCategory) => {
    if (!activeCategory) return;
    
    setSelectedSubcategory(subcategory);
    
    const fullCategory: CategoryOption = {
      ...activeCategory,
      subcategories: activeCategory.subcategories?.map(sub => ({
        ...sub,
        selected: sub.id === subcategory.id
      }))
    };

    onSelect(fullCategory);
  };

  const handleBack = () => {
    setShowSubcategories(false);
    setActiveCategory(null);
    setSelectedSubcategory(null);
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
            {categoryList.map((category) => {
              const CategoryIcon = categories[category.name as CategoryName].icon;
              return (
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
                    <div className="w-12 h-12 rounded-lg bg-primary-50 p-2 group-hover:bg-primary-100">
                      <CategoryIcon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-primary-900 group-hover:text-primary-700">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-primary-600 truncate">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-primary-400 group-hover:text-primary-600" />
                  </div>
                </motion.button>
              );
            })}
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
                  className={`p-4 bg-white rounded-xl border-2 transition-all text-left flex items-center justify-between group
                    ${subcategory.id === selectedSubcategory?.id
                      ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                      : 'border-primary-100 hover:border-primary-300'
                    }`}
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