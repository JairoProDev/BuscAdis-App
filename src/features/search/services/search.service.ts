import { supabase } from '@/lib/supabase';

export class SearchService {
  static async searchListings({
    query,
    category,
    location,
    minPrice,
    maxPrice,
    sortBy,
    page = 1,
    limit = 20
  }: {
    query?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      let queryBuilder = supabase
        .from('listings')
        .select('*, user:profiles(*)', { count: 'exact' })
        .eq('is_active', true);

      // Aplicar filtros
      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      if (category) {
        queryBuilder = queryBuilder.eq('category_id', category);
      }

      if (location) {
        queryBuilder = queryBuilder.eq('location', location);
      }

      if (minPrice) {
        queryBuilder = queryBuilder.gte('price', minPrice);
      }

      if (maxPrice) {
        queryBuilder = queryBuilder.lte('price', maxPrice);
      }

      // Aplicar ordenamiento
      switch (sortBy) {
        case 'price_asc':
          queryBuilder = queryBuilder.order('price', { ascending: true });
          break;
        case 'price_desc':
          queryBuilder = queryBuilder.order('price', { ascending: false });
          break;
        case 'date_desc':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      // Aplicar paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      return {
        listings: data,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error searching listings:', error);
      throw error;
    }
  }

  static async getPopularSearches() {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('query, count')
        .order('count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting popular searches:', error);
      throw error;
    }
  }

  static async saveSearchQuery(query: string, userId?: string) {
    try {
      const { error } = await supabase
        .from('search_history')
        .upsert({
          query,
          user_id: userId,
          count: 1
        }, {
          onConflict: 'query',
          count: 'count + 1'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  }
}
