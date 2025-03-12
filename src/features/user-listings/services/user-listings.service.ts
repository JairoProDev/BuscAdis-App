import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export class UserListingsService {
  static async getUserListings(userId: string) {
    try {
      const command = new QueryCommand({
        TableName: 'Listings',
        IndexName: 'UserListingsIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      const { Items: listings } = await docClient.send(command);
      return listings || [];
    } catch (error) {
      console.error('Error getting user listings:', error);
      throw error;
    }
  }

  static async updateListing(listingId: string, updates: any) {
    try {
      const command = new UpdateCommand({
        TableName: 'Listings',
        Key: { id: listingId },
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
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  static async deleteListing(listingId: string) {
    try {
      const command = new DeleteCommand({
        TableName: 'Listings',
        Key: { id: listingId }
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  }
} 