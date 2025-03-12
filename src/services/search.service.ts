import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export class SearchService {
  static async searchListings({
    query,
    category,
    location,
    minPrice,
    maxPrice,
    sortBy,
    page = 1,
    limit = 20
  }) {
    try {
      let filterExpression = 'isActive = :isActive';
      let expressionAttributeValues = {
        ':isActive': true
      };

      if (query) {
        filterExpression += ' AND (contains(title, :query) OR contains(description, :query))';
        expressionAttributeValues[':query'] = query;
      }

      if (category) {
        filterExpression += ' AND categoryId = :category';
        expressionAttributeValues[':category'] = category;
      }

      // ... más filtros ...

      const command = new ScanCommand({
        TableName: 'Listings',
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: limit
      });

      const { Items: data, Count: count } = await docClient.send(command);

      return {
        listings: data || [],
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error searching listings:', error);
      throw error;
    }
  }
} 