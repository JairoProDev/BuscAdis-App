import { supabase } from '@/supabaseClient';

export class StatsService {
  static async getCategoryCounts() {
    try {
      // Primera opción: si tienes una tabla de estadísticas
      const { data, error } = await supabase
        .from('category_stats')
        .select('*');
        
      if (error) throw error;
      return data || [];
      
      // Segunda opción: contar directamente (menos eficiente)
      /*
      const { data, error } = await supabase
        .from('listings')
        .select('type, count')
        .eq('is_active', true)
        .group('type');
        
      if (error) throw error;
      return data || [];
      */
    } catch (error) {
      console.error('Error fetching category counts:', error);
      return [];
    }
  }
}
