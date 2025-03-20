import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Environment variable check for region
if (!process.env.NEXT_PUBLIC_AWS_REGION) {
  throw new Error('NEXT_PUBLIC_AWS_REGION environment variable is not defined.');
}

let client: DynamoDBClient;

async function getDynamoDBClient() {
  if (!client) {
    try {
      // Usar credenciales estáticas en desarrollo local
      if (process.env.NODE_ENV === 'development') {
        if (!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY) {
          throw new Error('AWS credentials are not defined in development.');
        }
        client = new DynamoDBClient({
          region: process.env.NEXT_PUBLIC_AWS_REGION,
          credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
          },
        });
      } else {
        // Preparación para integración con Cognito en producción
        // Aquí iría la lógica para obtener credenciales de Cognito
        // Por ahora, lanzamos un error para recordar la implementación
        throw new Error('Cognito integration is required for production.');
      }
    } catch (error) {
      console.error('Error initializing DynamoDB client:', error);
      throw new Error(`Error initializing DynamoDB client: ${error.message}`);
    }
  }
  return client;
}

const getDocClient = async () => {
  const dynamoDBClient = await getDynamoDBClient();
  return DynamoDBDocumentClient.from(dynamoDBClient);
};

interface SearchClassifiedadsParams {
  query?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface SearchResults {
  classifiedads: any[]; // Replace 'any' with your actual classified ad type
  total: number;
  pages: number;
}

export class SearchService {
  static async searchClassifiedads(params: SearchClassifiedadsParams): Promise<SearchResults> {
    const { query, category, location, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = params;

    try {
      let filterExpression = 'isActive = :isActive';
      const expressionAttributeValues: Record<string, any> = {
        ':isActive': true,
      };

      if (query) {
        filterExpression += ' AND (contains(title, :query) OR contains(description, :query))';
        expressionAttributeValues[':query'] = query;
      }

      if (category) {
        filterExpression += ' AND categoryId = :category';
        expressionAttributeValues[':category'] = category;
      }

      if (location) {
        filterExpression += ' AND location = :location';
        expressionAttributeValues[':location'] = location;
      }

      if (minPrice !== undefined) {
        filterExpression += ' AND price >= :minPrice';
        expressionAttributeValues[':minPrice'] = minPrice;
      }

      if (maxPrice !== undefined) {
        filterExpression += ' AND price <= :maxPrice';
        expressionAttributeValues[':maxPrice'] = maxPrice;
      }

      // Add sorting logic if needed (ScanCommand does not support sorting directly)
      // For sorting, you would need to fetch all items and sort them in memory, or use Global Secondary Indexes with QueryCommand.

      const docClient = await getDocClient();
      const command = new ScanCommand({
        TableName: 'Classifiedads',
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: limit,
      });

      const { Items: data, Count: count } = await docClient.send(command);

      return {
        classifiedads: data || [],
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('Error searching classifiedads:', error);
      throw new Error(`Error searching classifiedads: ${error.message}`);
    }
  }
}