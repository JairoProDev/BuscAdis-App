import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export class MessagesService {
  static async getConversations(userId: string) {
    try {
      const command = new QueryCommand({
        TableName: 'Conversations',
        IndexName: 'UserConversationsIndex',
        KeyConditionExpression: 'participantId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      const { Items: conversations } = await docClient.send(command);
      return conversations || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  static async sendMessage(conversationId: string, senderId: string, content: string) {
    try {
      const command = new PutCommand({
        TableName: 'Messages',
        Item: {
          id: uuidv4(),
          conversationId,
          senderId,
          content,
          createdAt: new Date().toISOString()
        }
      });

      await docClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async startConversation(senderId: string, receiverId: string, listingId: string) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          listing_id: listingId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }
}
