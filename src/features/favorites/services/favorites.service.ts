import { supabase } from '@/lib/supabase';

export class FavoritesService {
  static async addToFavorites(userId: string, listingId: string) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          listing_id: listingId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(userId: string, listingId: string) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, listing_id: listingId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  static async getFavorites(userId: string) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          listing:listings(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }
}
