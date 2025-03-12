import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export class StatsService {
  static async getCategoryCounts() {
    try {
      const command = new QueryCommand({
        TableName: 'CategoryStats',
        IndexName: 'StatsIndex',
        KeyConditionExpression: 'type = :type',
        ExpressionAttributeValues: {
          ':type': 'CATEGORY_COUNT'
        }
      });

      const { Items: data } = await docClient.send(command);
      return data || [];
    } catch (error) {
      console.error('Error fetching category counts:', error);
      return [];
    }
  }
}
