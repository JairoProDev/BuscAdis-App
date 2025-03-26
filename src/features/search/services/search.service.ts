import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Auth } from '@aws-amplify/auth';

async function createDynamoDBClient() {
  const credentials = await Auth.currentCredentials();
  return new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2',
    credentials: Auth.essentialCredentials(credentials),
  });
}

async function createDocClient() {
  const client = await createDynamoDBClient();
  return DynamoDBDocumentClient.from(client);
}

export class SearchService {
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
      const docClient = await createDocClient(); // Obtén el cliente con credenciales de Cognito
      const filterExpression = 'isActive = :isActive';
      const expressionAttributeValues: any = {
        ':isActive': true,
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
        TableName: 'Publications',
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: params.limit || 20,
      });

      const { Items: publications, Count: total } = await docClient.send(command);

      return {
        publications: publications || [],
        total: total || 0,
        pages: Math.ceil((total || 0) / (params.limit || 20)),
      };
    } catch (error) {
      console.error('Error searching publications:', error);
      throw new Error(`Error searching publications: ${error.message}`);
    }
  }

  // Eliminamos los métodos relacionados con Supabase
}