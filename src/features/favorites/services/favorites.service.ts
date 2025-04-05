import clientPromise from '@/lib/mongodb';

export class FavoritesService {
  private static async getCollection(collectionName: string) {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection(collectionName);
  }

  static async addToFavorites(userId: string, publicationId: string) {
    try {
      const favorites = await this.getCollection('favorites');
      
      await favorites.insertOne({
        userId,
        publicationId,
        createdAt: new Date().toISOString()
      });
      
      return { userId, publicationId };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(userId: string, publicationId: string) {
    try {
      const favorites = await this.getCollection('favorites');
      
      const result = await favorites.deleteOne({ 
        userId, 
        publicationId 
      });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  static async getFavorites(userId: string) {
    try {
      const favorites = await this.getCollection('favorites');
      
      const userFavorites = await favorites
        .find({ userId })
        .toArray();
      
      if (!userFavorites || userFavorites.length === 0) return [];

      // Get the publication details by searching across all publication collections
      const client = await clientPromise;
      const db = client.db('test');
      const publicationIds = userFavorites.map(f => f.publicationId);
      
      // Try to find publications across all collection types
      const publications = [];
      
      // Search in each collection type
      const collectionNames = [
        'publications_inmuebles', 
        'publications_empleos', 
        'publications_servicios', 
        'publications_vehiculos'
      ];
      
      for (const collectionName of collectionNames) {
        const collection = db.collection(collectionName);
        const found = await collection
          .find({ id: { $in: publicationIds } })
          .toArray();
        
        if (found.length > 0) {
          publications.push(...found);
        }
      }

      // Map favorites with their publication details
      return userFavorites.map(fav => ({
        ...fav,
        publication: publications.find(p => p.id === fav.publicationId)
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }
}
