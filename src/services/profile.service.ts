import { AuthService } from '@/features/auth/services/auth.service';
import getMongoClient from '@/lib/mongodb';

export class ProfileService {
  private static async getCollection() {
    const client = await getMongoClient();
    const db = client.db('test');
    return db.collection('profiles');
  }

  static async getProfile() {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const profiles = await this.getCollection();
      return await profiles.findOne({ id: currentUser.id });
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

      const profiles = await this.getCollection();
      
      // Verificar si el perfil ya existe
      const existingProfile = await this.getProfile();
      
      if (existingProfile) {
        // Actualizar perfil existente
        const updateData = {
          fullName: userData.fullName || currentUser.name,
          phone: userData.phone || currentUser.phone,
          email: userData.email || currentUser.email,
          updatedAt: new Date().toISOString()
        };
        
        await profiles.updateOne(
          { id: currentUser.id },
          { $set: updateData }
        );
        
        return { ...existingProfile, ...updateData };
      } else {
        // Crear nuevo perfil
        const newProfile = {
          id: currentUser.id,
          fullName: userData.fullName || currentUser.name,
          phone: userData.phone || currentUser.phone,
          email: userData.email || currentUser.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await profiles.insertOne(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}
