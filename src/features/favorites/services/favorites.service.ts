import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ 
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

export class FavoritesService {
  static async addToFavorites(userId: string, listingId: string) {
    try {
      const command = new PutCommand({
        TableName: 'Favorites',
        Item: {
          userId,
          listingId,
          createdAt: new Date().toISOString()
        }
      });

      await docClient.send(command);
      return { userId, listingId };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(userId: string, listingId: string) {
    try {
      const command = new DeleteCommand({
        TableName: 'Favorites',
        Key: {
          userId,
          listingId
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

      // Obtener los detalles de los listings
      const listingIds = favorites.map(f => f.listingId);
      
      // Obtener los listings en lotes de 25 (límite de BatchGet)
      const listings = [];
      for (let i = 0; i < listingIds.length; i += 25) {
        const batch = listingIds.slice(i, i + 25);
        const batchCommand = new QueryCommand({
          TableName: 'Listings',
          FilterExpression: 'id IN (:...ids)',
          ExpressionAttributeValues: {
            ':ids': batch
          }
        });
        
        const { Items: batchListings } = await docClient.send(batchCommand);
        if (batchListings) {
          listings.push(...batchListings);
        }
      }

      return favorites.map(fav => ({
        ...fav,
        listing: listings.find(l => l.id === fav.listingId)
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }
}
