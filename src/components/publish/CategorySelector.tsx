'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRightIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    TagIcon,
    BuildingOfficeIcon,
    ShoppingBagIcon,
    TruckIcon,
    BriefcaseIcon,
    HomeIcon,
} from '@heroicons/react/24/outline';
import { usePublication, publicationActions } from '@/contexts/PublicationContext';
import { Logger } from '@/services/logging.service';
import { categoriesData, subcategoriesData, subSubcategoriesData } from '@/data/categories-data';

interface SubSubCategory {
    id: string;
    name: string;
    description?: string;
}

interface SubCategory {
    id: string;
    name: string;
    subSubcategories?: SubSubCategory[];
}

interface CategoryOption {
    id: string;
    name: string;
    description?: string;
    subcategories?: { [key: string]: SubCategory };
}

interface Category {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
}

interface CategorySelectorProps {
    value?: { id: string; name: string };
    onChange: (category: { id: string; name: string }) => void;
    className?: string;
}

const categories: Category[] = [
    {
        id: 'inmuebles',
        name: 'Inmuebles',
        icon: HomeIcon,
        description: 'Propiedades, alquileres, terrenos'
    },
    {
        id: 'vehiculos',
        name: 'Vehículos',
        icon: TruckIcon,
        description: 'Autos, motos, camiones'
    },
    {
        id: 'empleos',
        name: 'Empleos',
        icon: BriefcaseIcon,
        description: 'Ofertas y demandas de trabajo'
    },
    {
        id: 'servicios',
        name: 'Servicios',
        icon: BuildingOfficeIcon,
        description: 'Profesionales, técnicos y más'
    },
    {
        id: 'productos',
        name: 'Productos',
        icon: ShoppingBagIcon,
        description: 'Artículos nuevos y usados'
    },
    {
        id: 'otros',
        name: 'Otros',
        icon: TagIcon,
        description: 'Otras categorías'
    }
];

const CategorySelector: React.FC = () => {
    const { state, dispatch } = usePublication();
    const selectedCategoryId = state.formData.category?.id;
    const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<SubSubCategory | null>(null);
    const [showSubcategories, setShowSubcategories] = useState(false);
    const [showSubSubcategories, setShowSubSubcategories] = useState(false);

    const categories: CategoryOption[] = Object.values(categoriesData);

    useEffect(() => {
        if (selectedCategory && selectedSubcategory && selectedSubSubcategory) {
            dispatch(publicationActions.updateForm({
                category_id: selectedCategory.id,
                subcategory_id: selectedSubcategory.id,
                sub_subcategory_id: selectedSubSubcategory.id,
                category_type: selectedCategory.id as PublicationCategory,
            }));
            dispatch(publicationActions.setStep(2));
        } else if (selectedCategory && selectedSubcategory && !selectedSubSubcategory && !showSubSubcategories) {
            dispatch(publicationActions.updateForm({
                category_id: selectedCategory.id,
                subcategory_id: selectedSubcategory.id,
                category_type: selectedCategory.id as PublicationCategory,
            }));
            dispatch(publicationActions.setStep(2));
        } else if (selectedCategory && !selectedSubcategory && !showSubcategories) {
            dispatch(publicationActions.updateForm({
                category_id: selectedCategory.id,
                category_type: selectedCategory.id as PublicationCategory,
            }));
            dispatch(publicationActions.setStep(2));
        }
    }, [selectedCategory, selectedSubcategory, selectedSubSubcategory, dispatch, showSubcategories, showSubSubcategories]);

    const handleCategorySelect = useCallback((category: Category) => {
        dispatch(publicationActions.updateForm({
            category: { 
                id: category.id, 
                name: category.name 
            }
        }));
        Logger.debug('Category selected', { category: category.id });
    }, [dispatch]);

    const handleNext = useCallback(() => {
        if (selectedCategoryId) {
            dispatch(publicationActions.setStep(2));
        }
    }, [dispatch, selectedCategoryId]);

    const handleSubcategorySelect = (subcategory: SubCategory) => {
        setSelectedSubcategory(subcategory);
        setSelectedSubSubcategory(null);
        setShowSubSubcategories(true);
        Logger.info(`Subcategoría seleccionada: ${subcategory.name}`);

        const subSubcategories = (subSubcategoriesData as { [key: string]: SubSubCategory[] })[subcategory.id] || [];

        setSelectedSubcategory({
            ...subcategory,
            subSubcategories: subSubcategories,
        });

        if (subSubcategories.length === 0) {
            dispatch(publicationActions.updateForm({
                category_id: selectedCategory?.id,
                subcategory_id: subcategory.id,
                category_type: selectedCategory?.id as PublicationCategory,
            }));
            dispatch(publicationActions.setStep(2));
        }
    };

    const handleSubSubcategorySelect = (subSubcategory: SubSubCategory) => {
        setSelectedSubSubcategory(subSubcategory);
        Logger.info(`Sub-subcategoría seleccionada: ${subSubcategory.name}`);
    };

    const handleBack = () => {
        if (showSubSubcategories) {
            setShowSubSubcategories(false);
            setSelectedSubSubcategory(null);
            Logger.debug('Volviendo a la lista de subcategorías');
        } else {
            setShowSubcategories(false);
            setSelectedSubcategory(null);
            Logger.debug('Volviendo a la lista de categorías');
        }
    };

    const renderCategoryCard = (category: CategoryOption) => {
        const isSelected = selectedCategory?.id === category.id;

        return (
            <motion.button
                key={category.id}
                onClick={() => handleCategorySelect(categories.find(c => c.id === category.id) as Category)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                            <TagIcon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                            <h3 className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{category.name}</h3>
                            {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                        </div>
                    </div>
                    {category.subcategories && Object.keys(category.subcategories).length > 0 && (
                        <ChevronRightIcon className={`w-5 h-5 ${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
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
                    isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                            <TagIcon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                            <h3 className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{subcategory.name}</h3>
                            {subcategory.description && <p className="text-sm text-gray-500">{subcategory.description}</p>}
                        </div>
                    </div>
                    {subcategory.subSubcategories && subcategory.subSubcategories.length > 0 && (
                        <ChevronRightIcon className={`w-5 h-5 ${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
                    )}
                </div>
            </motion.button>
        );
    };

    const renderSubSubcategoryCard = (subSubcategory: SubSubCategory) => {
        const isSelected = selectedSubSubcategory?.id === subSubcategory.id;

        return (
            <motion.button
                key={subSubcategory.id}
                onClick={() => handleSubSubcategorySelect(subSubcategory)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{subSubcategory.name}</h3>
                        {subSubcategory.description && <p className="text-sm text-gray-500">{subSubcategory.description}</p>}
                    </div>
                    {isSelected && <CheckCircleIcon className="w-5 h-5 text-primary-500" />}
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
                        <h2 className="text-lg font-medium text-gray-900">Selecciona una categoría</h2>
                        <div className="grid gap-3">{categories.map(renderCategoryCard)}</div>
                    </motion.div>
                ) : !showSubSubcategories ? (
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
                            <span className="text-sm text-gray-500">{selectedCategory?.name}</span>
                        </div>

                        <h2 className="text-lg font-medium text-gray-900">Selecciona una subcategoría</h2>

                        <div className="grid gap-3">
                            {selectedCategory && Object.values(selectedCategory.subcategories || {}).map(renderSubcategoryCard)}
                        </div>

                        {selectedCategory && Object.keys(selectedCategory.subcategories || {}).length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                Esta categoría no tiene subcategorías disponibles
                            </p>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="subsubcategories"
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
                                <span>Volver a subcategorías</span>
                            </button>
                            <span className="text-sm text-gray-500">{selectedSubcategory?.name}</span>
                        </div>

                        <h2 className="text-lg font-medium text-gray-900">Selecciona una sub-subcategoría</h2>

                        <div className="grid gap-3">
                            {selectedSubcategory?.subSubcategories?.map(renderSubSubcategoryCard)}
                        </div>

                        {selectedSubcategory?.subSubcategories?.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                Esta subcategoría no tiene sub-subcategorías disponibles
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {(selectedCategory || selectedSubcategory || selectedSubSubcategory) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-50 rounded-xl"
                >
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tu selección:</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span>{selectedCategory?.name}</span>
                        {selectedSubcategory && (
                            <>
                                <ChevronRightIcon className="w-4 h-4" />
                                <span>{selectedSubcategory.name}</span>
                            </>
                        )}
                        {selectedSubSubcategory && (
                            <>
                                <ChevronRightIcon className="w-4 h-4" />
                                <span>{selectedSubSubcategory.name}</span>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {selectedCategoryId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col space-y-4"
                >
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                {categories.find(c => c.id === selectedCategoryId)?.icon && 
                                    React.createElement(
                                        categories.find(c => c.id === selectedCategoryId)!.icon,
                                        { className: "h-5 w-5 text-blue-400" }
                                    )
                                }
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Categoría seleccionada: {state.formData.category?.name}
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        {categories.find(c => c.id === selectedCategoryId)?.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="self-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Continuar
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default CategorySelector;