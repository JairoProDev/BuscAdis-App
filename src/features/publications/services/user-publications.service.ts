// MongoDB implementation to replace Supabase
import { mongoDbQuery, mongoDbUpdate } from '@/lib/mongodb-server';

export class UserPublicationsService {
  static async getUserPublications(userId: string) {
    try {
      const data = await mongoDbQuery(
        'publications',
        { userId },
        { sort: { createdAt: -1 } }
      );
      return data;
    } catch (error) {
      console.error('Error getting user publications:', error);
      throw error;
    }
  }

  static async updatePublication(publicationId: string, updates: any) {
    try {
      const data = await mongoDbUpdate(
        'publications',
        { _id: publicationId },
        { $set: updates }
      );
      return data;
    } catch (error) {
      console.error('Error updating publication:', error);
      throw error;
    }
  }

  static async deletePublication(publicationId: string) {
    try {
      await mongoDbUpdate(
        'publications',
        { _id: publicationId },
        { $set: { status: 'deleted' } }
      );
    } catch (error) {
      console.error('Error deleting publication:', error);
      throw error;
    }
  }

  static async togglePublicationStatus(publicationId: string, isActive: boolean) {
    try {
      const data = await mongoDbUpdate(
        'publications',
        { _id: publicationId },
        { $set: { isActive } }
      );
      return data;
    } catch (error) {
      console.error('Error toggling publication status:', error);
      throw error;
    }
  }
}
