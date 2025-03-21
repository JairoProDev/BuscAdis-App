import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

export class UserPublicationsService {
  static async getUserPublications(userId: string) {
    try {
      const command = new QueryCommand({
        TableName: 'Publications',
        IndexName: 'UserPublicationsIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      const { Items: publications } = await docClient.send(command);
      return publications || [];
    } catch (error) {
      console.error('Error getting user publications:', error);
      throw error;
    }
  }

  static async updatePublication(publicationId: string, updates: any) {
    try {
      const command = new UpdateCommand({
        TableName: 'Publications',
        Key: { id: publicationId },
        UpdateExpression: 'set title = :title, description = :description, price = :price, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':title': updates.title,
          ':description': updates.description,
          ':price': updates.price,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      });

      const { Attributes } = await docClient.send(command);
      return Attributes;
    } catch (error) {
      console.error('Error updating publication:', error);
      throw error;
    }
  }

  static async deletePublication(publicationId: string) {
    try {
      const command = new DeleteCommand({
        TableName: 'Publications',
        Key: { id: publicationId }
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting publication:', error);
      throw error;
    }
  }
} 