import clientPromise from '@/lib/mongodb';

export class StatsService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection('category_stats');
  }

  static async getCategoryCounts() {
    try {
      const categoryStats = await this.getCollection();
      
      const data = await categoryStats
        .find({ type: 'CATEGORY_COUNT' })
        .toArray();
      
      return data || [];
    } catch (error) {
      console.error('Error fetching category counts:', error);
      return [];
    }
  }
}
