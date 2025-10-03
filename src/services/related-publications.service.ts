import { PublicationData } from '@/types/publication';
import { getMongoClient } from '@/lib/mongodb-server';

export class RelatedPublicationsService {
  /**
   * Get related publications based on category, location, and keywords
   */
  static async getRelatedPublications(
    currentPublication: PublicationData,
    limit: number = 6
  ): Promise<PublicationData[]> {
    try {
      const client = await getMongoClient();
      const db = client.db(process.env.MONGODB_DB || 'buscadis');
      
      // Build query criteria
      const query: any = {
        _id: { $ne: currentPublication._id }, // Exclude current publication
        status: 'active'
      };

      // Add category filter
      if (currentPublication.categorySlug) {
        query.categorySlug = currentPublication.categorySlug;
      }

      // Add location filter if available
      if (currentPublication.location?.city) {
        query['location.city'] = currentPublication.location.city;
      }

      // Add price range filter (within 50% of current price)
      if (currentPublication.value && currentPublication.value > 0) {
        const minPrice = currentPublication.value * 0.5;
        const maxPrice = currentPublication.value * 1.5;
        query.value = {
          $gte: minPrice,
          $lte: maxPrice
        };
      }

      // Find related publications
      const relatedPublications = await db
        .collection('publications')
        .find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .limit(limit)
        .toArray();

      // If we don't have enough results, expand the search
      if (relatedPublications.length < limit) {
        const expandedQuery = {
          _id: { $ne: currentPublication._id },
          status: 'active',
          categorySlug: currentPublication.categorySlug
        };

        const expandedResults = await db
          .collection('publications')
          .find(expandedQuery)
          .sort({ createdAt: -1 })
          .limit(limit - relatedPublications.length)
          .toArray();

        relatedPublications.push(...expandedResults);
      }

      // If still not enough, get any active publications
      if (relatedPublications.length < limit) {
        const fallbackQuery = {
          _id: { $ne: currentPublication._id },
          status: 'active'
        };

        const fallbackResults = await db
          .collection('publications')
          .find(fallbackQuery)
          .sort({ createdAt: -1 })
          .limit(limit - relatedPublications.length)
          .toArray();

        relatedPublications.push(...fallbackResults);
      }

      // Transform to PublicationData format
      return relatedPublications.map(pub => ({
        id: pub._id.toString(),
        _id: pub._id,
        sequentialId: pub.sequentialId,
        title: pub.title,
        description: pub.description,
        value: pub.value || 0,
        currency: pub.currency || 'PEN',
        categorySlug: pub.categorySlug,
        subcategorySlug: pub.subcategorySlug,
        subSubcategorySlug: pub.subSubcategorySlug,
        location: pub.location,
        images: pub.images || [],
        whatsapp: pub.whatsapp,
        phone: pub.phone,
        email: pub.email,
        attributes: pub.attributes || {},
        createdAt: pub.createdAt,
        updatedAt: pub.updatedAt,
        status: pub.status,
        views: pub.views || 0,
        premium: pub.premium || false,
        verified: pub.verified || false,
        engagement: pub.engagement || {
          views: 0,
          likes: 0,
          shares: 0,
          saves: 0
        }
      }));

    } catch (error) {
      console.error('Error fetching related publications:', error);
      return [];
    }
  }

  /**
   * Get trending publications in the same category
   */
  static async getTrendingInCategory(
    categorySlug: string,
    limit: number = 4
  ): Promise<PublicationData[]> {
    try {
      const client = await getMongoClient();
      const db = client.db(process.env.MONGODB_DB || 'buscadis');
      
      const trendingPublications = await db
        .collection('publications')
        .find({
          categorySlug,
          status: 'active'
        })
        .sort({ 
          'engagement.views': -1,
          'engagement.likes': -1,
          createdAt: -1
        })
        .limit(limit)
        .toArray();

      return trendingPublications.map(pub => ({
        id: pub._id.toString(),
        _id: pub._id,
        sequentialId: pub.sequentialId,
        title: pub.title,
        description: pub.description,
        value: pub.value || 0,
        currency: pub.currency || 'PEN',
        categorySlug: pub.categorySlug,
        subcategorySlug: pub.subcategorySlug,
        subSubcategorySlug: pub.subSubcategorySlug,
        location: pub.location,
        images: pub.images || [],
        whatsapp: pub.whatsapp,
        phone: pub.phone,
        email: pub.email,
        attributes: pub.attributes || {},
        createdAt: pub.createdAt,
        updatedAt: pub.updatedAt,
        status: pub.status,
        views: pub.views || 0,
        premium: pub.premium || false,
        verified: pub.verified || false,
        engagement: pub.engagement || {
          views: 0,
          likes: 0,
          shares: 0,
          saves: 0
        }
      }));

    } catch (error) {
      console.error('Error fetching trending publications:', error);
      return [];
    }
  }

  /**
   * Get recently viewed publications (if user tracking is available)
   */
  static async getRecentlyViewed(
    userId?: string,
    limit: number = 4
  ): Promise<PublicationData[]> {
    // This would require user tracking implementation
    // For now, return empty array
    return [];
  }
}
