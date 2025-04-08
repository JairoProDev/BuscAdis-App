// categories.service.ts

import { Collection, Document } from 'mongodb';
import { getMongoClient } from '@/lib/mongodb'; // Correct import as named export
import { mongoDbQuery } from '@/lib/mongodb.server';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Static categories definition - ONLY the 8 main categories
const staticCategories = [
  {
    id: 'empleos',
    name: 'Empleos',
    slug: 'empleos',
    description: 'Encuentra trabajos o publica ofertas laborales en toda la región.',
    icon: 'BriefcaseIcon',
    gradient: 'from-blue-500 to-blue-700',
    imageUrl: '/images/empleo-dev.jpg',
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
    imageUrl: '/images/comunidad-evento.jpg',
  }
];

// Tipos para las categorías de MongoDB
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
  gradient?: string;
  slug?: string;
  count?: number;
}

// Interface for category counts
interface CategoryCount {
  id: string;
  count: number;
}

export class CategoriesService {
  /**
   * Obtiene todas las categorías desde la base de datos o un fallback estático.
   * @returns Una lista de categorías.
   */
  static async getCategories(): Promise<CategoryItem[]> {
    try {
      // If we're in the browser, use API fetch
      if (isBrowser) {
        try {
          // First try to fetch from API
          const response = await fetch('/api/categories');
          if (!response.ok) {
            throw new Error('API error');
          }
          
          // Get category counts
          const countResponse = await fetch('/api/categories/count');
          let counts: CategoryCount[] = [];
          
          if (countResponse.ok) {
            counts = await countResponse.json();
          }
          
          const categories = await response.json();
          
          // Merge counts with categories
          return categories.map((category: CategoryItem) => {
            const countData = counts.find(c => c.id === category.id);
            return {
              ...category,
              count: countData?.count || 0
            };
          });
        } catch (error) {
          console.error('Error fetching from API:', error);
          // Return static categories with zero counts as fallback
          return staticCategories.map((category) => ({
            ...category,
            count: 0
          }));
        }
      }
      
      // Server-side code - use mongoDbQuery instead of direct client access
      if (!isBrowser) {
        try {
          const results = await mongoDbQuery('categories', {}, {});
          
          if (results && results.length > 0) {
            return results.map((category: any) => ({
              id: category._id?.toString() || '',
              name: category.name || '',
              icon: category.icon || '',
              description: category.description || '',
              gradient: category.gradient || '',
              slug: category.slug || '',
              count: category.count || 0
            }));
          }
        } catch (error) {
          console.error('Error querying MongoDB:', error);
          // Continue to the fallback below
        }
      }
      
      // Return static categories as fallback
      return staticCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return static categories as ultimate fallback
      return staticCategories;
    }
  }

  /**
   * Obtiene los tipos de una categoría específica (subcategorías).
   * @param categoryId ID de la categoría.
   * @returns Una lista de subcategorías asociadas con la categoría.
   */
  static async getCategoryWithTypes(categoryId: string): Promise<CategoryItem[]> {
    try {
      // For browser environments, fetch from API
      if (isBrowser) {
        try {
          const response = await fetch(`/api/categories/${categoryId}/subcategories`);
          if (!response.ok) {
            throw new Error('API error');
          }
          return await response.json();
        } catch (error) {
          console.error(`Error fetching subcategories for category ${categoryId}:`, error);
          return [];
        }
      }
      
      // Server-side code - use mongoDbQuery instead of direct client access
      if (!isBrowser) {
        try {
          const results = await mongoDbQuery('subcategories', { categoryId }, {});
          
          if (results && results.length > 0) {
            return results.map((subcategory: any) => ({
              id: subcategory._id?.toString() || '',
              name: subcategory.name || '',
              icon: subcategory.icon || '',
              categoryId: subcategory.categoryId,
              count: subcategory.count || 0
            }));
          }
        } catch (error) {
          console.error(`Error querying MongoDB for subcategories:`, error);
          // Continue to the fallback below
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      return [];
    }
  }
}