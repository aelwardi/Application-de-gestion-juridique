import request from 'supertest';
import express, { Express } from 'express';
import { pool } from '../../src/config/database.config';

jest.mock('../../src/config/database.config');
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', role: 'client' };
    next();
  },
}));

describe('Notification Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const notificationRoutes = require('../../src/routes/notification.routes').default;
    app.use('/api/notifications', notificationRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should get all notifications for authenticated user', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          message: 'You have an appointment tomorrow',
          data: null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'New Message',
          message: 'You have a new message',
          data: { messageId: 'msg-123' },
          is_read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockNotifications });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('category');
      expect(response.body.data[0]).toHaveProperty('time');
    });

    it('should format notification times correctly', async () => {
      const now = new Date();
      const mockNotifications = [
        {
          id: 'notif-recent',
          type: 'message_received',
          title: 'Recent',
          message: 'Recent notification',
          data: null,
          is_read: false,
          created_at: new Date(now.getTime() - 30000).toISOString(), // 30 seconds ago
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockNotifications });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].time).toMatch(/l'instant|min/);
    });

    it('should categorize notifications correctly', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          message: 'Test',
          data: null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockNotifications });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.data[0].category).toBe('Rendez-vous');
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer mock-token')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notif-123',
        is_read: true,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockNotification] });

      const response = await request(app)
        .patch('/api/notifications/notif-123/read')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should handle errors when marking as read', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .patch('/api/notifications/notif-123/read')
        .set('Authorization', 'Bearer mock-token')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 5 });

      const response = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('marked as read');
    });

    it('should handle errors when marking all as read', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', 'Bearer mock-token')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification successfully', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/notifications/notif-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 if notification not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const response = await request(app)
        .delete('/api/notifications/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notifications/unread/count', () => {
    it('should get unread notification count', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ count: '3' }],
      });

      const response = await request(app)
        .get('/api/notifications/unread/count')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
    });

    it('should return 0 if no unread notifications', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ count: '0' }],
      });

      const response = await request(app)
        .get('/api/notifications/unread/count')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.count).toBe(0);
    });
  });
});

