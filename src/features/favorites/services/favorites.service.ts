import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ 
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2'
});
const docClient = DynamoDBDocumentClient.from(client);

export class FavoritesService {
  static async addToFavorites(userId: string, publicationId: string) {
    try {
      const command = new PutCommand({
        TableName: 'Favorites',
        Item: {
          userId,
          publicationId,
          createdAt: new Date().toISOString()
        }
      });

      await docClient.send(command);
      return { userId, publicationId };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(userId: string, publicationId: string) {
    try {
      const command = new DeleteCommand({
        TableName: 'Favorites',
        Key: {
          userId,
          publicationId
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

      // Obtener los detalles de los publications
      const publicationIds = favorites.map(f => f.publicationId);
      
      // Obtener los publications en lotes de 25 (límite de BatchGet)
      const publications = [];
      for (let i = 0; i < publicationIds.length; i += 25) {
        const batch = publicationIds.slice(i, i + 25);
        const batchCommand = new QueryCommand({
          TableName: 'Publications',
          FilterExpression: 'id IN (:...ids)',
          ExpressionAttributeValues: {
            ':ids': batch
          }
        });
        
        const { Items: batchPublications } = await docClient.send(batchCommand);
        if (batchPublications) {
          publications.push(...batchPublications);
        }
      }

      return favorites.map(fav => ({
        ...fav,
        publication: publications.find(l => l.id === fav.publicationId)
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }
}
