import { supabase } from '@/lib/supabase';

export class ReportsService {
  static async createReport(data: {
    userId: string;
    listingId: string;
    reason: string;
    description: string;
  }) {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          user_id: data.userId,
          listing_id: data.listingId,
          reason: data.reason,
          description: data.description,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return report;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }
}
