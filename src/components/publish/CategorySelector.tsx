'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TagIcon,
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service'; // Asumiendo que existe
import { categoriesList } from '@/data/categories-data'; // Ajusta la ruta
import type { Category, Subcategory, SubSubcategory } from '@/data/categories-data'; // O desde '@/types/categories'

// Define la estructura para los datos de categoría seleccionada
interface CategorySelectionData {
  categorySlug: string;
  subcategorySlug: string;
  subSubcategorySlug?: string | null;
}

// Props para el componente
interface CategorySelectorProps {
  selectedCategory?: CategorySelectionData;
  onCategorySelect: (selection: CategorySelectionData) => void;
  autoAdvance?: boolean; // Si es true, avanza automáticamente al seleccionar
}

// Define el estado local del componente
type SelectionLevel = 'category' | 'subcategory' | 'subSubcategory';

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategory, 
  onCategorySelect,
  autoAdvance = true // Por defecto, avanzar automáticamente
}) => {
  // Estado local para manejar QUÉ nivel de selección se muestra
  const [currentLevel, setCurrentLevel] = useState<SelectionLevel>('category');

  // Estado local para almacenar temporalmente la selección en cada nivel ANTES de confirmar
  const [tempCategory, setTempCategory] = useState<Category | null>(null);
  const [tempSubcategory, setTempSubcategory] = useState<Subcategory | null>(null);
  const [showCatError, setShowCatError] = useState(false)
  
  // Al iniciar, si hay una categoría seleccionada previamente, establece el estado
  useEffect(() => {
    if (selectedCategory?.categorySlug) {
      const category = categoriesList.find(cat => cat.id === selectedCategory.categorySlug);
      if (category) {
        setTempCategory(category);
        setCurrentLevel('subcategory');
        
        if (selectedCategory.subcategorySlug) {
          const subcategory = category.subcategories?.find(
            subcat => subcat.id === selectedCategory.subcategorySlug
          );
          if (subcategory) {
            setTempSubcategory(subcategory);
            setCurrentLevel('subSubcategory');
          }
        }
      }
    }
  }, [selectedCategory]);

  // --- Callbacks de Selección ---

  const handleCategorySelect = useCallback((category: Category) => {
    setTempCategory(category);
    setTempSubcategory(null); // Resetea niveles inferiores
    
    // Guardar selección en el estado global de inmediato
    onCategorySelect({
      categorySlug: category.id,
      subcategorySlug: '',
      subSubcategorySlug: null
    });
    setShowCatError(false)
    
    // Verifica si hay subcategorías
    if (category.subcategories && category.subcategories.length > 0) {
      setCurrentLevel('subcategory'); // Muestra subcategorías
      Logger.debug('Categoría seleccionada temporalmente, mostrando subcategorías', { category: category.id });
    } else {
      // Si no hay subcategorías, avanza directamente
      if (autoAdvance) {
        Logger.info(`Categoría final seleccionada (sin subcategorías): ${category.name}`);
      }
    }
  }, [onCategorySelect, autoAdvance]);

  const handleSubcategorySelect = useCallback((subcategory: Subcategory) => {
    if (!tempCategory) return; // Seguridad

    setTempSubcategory(subcategory);
    
    // Guardar selección en el estado global de inmediato
    onCategorySelect({
      categorySlug: tempCategory.id,
      subcategorySlug: subcategory.id,
      subSubcategorySlug: null
    });
    setShowCatError(false)
    
    // Verifica si hay sub-subcategorías *reales* (no solo un array vacío)
    const hasSubSubcategories = subcategory.subSubcategories && subcategory.subSubcategories.length > 0;

    if (hasSubSubcategories) {
      setCurrentLevel('subSubcategory'); // Muestra sub-subcategorías
      Logger.debug('Subcategoría seleccionada temporalmente, mostrando sub-subcategorías', { subcategory: subcategory.id });
    } else {
      // Si no hay sub-subcategorías, avanza automáticamente si autoAdvance es true
      if (autoAdvance) {
        // Pequeño retraso para permitir que la UI se actualice
        setTimeout(() => {
          Logger.info(`Clasificación final seleccionada: ${tempCategory.name} > ${subcategory.name}`);
          // Avisar al padre que debe avanzar
          onCategorySelect({
            categorySlug: tempCategory.id,
            subcategorySlug: subcategory.id,
            subSubcategorySlug: null
          });
        }, 300);
      }
    }
  }, [tempCategory, onCategorySelect, autoAdvance]);

  const handleSubSubcategorySelect = useCallback((subSubcategory: SubSubcategory) => {
    if (!tempCategory || !tempSubcategory) return; // Seguridad

    // Esta es la selección final, actualizar estado global
    const selection = {
      categorySlug: tempCategory.id,
      subcategorySlug: tempSubcategory.id,
      subSubcategorySlug: subSubcategory.id,
    };
    
    // Avanzar automáticamente
    if (autoAdvance) {
      // Pequeño retraso para permitir que la UI se actualice
      setTimeout(() => {
        onCategorySelect(selection);
        Logger.info(`Clasificación final seleccionada: ${tempCategory.name} > ${tempSubcategory.name} > ${subSubcategory.name}`);
      }, 300);
    } else {
      onCategorySelect(selection);
      Logger.info(`Clasificación final seleccionada: ${tempCategory.name} > ${tempSubcategory.name} > ${subSubcategory.name}`);
    }
    setShowCatError(false)
  }, [onCategorySelect, tempCategory, tempSubcategory, autoAdvance]);

  // --- Callbacks de Navegación UI ---

  const handleBack = useCallback(() => {
    if (currentLevel === 'subSubcategory') {
      setCurrentLevel('subcategory');
      // Al retroceder, actualizar la selección global
      if (tempCategory) {
        onCategorySelect({
          categorySlug: tempCategory.id,
          subcategorySlug: tempSubcategory?.id || '',
          subSubcategorySlug: null
        });
      }
      Logger.debug('Volviendo a la lista de subcategorías');
    } else if (currentLevel === 'subcategory') {
      setCurrentLevel('category');
      setTempSubcategory(null);
      // Al retroceder a categoría, limpiar selección
      onCategorySelect({
        categorySlug: '',
        subcategorySlug: '',
        subSubcategorySlug: null
      });
      Logger.debug('Volviendo a la lista de categorías');
    }
  }, [currentLevel, tempCategory, tempSubcategory, onCategorySelect]);

  // --- Memorización de Listas a Mostrar ---

  const currentSubcategories = useMemo((): Subcategory[] => {
    if (currentLevel === 'subcategory' && tempCategory) {
      // Usa la estructura anidada directamente
      return tempCategory.subcategories || [];
    }
    return [];
  }, [currentLevel, tempCategory]);

  const currentSubSubcategories = useMemo((): SubSubcategory[] => {
    if (currentLevel === 'subSubcategory' && tempSubcategory) {
      // Usa la estructura anidada directamente
      return tempSubcategory.subSubcategories || [];
    }
    return [];
  }, [currentLevel, tempSubcategory]);

  // --- Componentes de Renderizado (Cards) ---

  const renderCategoryCard = useCallback((category: Category) => {
    const isSelected = tempCategory?.id === category.id; 
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      empleos: BriefcaseIcon,
      inmuebles: HomeIcon,
      vehiculos: TruckIcon,
      servicios: WrenchScrewdriverIcon,
      productos: ShoppingBagIcon,
      eventos: CalendarIcon,
      negocios: ChartBarIcon,
      comunidad: UserGroupIcon,
    };
    const CatIcon = iconMap[category.id] || TagIcon;

    return (
      <motion.button
        key={category.id}
        onClick={() => handleCategorySelect(category)}
        className={`w-full text-left p-3 rounded-xl border transition-all ${
          isSelected 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400' 
            : 'border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-500 bg-white dark:bg-gray-700'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              isSelected 
                ? 'bg-primary-100 dark:bg-primary-800/50' 
                : 'bg-gray-100 dark:bg-gray-600'
            }`}>
              <CatIcon className={`w-5 h-5 ${
                isSelected 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-500 dark:text-gray-300'
              }`} />
            </div>
            <div>
              <h3 className={`text-sm font-medium ${
                isSelected 
                  ? 'text-primary-900 dark:text-primary-100' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {category.name}
              </h3>
            </div>
          </div>
          {hasSubcategories && (
            <ChevronRightIcon className={`w-4 h-4 ${
              isSelected 
                ? 'text-primary-500 dark:text-primary-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          )}
        </div>
      </motion.button>
    );
  }, [handleCategorySelect, tempCategory]);

  const renderSubcategoryCard = useCallback((subcategory: Subcategory) => {
    const isSelected = tempSubcategory?.id === subcategory.id;
    const hasSubSubcategories = subcategory.subSubcategories && subcategory.subSubcategories.length > 0;

    return (
      <motion.button
        key={subcategory.id}
        onClick={() => handleSubcategorySelect(subcategory)}
        className={`w-full text-left p-3 rounded-xl border transition-all ${
          isSelected 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400' 
            : 'border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-500 bg-white dark:bg-gray-700'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              isSelected 
                ? 'bg-primary-100 dark:bg-primary-800/50' 
                : 'bg-gray-100 dark:bg-gray-600'
            }`}>
              <span className="text-base">🔹</span>
            </div>
            <div>
              <h3 className={`text-sm font-medium ${
                isSelected 
                  ? 'text-primary-900 dark:text-primary-100' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {subcategory.name}
              </h3>
            </div>
          </div>
          {hasSubSubcategories && (
            <ChevronRightIcon className={`w-4 h-4 ${
                isSelected 
                  ? 'text-primary-500 dark:text-primary-400' 
                  : 'text-gray-400 dark:text-gray-500'
            }`} />
          )}
        </div>
      </motion.button>
    );
  }, [handleSubcategorySelect, tempSubcategory]);

  const renderSubSubcategoryCard = useCallback((subSubcategory: SubSubcategory) => {
    const isSelected = selectedCategory?.subSubcategorySlug === subSubcategory.id;

    return (
      <motion.button
        key={subSubcategory.id}
        onClick={() => handleSubSubcategorySelect(subSubcategory)}
        className={`w-full text-left p-3 rounded-xl border transition-all ${
          isSelected 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400' 
            : 'border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-500 bg-white dark:bg-gray-700'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 text-base">{((subSubcategory as unknown as Record<string, unknown>).emoji as string) || '🔹'}</span>
            <h3 className={`text-sm font-medium leading-tight break-words line-clamp-2 ${
              isSelected 
                ? 'text-primary-900 dark:text-primary-100' 
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {subSubcategory.name}
            </h3>
          </div>
          {isSelected && (
            <CheckCircleIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
          )}
        </div>
      </motion.button>
    );
  }, [handleSubSubcategorySelect, selectedCategory]);

  // --- Renderizado Principal del Componente ---

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {currentLevel === 'category' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Selecciona una categoría
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {categoriesList.map(renderCategoryCard)}
            </div>
          </motion.div>
        )}

        {currentLevel === 'subcategory' && tempCategory && (
          <motion.div
            key="subcategories"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-600">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {tempCategory.name}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Selecciona una subcategoría
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {currentSubcategories.length > 0 ? (
                currentSubcategories.map(renderSubcategoryCard)
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8 md:col-span-2">
                  Esta categoría no tiene subcategorías definidas.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {currentLevel === 'subSubcategory' && tempSubcategory && (
          <motion.div
            key="subsubcategories"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-600">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {tempCategory?.name} &gt; {tempSubcategory.name}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Selecciona una sub-subcategoría
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {currentSubSubcategories.length > 0 ? (
                currentSubSubcategories.map(renderSubSubcategoryCard)
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8 md:col-span-2">
                  Esta subcategoría no tiene más divisiones. Por favor, retrocede y selecciona otra opción o confirma.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error auto-desvanecible */}
      {showCatError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 my-2 animate-fade-out">
          <p className="text-sm text-red-700 dark:text-red-300">Debes seleccionar categoría y subcategoría.</p>
        </div>
      )}
      <style jsx>{`
        .animate-fade-out{animation:fadeout 2.5s forwards}
        @keyframes fadeout{0%{opacity:1}80%{opacity:0.3}100%{opacity:0;display:none}}
      `}</style>
      
      {/* Muestra selección actual */}
      {selectedCategory?.categorySlug && selectedCategory?.subcategorySlug && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 my-2">
          <p className="text-sm text-green-700 dark:text-green-300">
            {`Selección actual: ${tempCategory?.name || ''} > ${tempSubcategory?.name || ''} ${selectedCategory?.subSubcategorySlug ? '> ' + (currentSubSubcategories.find(s => s.id === selectedCategory.subSubcategorySlug)?.name || '') : ''}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;