import { categories as staticCategories } from '@/data/categories';
import clientPromise, { mongoFetch } from '@/lib/mongodb';

// Mapeo de nombres de iconos a componentes reales
import { 
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  CalendarIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

// Export icons with names for usage in the app
export const iconComponents = {
  'BriefcaseIcon': BriefcaseIcon,
  'HomeIcon': HomeIcon,
  'TruckIcon': TruckIcon,
  'WrenchIcon': WrenchIcon,
  'ShoppingBagIcon': ShoppingBagIcon,
  'GlobeAltIcon': GlobeAltIcon,
  'CalendarIcon': CalendarIcon,
  'AcademicCapIcon': AcademicCapIcon,
  'HeartIcon': HeartIcon
};

export const Categories = staticCategories; // Exporta las categorías estáticas

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Define category structure for static fallback
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
  gradient?: string;
  slug?: string;
}

export class CategoriesService {
  private static async getCollection(collectionName: string) {
    // If we're in a browser environment, we can't use MongoDB directly
    if (isBrowser) {
      throw new Error('Direct MongoDB access is not available in browser environment');
    }
    
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection(collectionName);
  }

  static async getCategories() {
    try {
      // If we're in a browser environment, use the API
      if (isBrowser) {
        const data = await mongoFetch('/api/categories');
        return data || [];
      }
      
      // Otherwise, use MongoDB directly
      const categories = await this.getCollection('categories');
      return await categories.find({}).toArray();
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      // Return static categories as fallback
      return Object.keys(staticCategories).map(key => {
        const category = staticCategories[key as keyof typeof staticCategories];
        return {
          id: key,
          name: key,
          icon: category.icon.name || category.icon.toString(),
        } as CategoryItem;
      });
    }
  }
  
  static async getCategoryCount(categoryName: string) {
    try {
      // If we're in a browser environment, use the API
      if (isBrowser) {
        const data = await mongoFetch(`/api/categories/${categoryName}/count`);
        return data.count || 0;
      }
      
      // Otherwise, use MongoDB directly
      // We need to check all collections
      const client = await clientPromise;
      const db = client.db('test');
      
      // Count across all publication collections
      const inmuebles = await db.collection('publications_inmuebles').countDocuments({
        categorySlug: categoryName.toLowerCase()
      });
      
      const empleos = await db.collection('publications_empleos').countDocuments({
        categorySlug: categoryName.toLowerCase()
      });
      
      const servicios = await db.collection('publications_servicios').countDocuments({
        categorySlug: categoryName.toLowerCase()
      });
      
      const vehiculos = await db.collection('publications_vehiculos').countDocuments({
        categorySlug: categoryName.toLowerCase()
      });
      
      return inmuebles + empleos + servicios + vehiculos;
    } catch (error) {
      console.error(`Error fetching count for category ${categoryName}:`, error);
      return 0;
    }
  }
  
  static async getCategoryWithTypes(categoryId: string) {
    try {
      // If we're in a browser environment, use the API
      if (isBrowser) {
        const data = await mongoFetch(`/api/categories/${categoryId}/types`);
        return data || null;
      }
      
      // Otherwise, use MongoDB directly
      const categoryTypes = await this.getCollection('categoryTypes');
      const results = await categoryTypes.find({
        categoryId: categoryId
      }).toArray();
      return results;
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
      return null;
    }
  }
}
