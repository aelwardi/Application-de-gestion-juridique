import request from 'supertest';
import express, { Express } from 'express';
import { FeedbackController } from '../../src/controllers/feedback.controller';
import { authenticate } from '../../src/middleware/auth.middleware';
import { requireAdmin } from '../../src/middleware/admin.middleware';

jest.mock('../../src/controllers/feedback.controller');
jest.mock('../../src/middleware/auth.middleware');
jest.mock('../../src/middleware/admin.middleware');

describe('Feedback API Integration Tests', () => {
  let app: Express;
  const mockFeedbackController = {
    create: jest.fn(),
    getMyFeedback: jest.fn(),
    getAll: jest.fn(),
    getStats: jest.fn(),
    getById: jest.fn(),
    updateStatus: jest.fn(),
    reply: jest.fn(),
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    (FeedbackController as jest.Mock).mockImplementation(() => mockFeedbackController);

    (authenticate as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'user-123', role: 'client' };
      next();
    });

    (requireAdmin as jest.Mock).mockImplementation((req, res, next) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      next();
    });

    const feedbackRoutes = require('../../src/routes/feedback.routes').default;
    app.use('/api/feedback', feedbackRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/feedback', () => {
    it('should create feedback successfully', async () => {
      mockFeedbackController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Feedback created successfully',
          data: {
            id: 'feedback-123',
            user_id: 'user-123',
            rating: 5,
            comment: 'Great service!',
            status: 'pending',
          },
        });
      });

      const response = await request(app)
        .post('/api/feedback')
        .send({
          rating: 5,
          comment: 'Great service!',
          category: 'service',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.rating).toBe(5);
    });

    it('should require authentication', async () => {
      (authenticate as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ success: false, message: 'Authentication required' });
      });

      const response = await request(app)
        .post('/api/feedback')
        .send({
          rating: 5,
          comment: 'Great service!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/feedback/my-feedback', () => {
    it('should get user feedback successfully', async () => {
      mockFeedbackController.getMyFeedback.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: [
            {
              id: 'feedback-1',
              rating: 5,
              comment: 'Great!',
              created_at: new Date(),
            },
            {
              id: 'feedback-2',
              rating: 4,
              comment: 'Good',
              created_at: new Date(),
            },
          ],
        });
      });

      const response = await request(app)
        .get('/api/feedback/my-feedback')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/feedback (Admin)', () => {
    beforeEach(() => {
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'admin-123', role: 'admin' };
        next();
      });

      (requireAdmin as jest.Mock).mockImplementation((req, res, next) => {
        next();
      });
    });

    it('should get all feedback for admin', async () => {
      mockFeedbackController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: [
            {
              id: 'feedback-1',
              user_id: 'user-1',
              rating: 5,
              comment: 'Excellent',
              status: 'pending',
            },
            {
              id: 'feedback-2',
              user_id: 'user-2',
              rating: 3,
              comment: 'Average',
              status: 'reviewed',
            },
          ],
        });
      });

      const response = await request(app)
        .get('/api/feedback')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should deny access to non-admin users', async () => {
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'user-123', role: 'client' };
        next();
      });

      (requireAdmin as jest.Mock).mockImplementation((req, res) => {
        res.status(403).json({ success: false, message: 'Admin access required' });
      });

      const response = await request(app)
        .get('/api/feedback')
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/feedback/stats (Admin)', () => {
    beforeEach(() => {
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'admin-123', role: 'admin' };
        next();
      });

      (requireAdmin as jest.Mock).mockImplementation((req, res, next) => {
        next();
      });
    });

    it('should get feedback stats for admin', async () => {
      mockFeedbackController.getStats.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: {
            total: 100,
            averageRating: 4.5,
            byStatus: {
              pending: 20,
              reviewed: 60,
              resolved: 20,
            },
            byRating: {
              5: 50,
              4: 30,
              3: 15,
              2: 3,
              1: 2,
            },
          },
        });
      });

      const response = await request(app)
        .get('/api/feedback/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('averageRating');
    });
  });

  describe('GET /api/feedback/:id (Admin)', () => {
    beforeEach(() => {
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'admin-123', role: 'admin' };
        next();
      });

      (requireAdmin as jest.Mock).mockImplementation((req, res, next) => {
        next();
      });
    });

    it('should get feedback by id for admin', async () => {
      mockFeedbackController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: {
            id: 'feedback-123',
            user_id: 'user-123',
            rating: 5,
            comment: 'Great service!',
            status: 'pending',
            user_name: 'John Doe',
          },
        });
      });

      const response = await request(app)
        .get('/api/feedback/feedback-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('feedback-123');
    });
  });

  describe('PATCH /api/feedback/:id/status (Admin)', () => {
    beforeEach(() => {
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'admin-123', role: 'admin' };
        next();
      });

      (requireAdmin as jest.Mock).mockImplementation((req, res, next) => {
        next();
      });
    });

    it('should update feedback status for admin', async () => {
      mockFeedbackController.updateStatus.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Status updated successfully',
          data: {
            id: 'feedback-123',
            status: 'reviewed',
          },
        });
      });

      const response = await request(app)
        .patch('/api/feedback/feedback-123/status')
        .send({ status: 'reviewed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('reviewed');
    });
  });

  describe('POST /api/feedback/:id/reply (Admin)', () => {
    beforeEach(() => {
      (authenticate as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'admin-123', role: 'admin' };
        next();
      });

      (requireAdmin as jest.Mock).mockImplementation((req, res, next) => {
        next();
      });
    });

    it('should reply to feedback for admin', async () => {
      mockFeedbackController.reply.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Reply sent successfully',
          data: {
            id: 'feedback-123',
            admin_reply: 'Thank you for your feedback!',
            replied_at: new Date(),
          },
        });
      });

      const response = await request(app)
        .post('/api/feedback/feedback-123/reply')
        .send({ reply: 'Thank you for your feedback!' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('admin_reply');
    });
  });
});

