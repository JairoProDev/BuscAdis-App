import { supabase } from '@/lib/supabase';

export class MessagesService {
  static async getConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(*),
          messages:messages(*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  static async sendMessage(conversationId: string, senderId: string, content: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async startConversation(senderId: string, receiverId: string, listingId: string) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          listing_id: listingId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }
}
