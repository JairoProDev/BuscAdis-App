import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ 
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2'
});
const docClient = DynamoDBDocumentClient.from(client);

export class FavoritesService {
  static async addToFavorites(userId: string, classifiedadId: string) {
    try {
      const command = new PutCommand({
        TableName: 'Favorites',
        Item: {
          userId,
          classifiedadId,
          createdAt: new Date().toISOString()
        }
      });

      await docClient.send(command);
      return { userId, classifiedadId };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(userId: string, classifiedadId: string) {
    try {
      const command = new DeleteCommand({
        TableName: 'Favorites',
        Key: {
          userId,
          classifiedadId
        }
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  static async getFavorites(userId: string) {
    try {
      const command = new QueryCommand({
        TableName: 'Favorites',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      const { Items: favorites } = await docClient.send(command);
      
      if (!favorites || favorites.length === 0) return [];

      // Obtener los detalles de los classifiedads
      const classifiedadIds = favorites.map(f => f.classifiedadId);
      
      // Obtener los classifiedads en lotes de 25 (límite de BatchGet)
      const classifiedads = [];
      for (let i = 0; i < classifiedadIds.length; i += 25) {
        const batch = classifiedadIds.slice(i, i + 25);
        const batchCommand = new QueryCommand({
          TableName: 'Classifiedads',
          FilterExpression: 'id IN (:...ids)',
          ExpressionAttributeValues: {
            ':ids': batch
          }
        });
        
        const { Items: batchClassifiedads } = await docClient.send(batchCommand);
        if (batchClassifiedads) {
          classifiedads.push(...batchClassifiedads);
        }
      }

      return favorites.map(fav => ({
        ...fav,
        classifiedad: classifiedads.find(l => l.id === fav.classifiedadId)
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }
}
