import { supabase } from '@/lib/supabase';

export class AnalyticsService {
  static async trackSearch(data: {
    userId?: string;
    query: string;
    filters: any;
    resultsCount: number;
    sessionId: string;
  }) {
    try {
      const { error } = await supabase
        .from('search_analytics')
        .insert({
          user_id: data.userId,
          query: data.query,
          filters: data.filters,
          results_count: data.resultsCount,
          session_id: data.sessionId,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  static async getSearchAnalytics() {
    try {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw error;
    }
  }

  static async getPopularSearchTerms(days: number = 7) {
    try {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('query, count(*)')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .group('query')
        .order('count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      throw error;
    }
  }
}
