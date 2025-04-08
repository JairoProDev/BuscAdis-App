import { AuthService } from '@/features/auth/services/auth.service';
import getMongoClient from '@/lib/mongodb';
import { Logger } from '@/services/logging.service';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

interface ProfileData {
  fullName?: string;
  phone?: string;
  email?: string;
}

export class ProfileService {
  private static async getCollection() {
    try {
      const client = await getMongoClient();
      const db = client.db('test');
      return db.collection('profiles');
    } catch (error) {
      Logger.error('Error getting profiles collection', { error });
      if (isBrowser) {
        // Return a mock collection for client-side
        return {
          findOne: async () => null,
          insertOne: async () => ({ acknowledged: true }),
          updateOne: async () => ({ modifiedCount: 1 })
        };
      } else {
        throw error;
      }
    }
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
      Logger.error('Error getting profile:', { error });
      // Return null instead of failing completely on client-side
      if (isBrowser) return null;
      throw error;
    }
  }

  static async createOrUpdateProfile(userData: ProfileData) {
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
        
        Logger.info('Profile updated successfully', { userId: currentUser.id });
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
        Logger.info('New profile created', { userId: currentUser.id });
        return newProfile;
      }
    } catch (error) {
      Logger.error('Error updating profile:', { error });
      if (isBrowser) {
        // Return a mock profile on client side to prevent UI crashes
        return {
          id: 'mock-id',
          fullName: userData.fullName || 'User',
          phone: userData.phone || '',
          email: userData.email || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      throw error;
    }
  }
}
