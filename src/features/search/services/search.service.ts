import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

export class SearchService {
  static async searchClassifiedads(params: {
    query?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      let filterExpression = 'isActive = :isActive';
      let expressionAttributeValues: any = {
        ':isActive': true
      };

      if (params.query) {
        filterExpression += ' AND (contains(title, :query) OR contains(description, :query))';
        expressionAttributeValues[':query'] = params.query.toLowerCase();
      }

      if (params.category) {
        filterExpression += ' AND category = :category';
        expressionAttributeValues[':category'] = params.category;
      }

      if (params.location) {
        filterExpression += ' AND contains(location, :location)';
        expressionAttributeValues[':location'] = params.location;
      }

      if (params.minPrice) {
        filterExpression += ' AND price >= :minPrice';
        expressionAttributeValues[':minPrice'] = params.minPrice;
      }

      if (params.maxPrice) {
        filterExpression += ' AND price <= :maxPrice';
        expressionAttributeValues[':maxPrice'] = params.maxPrice;
      }

      const command = new ScanCommand({
        TableName: 'Classifiedads',
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: params.limit || 20
      });

      const { Items: classifiedads, Count: total } = await docClient.send(command);
      
      return {
        classifiedads: classifiedads || [],
        total: total || 0,
        pages: Math.ceil((total || 0) / (params.limit || 20))
      };
    } catch (error) {
      console.error('Error searching classifiedads:', error);
      throw new Error(`Error searching classifiedads: ${error.message}`);
      throw error;
    }
  }

  static async getPopularSearches() {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('query, count')
        .order('count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting popular searches:', error);
      throw error;
    }
  }

  static async saveSearchQuery(query: string, userId?: string) {
    try {
      const { error } = await supabase
        .from('search_history')
        .upsert({
          query,
          user_id: userId,
          count: 1
        }, {
          onConflict: 'query',
          count: 'count + 1'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  }
}
