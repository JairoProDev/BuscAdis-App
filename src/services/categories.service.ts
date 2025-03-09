import { supabase } from '@/lib/supabaseClient';
import { Cache } from '@/utils/cache';
import { categories as staticCategories } from '@/data/categories';

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

const iconMap = {
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

export class CategoriesService {
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
        
      if (error) throw error;
      
      // Si no hay datos, usar categorías estáticas
      if (!data || data.length === 0) {
        return staticCategories;
      }
      
      // Convertir los datos a un formato compatible
      const formattedCategories = {};
      
      // Usar las categorías estáticas como base para mantener los iconos
      Object.keys(staticCategories).forEach(key => {
        formattedCategories[key] = { ...staticCategories[key] };
      });
      
      // Actualizar con datos reales
      data.forEach(cat => {
        if (formattedCategories[cat.name]) {
          formattedCategories[cat.name] = {
            ...formattedCategories[cat.name],
            description: cat.description || formattedCategories[cat.name].description,
            gradient: cat.gradient || formattedCategories[cat.name].gradient,
            stats: cat.stats || formattedCategories[cat.name].stats,
          };
        }
      });
      
      return formattedCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return staticCategories;
    }
  }
  
  static async getCategoryCount(categoryName) {
    try {
      const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('type', categoryName.toLowerCase());
        
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Error fetching count for category ${categoryName}:`, error);
      return 0;
    }
  }
  
  static async getCategoryWithTypes(categoryId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, types(*)')
        .eq('id', categoryId)
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
      return null;
    }
  }
}
