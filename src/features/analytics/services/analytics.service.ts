import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ 
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

export class AnalyticsService {
  static async trackSearch(data: {
    userId?: string;
    query: string;
    filters: any;
    resultsCount: number;
    sessionId: string;
  }) {
    try {
      const command = new PutCommand({
        TableName: 'SearchAnalytics',
        Item: {
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
        }
      });

      await docClient.send(command);
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
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const command = new QueryCommand({
        TableName: 'SearchAnalytics',
        IndexName: 'QueryIndex',
        KeyConditionExpression: 'createdAt >= :startDate',
        ExpressionAttributeValues: {
          ':startDate': startDate.toISOString()
        },
        Select: 'ALL_PROJECTED_ATTRIBUTES'
      });

      const { Items: searches } = await docClient.send(command);
      
      if (!searches) return [];

      // Agrupar por término de búsqueda y contar
      const searchCounts = searches.reduce((acc, search) => {
        const query = search.query.toLowerCase();
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {});

      // Convertir a array y ordenar
      return Object.entries(searchCounts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      throw error;
    }
  }
}
