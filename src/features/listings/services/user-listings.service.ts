import { supabase } from '@/lib/supabase';

export class UserListingsService {
  static async getUserListings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user listings:', error);
      throw error;
    }
  }

  static async updateListing(listingId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', listingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  static async deleteListing(listingId: string) {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  }

  static async toggleListingStatus(listingId: string, isActive: boolean) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({ is_active: isActive })
        .eq('id', listingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling listing status:', error);
      throw error;
    }
  }
}
