import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

export class UserClassifiedadsService {
  static async getUserClassifiedads(userId: string) {
    try {
      const command = new QueryCommand({
        TableName: 'Classifiedads',
        IndexName: 'UserClassifiedadsIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      const { Items: classifiedads } = await docClient.send(command);
      return classifiedads || [];
    } catch (error) {
      console.error('Error getting user classifiedads:', error);
      throw error;
    }
  }

  static async updateClassifiedad(classifiedadId: string, updates: any) {
    try {
      const command = new UpdateCommand({
        TableName: 'Classifiedads',
        Key: { id: classifiedadId },
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
      console.error('Error updating classifiedad:', error);
      throw error;
    }
  }

  static async deleteClassifiedad(classifiedadId: string) {
    try {
      const command = new DeleteCommand({
        TableName: 'Classifiedads',
        Key: { id: classifiedadId }
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting classifiedad:', error);
      throw error;
    }
  }
} 