import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export class SuggestionsService {
  static async getSuggestions(query: string) {
    try {
      // Buscar en términos populares
      const popularCommand = new QueryCommand({
        TableName: 'SearchAnalytics',
        KeyConditionExpression: 'begins_with(query, :query)',
        ExpressionAttributeValues: {
          ':query': query.toLowerCase()
        },
        Limit: 5
      });

      const { Items: popularTerms } = await docClient.send(popularCommand);

      // Buscar en categorías
      const categoriesCommand = new QueryCommand({
        TableName: 'Categories',
        KeyConditionExpression: 'begins_with(name, :query)',
        ExpressionAttributeValues: {
          ':query': query.toLowerCase()
        },
        Limit: 3
      });

      const { Items: categories } = await docClient.send(categoriesCommand);

      // Buscar en ubicaciones
      const locationsCommand = new QueryCommand({
        TableName: 'Locations',
        IndexName: 'NameIndex',
        KeyConditionExpression: 'begins_with(name, :query)',
        ExpressionAttributeValues: {
          ':query': query.toLowerCase()
        },
        Limit: 3
      });

      const { Items: locations } = await docClient.send(locationsCommand);

      return {
        popularTerms: popularTerms || [],
        categories: categories || [],
        locations: locations || []
      };
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }
}
