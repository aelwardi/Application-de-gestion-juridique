import request from 'supertest';
import express, { Express } from 'express';
import { pool } from '../../src/config/database.config';

jest.mock('../../src/config/database.config');
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'admin-123', role: 'admin' };
    next();
  },
}));
jest.mock('../../src/middleware/admin.middleware', () => ({
  requireAdmin: (req: any, res: any, next: any) => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
    }
  },
}));

jest.mock('../../src/utils/email.util', () => ({
  sendEmail: jest.fn().mockResolvedValue({}),
}));

describe('Admin Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const adminRoutes = require('../../src/routes/admin.routes').default;
    app.use('/api/admin', adminRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/stats', () => {
    it('should get admin statistics', async () => {
      const mockStats = {
        totalUsers: 150,
        totalLawyers: 45,
        totalClients: 105,
        totalAppointments: 320,
        totalCases: 280,
        pendingRequests: 12,
        activeUsers: 142,
        newUsersThisMonth: 25,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockStats] });

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalLawyers');
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin-token')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should get all users with pagination', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'client',
          is_active: true,
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'lawyer',
          is_active: true,
        },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '50' }] })
        .mockResolvedValueOnce({ rows: mockUsers });

      const response = await request(app)
        .get('/api/admin/users')
        .query({ page: 1, limit: 20 })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter users by role', async () => {
      const mockLawyers = [
        {
          id: 'lawyer-1',
          email: 'lawyer@example.com',
          role: 'lawyer',
        },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '45' }] })
        .mockResolvedValueOnce({ rows: mockLawyers });

      const response = await request(app)
        .get('/api/admin/users')
        .query({ role: 'lawyer' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should search users by query', async () => {
      const mockResults = [
        {
          id: 'user-1',
          email: 'john@example.com',
          first_name: 'John',
        },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: mockResults });

      const response = await request(app)
        .get('/api/admin/users')
        .query({ search: 'john' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PATCH /api/admin/users/:id/activate', () => {
    it('should activate user', async () => {
      const mockUser = {
        id: 'user-123',
        is_active: true,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .patch('/api/admin/users/user-123/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ isActive: true })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 if user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const response = await request(app)
        .patch('/api/admin/users/nonexistent/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ isActive: true })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/admin/users/:id/deactivate', () => {
    it('should deactivate user', async () => {
      const mockUser = {
        id: 'user-123',
        is_active: false,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .patch('/api/admin/users/user-123/status')
        .set('Authorization', 'Bearer admin-token')
        .send({ isActive: false })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'user-123', email: 'test@test.com', first_name: 'Test' }] })
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/admin/users/user-123')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 if user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete('/api/admin/users/nonexistent')
        .set('Authorization', 'Bearer admin-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/lawyer-requests', () => {
    it('should get pending lawyer requests', async () => {
      const mockRequests = [
        {
          id: 'req-1',
          user_id: 'user-1',
          status: 'pending',
          specialties: ['family', 'criminal'],
          created_at: new Date(),
        },
        {
          id: 'req-2',
          user_id: 'user-2',
          status: 'pending',
          specialties: ['business'],
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockRequests });

      const response = await request(app)
        .get('/api/admin/lawyer-requests')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter requests by status', async () => {
      const mockRequests = [
        {
          id: 'req-1',
          status: 'approved',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockRequests });

      const response = await request(app)
        .get('/api/admin/lawyer-requests')
        .query({ status: 'approved' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/activity-logs', () => {
    it('should get activity logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          user_id: 'user-1',
          action: 'user_login',
          details: 'User logged in',
          created_at: new Date(),
        },
        {
          id: 'log-2',
          user_id: 'user-2',
          action: 'case_created',
          details: 'New case created',
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockLogs });

      const response = await request(app)
        .get('/api/admin/activity-logs')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should paginate activity logs', async () => {
      const mockLogs = Array(10).fill(null).map((_, i) => ({
        id: `log-${i}`,
        action: 'test_action',
      }));

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '100' }] })
        .mockResolvedValueOnce({ rows: mockLogs });

      const response = await request(app)
        .get('/api/admin/activity-logs')
        .query({ page: 1, limit: 10 })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /api/admin/reports', () => {
    it('should generate admin reports', async () => {
      const mockReport = {
        totalRevenue: 50000,
        completedCases: 150,
        averageResolutionTime: 30,
        clientSatisfaction: 4.5,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockReport] });

      const response = await request(app)
        .get('/api/admin/reports')
        .query({ type: 'monthly', month: 1, year: 2024 })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRevenue');
    });

    it('should validate report parameters', async () => {
      const response = await request(app)
        .get('/api/admin/reports')
        .query({ type: 'invalid' })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});