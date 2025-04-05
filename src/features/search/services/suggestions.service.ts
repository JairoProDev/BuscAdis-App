import clientPromise from '@/lib/mongodb';

export class SuggestionsService {
  private static async getCollection(collectionName: string) {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection(collectionName);
  }

  static async getSuggestions(query: string) {
    try {
      // Prepare regex for case-insensitive search
      const queryRegex = new RegExp(`^${query}`, 'i');
      
      // Get collections
      const searchAnalytics = await this.getCollection('search_analytics');
      const categories = await this.getCollection('categories');
      const locations = await this.getCollection('locations');
      
      // Fetch popular terms
      const popularTerms = await searchAnalytics
        .find({ query: { $regex: queryRegex } })
        .limit(5)
        .toArray();
      
      // Fetch categories
      const categoryResults = await categories
        .find({ name: { $regex: queryRegex } })
        .limit(3)
        .toArray();
      
      // Fetch locations
      const locationResults = await locations
        .find({ name: { $regex: queryRegex } })
        .limit(3)
        .toArray();

      return {
        popularTerms: popularTerms || [],
        categories: categoryResults || [],
        locations: locationResults || []
      };
    } catch (error) {
      console.error('Error getting suggestions:', error);
      // Return empty results on error instead of throwing
      return {
        popularTerms: [],
        categories: [],
        locations: []
      };
    }
  }
}
