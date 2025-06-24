import clientPromise from '@/lib/mongodb';

export class NotificationsService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db('test');
    return db.collection('notifications');
  }

  static async getNotifications(userId: string) {
    try {
      const notifications = await this.getCollection();
      return await notifications
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const notifications = await this.getCollection();
      
      const result = await notifications.findOneAndUpdate(
        { id: notificationId },
        { $set: { read: true } },
        { returnDocument: 'after' }
      );
      
      return result?.value || null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const notifications = await this.getCollection();
      
      // First get all unread notifications
      const unreadNotifications = await notifications
        .find({ userId, read: { $ne: true } })
        .toArray();
      
      if (unreadNotifications.length === 0) return [];
      
      // Update all unread notifications
      await notifications.updateMany(
        { userId, read: { $ne: true } },
        { $set: { read: true } }
      );
      
      return unreadNotifications;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}
