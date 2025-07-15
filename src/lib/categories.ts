// Archivo unificado que exporta todo lo relacionado con categorías
// Fuente única de verdad para el sistema de clasificación

export {
  categoriesList,
  categoriesMap,
  getCategoryById,
  getSubcategories,
  getSubSubcategories,
  getClassificationNames,
  type Category,
  type Subcategory,
  type SubSubcategory
} from '@/data/categories-data';

import { categoriesList, getCategoryById, getSubcategories, getSubSubcategories } from '@/data/categories-data';

// Función para generar URL amigable desde clasificación
export const generateCategoryUrl = (
  categoryId?: string,
  subcategoryId?: string,
  subSubcategoryId?: string
): string => {
  const parts = [];
  
  if (categoryId) parts.push(categoryId);
  if (subcategoryId) parts.push(subcategoryId);
  if (subSubcategoryId) parts.push(subSubcategoryId);
  
  return parts.length > 0 ? `/${parts.join('/')}` : '/';
};

// Función para parsear URL y extraer clasificación
export const parseCategoryUrl = (pathname: string): {
  categoryId?: string;
  subcategoryId?: string;
  subSubcategoryId?: string;
} => {
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) return {};
  
  const categoryId = parts[0];
  const category = getCategoryById(categoryId);
  
  if (!category) return {};
  
  const result: {
    categoryId: string;
    subcategoryId?: string;
    subSubcategoryId?: string;
  } = { categoryId };
  
  if (parts.length >= 2) {
    const subcategoryId = parts[1];
    const subcategories = getSubcategories(categoryId);
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    
    if (subcategory) {
      result.subcategoryId = subcategoryId;
      
      if (parts.length >= 3) {
        const subSubcategoryId = parts[2];
        const subSubcategories = getSubSubcategories(categoryId, subcategoryId);
        const subSubcategory = subSubcategories.find(subsub => subsub.id === subSubcategoryId);
        
        if (subSubcategory) {
          result.subSubcategoryId = subSubcategoryId;
        }
      }
    }
  }
  
  return result;
};

// Función para validar si una combinación de categoría/subcategoría/subsubcategoría es válida
export const isValidCategoryPath = (
  categoryId?: string,
  subcategoryId?: string,
  subSubcategoryId?: string
): boolean => {
  if (!categoryId) return true; // Permitir sin categoría
  
  const category = getCategoryById(categoryId);
  if (!category) return false;
  
  if (!subcategoryId) return true; // Permitir solo categoría
  
  const subcategories = getSubcategories(categoryId);
  const subcategory = subcategories.find(sub => sub.id === subcategoryId);
  if (!subcategory) return false;
  
  if (!subSubcategoryId) return true; // Permitir categoría + subcategoría
  
  const subSubcategories = getSubSubcategories(categoryId, subcategoryId);
  const subSubcategory = subSubcategories.find(subsub => subsub.id === subSubcategoryId);
  
  return !!subSubcategory;
};

// Función para obtener todas las categorías con iconos (para mantener compatibilidad)
export const getCategoriesWithIcons = () => {
  return categoriesList.map(category => ({
    ...category,
    icon: getCategoryIcon(category.id),
    gradient: getCategoryGradient(category.id),
    imageUrl: getCategoryImage(category.id)
  }));
};

// Mapeo de iconos por categoría
const getCategoryIcon = (categoryId: string): string => {
  const iconMap: Record<string, string> = {
    empleos: 'BriefcaseIcon',
    inmuebles: 'HomeIcon',
    vehiculos: 'TruckIcon',
    servicios: 'WrenchIcon',
    productos: 'ShoppingBagIcon',
    eventos: 'CalendarIcon',
    comunidad: 'UserGroupIcon',
    negocios: 'ChartBarIcon'
  };
  return iconMap[categoryId] || 'TagIcon';
};

// Mapeo de gradientes por categoría
const getCategoryGradient = (categoryId: string): string => {
  const gradientMap: Record<string, string> = {
    empleos: 'from-blue-500 to-blue-700',
    inmuebles: 'from-green-500 to-green-700',
    vehiculos: 'from-red-500 to-red-700',
    servicios: 'from-purple-500 to-purple-700',
    productos: 'from-orange-500 to-orange-700',
    eventos: 'from-pink-500 to-pink-700',
    comunidad: 'from-teal-500 to-teal-700',
    negocios: 'from-yellow-500 to-yellow-700'
  };
  return gradientMap[categoryId] || 'from-gray-500 to-gray-700';
};

// Mapeo de imágenes por categoría
const getCategoryImage = (categoryId: string): string => {
  const imageMap: Record<string, string> = {
    empleos: '/images/empleo-dev.jpg',
    inmuebles: '/images/departamento-miraflores.jpg',
    vehiculos: '/images/vehiculo-corolla.jpg',
    servicios: '/images/servicio-clases.jpg',
    productos: '/images/producto-laptop.jpg',
    eventos: '/images/evento-concierto.jpg',
    comunidad: '/images/comunidad-evento.jpg',
    negocios: '/images/negocio-tienda.jpg'
  };
  return imageMap[categoryId] || '/images/placeholder-category.jpg';
};

// Función para buscar categorías, subcategorías y subsubcategorías por texto
export const searchCategories = (query: string) => {
  const results: Array<{
    type: 'category' | 'subcategory' | 'subsubcategory';
    categoryId: string;
    subcategoryId?: string;
    subSubcategoryId?: string;
    name: string;
    fullPath: string;
  }> = [];
  
  const queryLower = query.toLowerCase();
  
  categoriesList.forEach(category => {
    // Buscar en categorías
    if (category.name.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'category',
        categoryId: category.id,
        name: category.name,
        fullPath: category.name
      });
    }
    
    // Buscar en subcategorías
    category.subcategories.forEach(subcategory => {
      if (subcategory.name.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'subcategory',
          categoryId: category.id,
          subcategoryId: subcategory.id,
          name: subcategory.name,
          fullPath: `${category.name} > ${subcategory.name}`
        });
      }
      
      // Buscar en subsubcategorías
      subcategory.subSubcategories?.forEach(subSubcategory => {
        if (subSubcategory.name.toLowerCase().includes(queryLower)) {
          results.push({
            type: 'subsubcategory',
            categoryId: category.id,
            subcategoryId: subcategory.id,
            subSubcategoryId: subSubcategory.id,
            name: subSubcategory.name,
            fullPath: `${category.name} > ${subcategory.name} > ${subSubcategory.name}`
          });
        }
      });
    });
  });
  
  return results;
}; 