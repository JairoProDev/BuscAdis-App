// categories.service.ts

// Removed imports related to MongoDB as they are not needed for static data
// import { Collection, Document } from 'mongodb';
// import { getMongoClient } from '@/lib/mongodb'; // Correct import as named export
// import { mongoDbQuery } from '@/lib/mongodb.server';

// Check if we're in a browser environment
// const isBrowser = typeof window !== 'undefined'; // Not strictly needed anymore

// Importar desde el sistema unificado de categorías
import { categoriesList, getCategoriesWithIcons } from '@/lib/categories';

// Interface for category counts (no longer used here)
// interface CategoryCount {
//   id: string;
//   count: number;
// }

export class CategoriesService {
  /**
   * Obtiene todas las categorías principales usando el sistema unificado.
   * @returns Una lista de categorías con iconos y metadatos.
   */
  static async getCategories() {
    // Usar el sistema unificado que incluye iconos, gradientes e imágenes
    return Promise.resolve(getCategoriesWithIcons());
  }

  /**
   * Obtiene los tipos de una categoría específica (subcategorías).
   * Ahora usa el sistema unificado de categorías.
   * @param categoryId ID de la categoría.
   * @returns Una lista de subcategorías asociadas con la categoría.
   */
  static async getCategoryWithTypes(categoryId: string) {
    // Buscar la categoría en el sistema unificado
    const category = categoriesList.find(cat => cat.id === categoryId);
    
    if (!category) {
      console.warn(`Category with ID ${categoryId} not found`);
      return [];
    }

    // Retornar las subcategorías en el formato esperado
    return Promise.resolve(category.subcategories.map(subcategory => ({
      id: subcategory.id,
      name: subcategory.name,
      slug: subcategory.id, // Mantener compatibilidad con slug
      subSubcategories: subcategory.subSubcategories?.map(subSub => ({
        id: subSub.id,
        name: subSub.name,
        slug: subSub.id // Mantener compatibilidad con slug
      })) || []
    })));
  }

  /**
   * Obtiene el conteo de publicaciones por categoría.
   * Esta función podría implementarse para obtener conteos reales de la base de datos.
   * @returns Un objeto con conteos por categoría.
   */
  static async getCategoryCounts() {
    // Por ahora retornar conteos de ejemplo
    // En el futuro esto podría conectarse a la API de publicaciones
    const defaultCounts: Record<string, number> = {
      empleos: 163,
      inmuebles: 257,
      vehiculos: 184,
      servicios: 209,
      productos: 318,
      eventos: 73,
      comunidad: 45,
      negocios: 92
    };

    return Promise.resolve(defaultCounts);
  }
}