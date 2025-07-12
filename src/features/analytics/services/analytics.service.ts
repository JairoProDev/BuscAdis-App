import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';

export class AnalyticsService {
  private static async getCollection(collectionName: string) {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection(collectionName);
  }

  static async trackSearch(data: {
    userId?: string;
    query: string;
    filters: Record<string, unknown>;
    resultsCount: number;
    sessionId: string;
  }) {
    try {
      const searchAnalytics = await this.getCollection('search_analytics');
      
      await searchAnalytics.insertOne({
        id: uuidv4(),
        userId: data.userId,
        query: data.query,
        filters: data.filters,
        resultsCount: data.resultsCount,
        sessionId: data.sessionId,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  static async getSearchAnalytics() {
    try {
      const searchAnalytics = await this.getCollection('search_analytics');
      
      return await searchAnalytics
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw error;
    }
  }

  static async getPopularSearchTerms(days: number = 7) {
    try {
      const searchAnalytics = await this.getCollection('search_analytics');
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const searches = await searchAnalytics
        .find({ createdAt: { $gte: startDate.toISOString() } })
        .toArray();
      
      if (!searches || searches.length === 0) return [];

      // Group by search term and count
      const searchCounts = searches.reduce((acc: Record<string, number>, search) => {
        const query = search.query.toLowerCase();
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {});

      // Convert to array and sort
      return Object.entries(searchCounts)
        .map(([query, count]) => ({ query, count: count as number }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      throw error;
    }
  }
}
