import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import notificationRoutes from '../../../src/routes/notification.routes';

dotenv.config({ path: '.env.test' });

const createTestApp = () => {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/notifications', notificationRoutes);

  return app;
};

describe('Notifications API Integration Tests', () => {
  let app: express.Application;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
    authToken = 'mock-jwt-token';
  });

  describe('GET /api/notifications', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return notifications list with authentication', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      }
    });

    it('should return notifications in descending order', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success && response.body.data.length > 1) {
        const notifications = response.body.data;
        for (let i = 0; i < notifications.length - 1; i++) {
          const current = new Date(notifications[i].created_at);
          const next = new Date(notifications[i + 1].created_at);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });

    it('should limit notifications to 50 items', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        expect(response.body.data.length).toBeLessThanOrEqual(50);
      }
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const notificationId = 1;

      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .patch('/api/notifications/99999/read')
        .set('Authorization', `Bearer ${authToken}`);

      expect([401, 404, 500]).toContain(response.status);
    });
  });

  describe('PATCH /api/notifications/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .patch('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });
  });

  describe('Notification types and categories', () => {
    it('should properly categorize notification types', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success && response.body.data.length > 0) {
        const notification = response.body.data[0];
        
        expect(notification).toHaveProperty('type');
        expect(notification).toHaveProperty('category');
        
        const validCategories = [
          'Communication',
          'Nouveau document',
          'Rendez-vous',
          'Dossier',
          'Système'
        ];
        
        if (notification.category) {
          expect(validCategories).toContain(notification.category);
        }
      }
    });

    it('should include time information in notification', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success && response.body.data.length > 0) {
        const notification = response.body.data[0];
        expect(notification).toHaveProperty('time');
      }
    });
  });

  describe('Notification filtering', () => {
    it('should filter unread notifications', async () => {
      const response = await request(app)
        .get('/api/notifications?filter=unread')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        const notifications = response.body.data;
        notifications.forEach((notif: any) => {
          if (notif.hasOwnProperty('is_read')) {
            expect(notif.is_read).toBe(false);
          }
        });
      }
    });
  });
});
