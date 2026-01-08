import { pool } from '../config/database.config';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: Date;
}

export interface CreateNotificationInput {
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  async createNotification(data: CreateNotificationInput): Promise<Notification> {
    const query = `
      INSERT INTO notifications (
        id, user_id, notification_type, title, message, data, is_read
      ) VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING *
    `;

    const values = [
      uuidv4(),
      data.user_id,
      data.notification_type,
      data.title,
      data.message,
      data.data ? JSON.stringify(data.data) : null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getUserNotifications(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ notifications: Notification[]; total: number }> {
    const countQuery = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1
    `;

    const dataQuery = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, [userId]),
      pool.query(dataQuery, [userId, limit, offset]),
    ]);

    return {
      notifications: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1 AND is_read = false
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId]);
    return result.rows[0];
  }

  async markAllAsRead(userId: string): Promise<void> {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
    `;

    await pool.query(query, [userId]);
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const query = `
      DELETE FROM notifications
      WHERE id = $1
    `;

    const result = await pool.query(query, [notificationId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async countUnread(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  async cleanOldNotifications(): Promise<number> {
    const query = `
      DELETE FROM notifications
      WHERE is_read = true 
      AND created_at < NOW() - INTERVAL '30 days'
    `;

    const result = await pool.query(query);
    return result.rowCount || 0;
  }
}