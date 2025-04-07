// categories.service.ts

import { Collection, Document } from 'mongodb';
import getMongoClient from '@/lib/mongodb'; // Función para conectar a MongoDB
import { categories as staticCategories } from '@/data/categories'; // Datos estáticos de categorías

// Tipos para las categorías estáticas
interface StaticCategory {
  name?: string;
  icon: string | React.ComponentType;
  description: string;
  gradient: string;
}

// Tipos para las categorías de MongoDB
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
  gradient?: string;
  slug?: string;
}

export class CategoriesService {
  /**
   * Obtiene una colección específica de MongoDB.
   * @param collectionName Nombre de la colección.
   * @returns La colección tipada de MongoDB.
   */
  private static async getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
    const client = await getMongoClient(); // Usa la conexión configurada
    const db = client.db(process.env.MONGO_DB_NAME || 'test'); // Usa el nombre de la base de datos

    // Verifica que la colección sea una instancia válida
    const collection = db.collection<T>(collectionName);
    if (!collection || !(collection.find instanceof Function)) {
      throw new Error(`La colección ${collectionName} no es válida.`);
    }

    return collection; // Devuelve una colección tipada
  }

  /**
   * Obtiene todas las categorías desde la base de datos o un fallback estático.
   * @returns Una lista de categorías.
   */
  static async getCategories(): Promise<CategoryItem[]> {
    try {
      const collection = await this.getCollection<CategoryItem>('categories'); // Tipado explícito
      const results = await collection.find({}).toArray(); // Obtiene los resultados como un array

      return results.map((category) => ({
        id: category._id?.toString() || '', // Usa `_id` de MongoDB
        name: category.name || '',
        icon: category.icon || '',
        description: category.description || '',
        gradient: category.gradient || '',
        slug: category.slug || '',
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);

      // Mapear categorías estáticas como fallback
      return Object.keys(staticCategories).map((key) => {
        const category: Partial<StaticCategory> = staticCategories[key as keyof typeof staticCategories];
        return {
          id: key,
          name: category.name || key,
          icon: typeof category.icon === 'string' ? category.icon : '',
          description: category.description || 'Descripción no disponible',
          gradient: category.gradient || 'from-gray-500 to-gray-700',
        };
      });
    }
  }

  /**
   * Obtiene el conteo de documentos en diferentes colecciones según el slug.
   * @param categorySlug Slug de la categoría.
   * @returns El número total de documentos relacionados.
   */
  static async getCategoryCount(categorySlug: string): Promise<number> {
    try {
      const collections = ['publications_inmuebles', 'publications_empleos', 'publications_servicios'];
      let totalCount = 0;

      for (const collectionName of collections) {
        const collection = await this.getCollection<{ categorySlug: string }>(collectionName); // Tipar documentos
        totalCount += await collection.countDocuments({ categorySlug });
      }

      return totalCount;
    } catch (error) {
      console.error(`Error fetching count for slug ${categorySlug}:`, error);
      return 0;
    }
  }

  /**
   * Obtiene los tipos de una categoría específica desde la base de datos.
   * @param categoryId ID de la categoría.
   * @returns Una lista de tipos asociados con la categoría.
   */
  static async getCategoryWithTypes(categoryId: string): Promise<CategoryItem[]> {
    try {
      const collection = await this.getCollection<CategoryItem>('categoryTypes');
      const results = await collection.find({ categoryId }).toArray();

      return results.map((type) => ({
        id: type._id?.toString() || '', // Usa `_id` de MongoDB
        name: type.name || '',
        icon: type.icon || '',
      }));
    } catch (error) {
      console.error(`Error fetching types for category ${categoryId}:`, error);
      return [];
    }
  }
}