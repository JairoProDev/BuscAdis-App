import clientPromise from '@/lib/mongodb';

export class UserPublicationsService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection('publications_inmuebles');
  }

  static async getUserPublications(userId: string) {
    try {
      const publications = await this.getCollection();
      return await publications.find({ userId }).toArray();
    } catch (error) {
      console.error('Error getting user publications:', error);
      throw error;
    }
  }

  static async updatePublication(publicationId: string, updates: any) {
    try {
      const publications = await this.getCollection();
      const updateData = {
        title: updates.title,
        description: updates.description,
        price: updates.price,
        updatedAt: new Date().toISOString()
      };

      const result = await publications.updateOne(
        { id: publicationId },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        throw new Error('No se pudo actualizar la publicación');
      }

      return await publications.findOne({ id: publicationId });
    } catch (error) {
      console.error('Error updating publication:', error);
      throw error;
    }
  }

  static async deletePublication(publicationId: string) {
    try {
      const publications = await this.getCollection();
      const result = await publications.deleteOne({ id: publicationId });
      
      if (result.deletedCount === 0) {
        throw new Error('No se pudo eliminar la publicación');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting publication:', error);
      throw error;
    }
  }
} 