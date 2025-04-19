// categories.service.ts

// Removed imports related to MongoDB as they are not needed for static data
// import { Collection, Document } from 'mongodb';
// import { getMongoClient } from '@/lib/mongodb'; // Correct import as named export
// import { mongoDbQuery } from '@/lib/mongodb.server';

// Check if we're in a browser environment
// const isBrowser = typeof window !== 'undefined'; // Not strictly needed anymore

// Static categories definition - ONLY the 8 main categories
// (Keep this definition as it's the source of truth now)
const staticCategories = [
  {
    id: 'empleos',
    name: 'Empleos',
    slug: 'empleos',
    description: 'Encuentra trabajos o publica ofertas laborales en toda la región.',
    icon: 'BriefcaseIcon', // Keeping icon name as string
    gradient: 'from-blue-500 to-blue-700',
    imageUrl: '/images/empleo-dev.jpg', // These imageURLs might still cause 404s if files don't exist
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    slug: 'inmuebles',
    description: 'Casas, departamentos, terrenos y locales comerciales en venta o alquiler.',
    icon: 'HomeIcon',
    gradient: 'from-green-500 to-green-700',
    imageUrl: '/images/departamento-miraflores.jpg',
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    slug: 'vehiculos',
    description: 'Autos, motos, camionetas y más vehículos nuevos y usados.',
    icon: 'TruckIcon',
    gradient: 'from-red-500 to-red-700',
    imageUrl: '/images/vehiculo-corolla.jpg',
  },
  {
    id: 'servicios',
    name: 'Servicios',
    slug: 'servicios',
    description: 'Profesionales y técnicos que ofrecen servicios de calidad.',
    icon: 'WrenchIcon',
    gradient: 'from-purple-500 to-purple-700',
    imageUrl: '/images/servicio-clases.jpg',
  },
  {
    id: 'productos',
    name: 'Productos',
    slug: 'productos',
    description: 'Compra y venta de todo tipo de productos nuevos o de segunda mano.',
    icon: 'ShoppingBagIcon',
    gradient: 'from-orange-500 to-orange-700',
    imageUrl: '/images/producto-laptop.jpg',
  },
  {
    id: 'eventos',
    name: 'Eventos',
    slug: 'eventos',
    description: 'Conciertos, talleres, conferencias y todo tipo de eventos.',
    icon: 'CalendarIcon',
    gradient: 'from-pink-500 to-pink-700',
    imageUrl: '/images/evento-concierto.jpg',
  },
  {
    id: 'negocios',
    name: 'Negocios',
    slug: 'negocios',
    description: 'Oportunidades de negocio, franquicias y traspasos.',
    icon: 'ChartBarIcon',
    gradient: 'from-yellow-500 to-yellow-700',
    imageUrl: '/images/negocio-tienda.jpg',
  },
  {
    id: 'comunidad',
    name: 'Comunidad',
    slug: 'comunidad',
    description: 'Anuncios comunitarios, eventos sociales y más.',
    icon: 'UserGroupIcon',
    gradient: 'from-teal-500 to-teal-700',
    imageUrl: '/images/comunidad-evento.jpg', // These imageURLs might still cause 404s if files don't exist
  }
];

// Type for static categories (simplified)
interface StaticCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Icon name as string
  gradient: string;
  imageUrl: string;
  count?: number; // Keep optional count for type compatibility if needed elsewhere
}

// Interface for category counts (no longer used here)
// interface CategoryCount {
//   id: string;
//   count: number;
// }

export class CategoriesService {
  /**
   * Obtiene todas las categorías principales ESTATICAMENTE.
   * @returns Una lista de categorías.
   */
  static async getCategories(): Promise<StaticCategoryItem[]> {
    // Always return the static definition directly
    // Add count: 0 for compatibility if needed by consumers, otherwise remove it
    return Promise.resolve(staticCategories.map(cat => ({ ...cat, count: 0 }))); 
  }

  /**
   * Obtiene los tipos de una categoría específica (subcategorías).
   * NOTE: This function still attempts to fetch from /api/categories/:id/subcategories.
   * This API route likely needs to be implemented or this function needs modification
   * if subcategories should also be static.
   * For now, we leave it, but calls to it might fail if the API doesn't exist.
   * @param categoryId ID de la categoría.
   * @returns Una lista de subcategorías asociadas con la categoría.
   */
  static async getCategoryWithTypes(categoryId: string): Promise<any[]> { // Return type might need adjustment
    // If subcategories should also be static, this needs to be rewritten.
    // For now, keep the browser fetch attempt, but expect it might fail.
    const isBrowser = typeof window !== 'undefined';
      if (isBrowser) {
        try {
          const response = await fetch(`/api/categories/${categoryId}/subcategories`);
          if (!response.ok) {
            console.error(`API error fetching subcategories for ${categoryId}: ${response.statusText}`);
            return []; // Return empty on error
          }
          return await response.json();
        } catch (error) {
          console.error(`Error fetching subcategories for category ${categoryId}:`, error);
          return [];
        }
      }
      
      // Server-side fetch attempt (remove if API doesn't exist)
      // This part will fail if the API route is gone. 
      // Consider removing or replacing with static logic if needed.
      console.warn('Server-side fetching of subcategories in CategoriesService is not implemented with static data.')
      return [];
  }
  
  // Removed the old getCategories implementation that used fetch/mongoDbQuery
  // Removed getCategoryCounts function if it existed.
}