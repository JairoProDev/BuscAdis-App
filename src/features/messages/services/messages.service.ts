import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';

export class MessagesService {
  private static async getCollection(collectionName: string) {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection(collectionName);
  }

  static async getConversations(userId: string) {
    try {
      const conversations = await this.getCollection('conversations');
      
      return await conversations
        .find({ participantId: userId })
        .toArray();
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  static async sendMessage(conversationId: string, senderId: string, content: string) {
    try {
      const messages = await this.getCollection('messages');
      
      const messageData = {
        id: uuidv4(),
        conversationId,
        senderId,
        content,
        createdAt: new Date().toISOString()
      };
      
      await messages.insertOne(messageData);
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async startConversation(senderId: string, receiverId: string, publicationId: string) {
    try {
      const conversations = await this.getCollection('conversations');
      
      const conversationData = {
        id: uuidv4(),
        senderId,
        receiverId,
        publicationId,
        createdAt: new Date().toISOString()
      };
      
      const result = await conversations.insertOne(conversationData);
      
      if (!result.acknowledged) {
        throw new Error('Failed to start conversation');
      }
      
      return conversationData;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }
}
