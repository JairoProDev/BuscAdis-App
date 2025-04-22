'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TagIcon, // Icono genérico por ahora
  // Puedes importar más iconos si los mapeas a las categorías principales
} from '@heroicons/react/24/outline';
import { usePublication, publicationActions } from '@/contexts/PublicationContext'; // Asumiendo que existe y funciona
import { Logger } from '@/services/logging.service'; // Asumiendo que existe
// Importa la NUEVA estructura de datos y tipos
import { categoriesList, getSubcategories, getSubSubcategories } from '@/data/categories-data'; // Ajusta la ruta
import type { Category, Subcategory, SubSubcategory } from '@/data/categories-data'; // O desde '@/types/categories'

// Define el tipo esperado en el estado global del contexto (ajusta según tu implementación real)
interface PublicationFormData {
    categorySlug?: string | null;
    subcategorySlug?: string | null;
    subSubcategorySlug?: string | null;
    // ... otros campos del formulario
}

// Define el estado local del componente
type SelectionLevel = 'category' | 'subcategory' | 'subSubcategory';

const CategorySelector: React.FC = () => {
  const { state, dispatch } = usePublication(); // Hook del contexto global
  const formData = state.formData as PublicationFormData; // Tipado para claridad

  // Estado local para manejar QUÉ nivel de selección se muestra
  const [currentLevel, setCurrentLevel] = useState<SelectionLevel>('category');

  // Estado local para almacenar temporalmente la selección en cada nivel ANTES de confirmar
  const [tempCategory, setTempCategory] = useState<Category | null>(null);
  const [tempSubcategory, setTempSubcategory] = useState<Subcategory | null>(null);

  // --- Callbacks de Selección ---

  const handleCategorySelect = useCallback((category: Category) => {
    setTempCategory(category);
    setTempSubcategory(null); // Resetea niveles inferiores
    // Verifica si hay subcategorías
    if (category.subcategories && category.subcategories.length > 0) {
      setCurrentLevel('subcategory'); // Muestra subcategorías
      Logger.debug('Categoría seleccionada temporalmente, mostrando subcategorías', { category: category.id });
    } else {
      // Si no hay subcategorías, confirma esta selección directamente
      dispatch(publicationActions.updateForm({
        categorySlug: category.id,
        subcategorySlug: null,
        subSubcategorySlug: null,
        // category_type: category.id // Ajusta según necesites este campo
      }));
      dispatch(publicationActions.setStep(2)); // Avanza al siguiente paso del formulario
      Logger.info(`Categoría final seleccionada (sin subcategorías): ${category.name}`);
    }
  }, [dispatch]);

  const handleSubcategorySelect = useCallback((subcategory: Subcategory) => {
    if (!tempCategory) return; // Seguridad

    setTempSubcategory(subcategory);
    // Verifica si hay sub-subcategorías *reales* (no solo un array vacío)
    const hasSubSubcategories = subcategory.subSubcategories && subcategory.subSubcategories.length > 0;

    if (hasSubSubcategories) {
      setCurrentLevel('subSubcategory'); // Muestra sub-subcategorías
      Logger.debug('Subcategoría seleccionada temporalmente, mostrando sub-subcategorías', { subcategory: subcategory.id });
    } else {
      // Si no hay sub-subcategorías, confirma esta selección
      dispatch(publicationActions.updateForm({
        categorySlug: tempCategory.id,
        subcategorySlug: subcategory.id,
        subSubcategorySlug: null,
        // category_type: tempCategory.id // Ajusta según necesites
      }));
      dispatch(publicationActions.setStep(2)); // Avanza al siguiente paso
      Logger.info(`Clasificación final seleccionada: ${tempCategory.name} > ${subcategory.name}`);
    }
  }, [dispatch, tempCategory]);

  const handleSubSubcategorySelect = useCallback((subSubcategory: SubSubcategory) => {
    if (!tempCategory || !tempSubcategory) return; // Seguridad

    // Esta es la selección final
    dispatch(publicationActions.updateForm({
      categorySlug: tempCategory.id,
      subcategorySlug: tempSubcategory.id,
      subSubcategorySlug: subSubcategory.id,
      // category_type: tempCategory.id // Ajusta según necesites
    }));
    dispatch(publicationActions.setStep(2)); // Avanza al siguiente paso
    Logger.info(`Clasificación final seleccionada: ${tempCategory.name} > ${tempSubcategory.name} > ${subSubcategory.name}`);

  }, [dispatch, tempCategory, tempSubcategory]);

  // --- Callbacks de Navegación UI ---

  const handleBack = useCallback(() => {
    if (currentLevel === 'subSubcategory') {
      setCurrentLevel('subcategory');
      setTempSubcategory(null); // Limpia selección de subcategoría al retroceder a ella
      Logger.debug('Volviendo a la lista de subcategorías');
    } else if (currentLevel === 'subcategory') {
      setCurrentLevel('category');
      setTempCategory(null); // Limpia selección de categoría al retroceder a ella
      setTempSubcategory(null);
      Logger.debug('Volviendo a la lista de categorías');
    }
  }, [currentLevel]);

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
  // Optimizados para usar los tipos y la lógica nueva

  const renderCategoryCard = useCallback((category: Category) => {
    const isSelected = tempCategory?.id === category.id; // Usa estado temporal para UI
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    return (
      <motion.button
        key={category.id}
        onClick={() => handleCategorySelect(category)}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Icono: Mejorar mapeo si es necesario, usando TagIcon como fallback */}
            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
               <TagIcon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{category.name}</h3>
              {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
            </div>
          </div>
          {hasSubcategories && (
            <ChevronRightIcon className={`w-5 h-5 ${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
          )}
        </div>
      </motion.button>
    );
  }, [handleCategorySelect, tempCategory]);

  const renderSubcategoryCard = useCallback((subcategory: Subcategory) => {
    const isSelected = tempSubcategory?.id === subcategory.id; // Usa estado temporal para UI
    const hasSubSubcategories = subcategory.subSubcategories && subcategory.subSubcategories.length > 0;

    return (
        <motion.button
            key={subcategory.id}
            onClick={() => handleSubcategorySelect(subcategory)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Icono genérico para subcategorías */}
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        <TagIcon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h3 className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{subcategory.name}</h3>
                        {/* Podrías añadir descripción si la defines en la estructura */}
                    </div>
                </div>
                 {hasSubSubcategories && (
                    <ChevronRightIcon className={`w-5 h-5 ${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
                 )}
            </div>
        </motion.button>
    );
  }, [handleSubcategorySelect, tempSubcategory]);

    const renderSubSubcategoryCard = useCallback((subSubcategory: SubSubcategory) => {
        // Aquí, la selección confirma y avanza, no usamos estado temporal persistente
        const isSelected = formData.subSubcategorySlug === subSubcategory.id && formData.subcategorySlug === tempSubcategory?.id;

        return (
            <motion.button
                key={subSubcategory.id}
                onClick={() => handleSubSubcategorySelect(subSubcategory)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{subSubcategory.name}</h3>
                        {subSubcategory.description && <p className="text-sm text-gray-500">{subSubcategory.description}</p>}
                    </div>
                    {/* Podríamos mostrar un check si se confirma la selección antes de pasar al siguiente paso */}
                    {/* {isSelected && <CheckCircleIcon className="w-5 h-5 text-primary-500" />} */}
                </div>
            </motion.button>
        );
    }, [handleSubSubcategorySelect, formData, tempSubcategory]);


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
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900">Selecciona una categoría</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            className="space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <span className="text-sm font-medium text-gray-700">{tempCategory.name}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Selecciona una subcategoría</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentSubcategories.length > 0 ? (
                currentSubcategories.map(renderSubcategoryCard)
              ) : (
                <p className="text-center text-gray-500 py-8 md:col-span-2">
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
             className="space-y-4"
           >
             <div className="flex items-center justify-between pb-2 border-b">
               <button
                 onClick={handleBack}
                 className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
               >
                 <ArrowLeftIcon className="w-4 h-4" />
                 <span>Volver</span>
               </button>
               <span className="text-sm font-medium text-gray-700">{tempSubcategory.name}</span>
             </div>
             <h2 className="text-xl font-semibold text-gray-900">Selecciona una sub-subcategoría</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {currentSubSubcategories.length > 0 ? (
                  currentSubSubcategories.map(renderSubSubcategoryCard)
               ) : (
                 // Este caso no debería ocurrir si la lógica de handleSubcategorySelect es correcta,
                 // pero se deja por seguridad.
                 <p className="text-center text-gray-500 py-8 md:col-span-2">
                    Esta subcategoría no tiene más divisiones. Por favor, retrocede y selecciona otra opción o confirma.
                 </p>
               )}
             </div>
           </motion.div>
        )}
      </AnimatePresence>

       {/* Opcional: Mostrar selección final antes de pasar al siguiente paso */}
       {/* Se podría añadir un botón de "Confirmar Selección" al final de cada nivel */}
       {/* o un resumen como el que tenías, pero leyendo del estado global `formData` */}
       {/* {formData.categorySlug && ( ... Resumen ... )} */}

    </div>
  );
};

export default CategorySelector;