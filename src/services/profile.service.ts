import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { AuthService } from '@/features/auth/services/auth.service';

export class ProfileService {
  private static client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION });
  private static docClient = DynamoDBDocumentClient.from(this.client);

  static async getProfile() {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const command = new GetCommand({
        TableName: 'Profiles',
        Key: { id: currentUser.id }
      });

      const response = await this.docClient.send(command);
      return response.Item;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  static async createOrUpdateProfile(userData) {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar si el perfil ya existe
      const existingProfile = await this.getProfile();
      
      if (existingProfile) {
        // Actualizar perfil existente
        const command = new UpdateCommand({
          TableName: 'Profiles',
          Key: { id: currentUser.id },
          UpdateExpression: 'SET fullName = :fullName, phone = :phone, email = :email, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':fullName': userData.fullName || currentUser.name,
            ':phone': userData.phone || currentUser.phone,
            ':email': userData.email || currentUser.email,
            ':updatedAt': new Date().toISOString()
          },
          ReturnValues: 'ALL_NEW'
        });
        
        const response = await this.docClient.send(command);
        return response.Attributes;
      } else {
        // Crear nuevo perfil
        const command = new PutCommand({
          TableName: 'Profiles',
          Item: {
            id: currentUser.id,
            fullName: userData.fullName || currentUser.name,
            phone: userData.phone || currentUser.phone,
            email: userData.email || currentUser.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        });
        
        await this.docClient.send(command);
        return {
          id: currentUser.id,
          fullName: userData.fullName || currentUser.name,
          phone: userData.phone || currentUser.phone,
          email: userData.email || currentUser.email
        };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}
