import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';

export class ReportsService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection('reports');
  }

  static async createReport(data: {
    userId: string;
    publicationId: string;
    reason: string;
    description: string;
  }) {
    try {
      const reports = await this.getCollection();
      
      const report = {
        id: uuidv4(),
        userId: data.userId,
        publicationId: data.publicationId,
        reason: data.reason,
        description: data.description,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await reports.insertOne(report);
      return report;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }
}
