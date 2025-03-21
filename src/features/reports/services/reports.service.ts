import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export class ReportsService {
  static async createReport(data: {
    userId: string;
    publicationId: string;
    reason: string;
    description: string;
  }) {
    try {
      const command = new PutCommand({
        TableName: 'Reports',
        Item: {
          id: uuidv4(),
          userId: data.userId,
          publicationId: data.publicationId,
          reason: data.reason,
          description: data.description,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      });

      await docClient.send(command);
      return command.input.Item;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }
}
