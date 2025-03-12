import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export class NotificationsService {
  static async getNotifications(userId: string) {
    try {
      const command = new QueryCommand({
        TableName: 'Notifications',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      });

      const { Items: data } = await docClient.send(command);
      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const command = new UpdateCommand({
        TableName: 'Notifications',
        Key: { id: notificationId },
        UpdateExpression: 'SET #read = :read',
        ExpressionAttributeNames: {
          '#read': 'read'
        },
        ExpressionAttributeValues: {
          ':read': true
        },
        ReturnValues: 'ALL_NEW'
      });

      const { Attributes } = await docClient.send(command);
      return Attributes;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const notifications = await this.getNotifications(userId);
      const unreadNotifications = notifications.filter(n => !n.read);

      if (unreadNotifications.length === 0) return [];

      const updateRequests = unreadNotifications.map(notification => ({
        PutRequest: {
          Item: {
            ...notification,
            read: true
          }
        }
      }));

      const command = new BatchWriteCommand({
        RequestItems: {
          Notifications: updateRequests
        }
      });

      await docClient.send(command);
      return unreadNotifications;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}
