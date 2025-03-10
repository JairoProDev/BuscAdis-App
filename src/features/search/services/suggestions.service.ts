import { supabase } from '@/lib/supabase';

export class SuggestionsService {
  static async getSuggestions(query: string) {
    try {
      // Buscar en términos populares
      const { data: popularTerms, error: popularError } = await supabase
        .from('search_analytics')
        .select('query, count(*)')
        .ilike('query', `%${query}%`)
        .group('query')
        .order('count', { ascending: false })
        .limit(5);

      if (popularError) throw popularError;

      // Buscar en categorías
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(3);

      if (categoriesError) throw categoriesError;

      // Buscar en ubicaciones
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(3);

      if (locationsError) throw locationsError;

      return {
        popularTerms: popularTerms || [],
        categories: categories || [],
        locations: locations || []
      };
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }
}
