import { supabase } from '@/lib/supabase';

export class UserPublicationsService {
  static async getUserPublications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user publications:', error);
      throw error;
    }
  }

  static async updatePublication(publicationId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('publications')
        .update(updates)
        .eq('id', publicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating publication:', error);
      throw error;
    }
  }

  static async deletePublication(publicationId: string) {
    try {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', publicationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting publication:', error);
      throw error;
    }
  }

  static async togglePublicationStatus(publicationId: string, isActive: boolean) {
    try {
      const { data, error } = await supabase
        .from('publications')
        .update({ is_active: isActive })
        .eq('id', publicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling publication status:', error);
      throw error;
    }
  }
}
