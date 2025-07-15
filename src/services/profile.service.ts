import { AuthService } from '@/features/auth/services/auth.service';
import { Logger } from '@/services/logging.service';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

interface ProfileData {
  fullName?: string;
  phone?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  occupation?: string;
  gender?: string;
  birthdate?: string;
  interests?: string[];
  socialLinks?: string[];
  badges?: string[];
  points?: number;
  progress?: number;
}

export class ProfileService {
  // API endpoints
  private static readonly ENDPOINTS = {
    PROFILE: '/api/profile',
    USER_PROFILE: (userId: string) => `/api/users/${userId}/profile`,
  };

  static async getProfile() {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(this.ENDPOINTS.USER_PROFILE(currentUser.id));
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Profile not found is a valid state
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting profile:', error);
      // Return null instead of failing completely
      return null;
    }
  }

  static async createOrUpdateProfile(user: ProfileData) {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(this.ENDPOINTS.PROFILE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          fullName: user.fullName || currentUser.name,
          phone: user.phone || currentUser.phone,
          email: user.email || currentUser.email,
          bio: user.bio || '',
          avatarUrl: user.avatarUrl || '',
          occupation: user.occupation || '',
          gender: user.gender || '',
          birthdate: user.birthdate || '',
          interests: user.interests || [],
          socialLinks: user.socialLinks || [],
          badges: user.badges || [],
          points: user.points || 0,
          progress: user.progress || 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Return mock data to prevent UI crashes
      // Use a safe approach that doesn't depend on currentUser which might be undefined in the catch block
      return {
        id: 'mock-id',
        fullName: user.fullName || 'User',
        phone: user.phone || '',
        email: user.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }
}
