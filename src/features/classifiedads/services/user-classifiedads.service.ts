import { supabase } from '@/lib/supabase';

export class UserClassifiedadsService {
  static async getUserClassifiedads(userId: string) {
    try {
      const { data, error } = await supabase
        .from('classifiedads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user classifiedads:', error);
      throw error;
    }
  }

  static async updateClassifiedad(classifiedadId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('classifiedads')
        .update(updates)
        .eq('id', classifiedadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating classifiedad:', error);
      throw error;
    }
  }

  static async deleteClassifiedad(classifiedadId: string) {
    try {
      const { error } = await supabase
        .from('classifiedads')
        .delete()
        .eq('id', classifiedadId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting classifiedad:', error);
      throw error;
    }
  }

  static async toggleClassifiedadStatus(classifiedadId: string, isActive: boolean) {
    try {
      const { data, error } = await supabase
        .from('classifiedads')
        .update({ is_active: isActive })
        .eq('id', classifiedadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling classifiedad status:', error);
      throw error;
    }
  }
}
