import clientPromise from '@/lib/mongodb';

export class SearchService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection('publications_inmuebles');
  }

  static async searchPublications(params: {
    query?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const publications = await this.getCollection();
      
      // Build filter object
      const filter: Record<string, any> = { 
        // Default filter for active publications
        status: "active"
      };
      
      if (params.query) {
        filter.$or = [
          { title: { $regex: params.query, $options: 'i' } },
          { description: { $regex: params.query, $options: 'i' } }
        ];
      }
      
      if (params.category) {
        filter.categorySlug = params.category;
      }
      
      if (params.location) {
        if (!filter.$or) filter.$or = [];
        filter.$or.push(
          { location: { $regex: params.location, $options: 'i' } }
        );
      }
      
      if (params.minPrice) {
        filter.price = filter.price || {};
        filter.price.$gte = Number(params.minPrice);
      }
      
      if (params.maxPrice) {
        filter.price = filter.price || {};
        filter.price.$lte = Number(params.maxPrice);
      }
      
      // Count total matching documents
      const total = await publications.countDocuments(filter);
      
      // Get paginated results
      const limit = params.limit || 20;
      const skip = ((params.page || 1) - 1) * limit;
      
      const items = await publications
        .find(filter)
        .sort({ createdAt: -1 }) // Default newest first
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return {
        publications: items || [],
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
      };
    } catch (error) {
      console.error('Error searching publications:', error);
      throw new Error(`Error searching publications: ${error.message}`);
    }
  }
}