import request from 'supertest';
import express, { Express } from 'express';
import { pool } from '../../src/config/database.config';

jest.mock('../../src/config/database.config');

// Mock admin middleware to allow admin operations in tests
jest.mock('../../src/middleware/admin.middleware', () => ({
  requireAdmin: (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  },
}));

jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // Default to admin role for tests that need admin access
    req.user = { userId: 'user-123', role: 'admin' };
    next();
  },
}));

describe('Support Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const supportRoutes = require('../../src/routes/support.routes').default;
    app.use('/api/support', supportRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/support/tickets', () => {
    it('should create support ticket successfully', async () => {
      const mockTicket = {
        id: 'ticket-123',
        user_id: 'user-123',
        subject: 'Need help with login',
        message: 'Cannot access my account',
        status: 'open',
        priority: 'medium',
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockTicket] });

      const response = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', 'Bearer mock-token')
        .send({
          subject: 'Need help with login',
          description: 'Cannot access my account',
          priority: 'medium',
          category: 'technical',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('Need help with login');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', 'Bearer mock-token')
        .send({
          subject: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate message length', async () => {
      const response = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', 'Bearer mock-token')
        .send({
          subject: 'Test',
          message: 'Too short',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/support/tickets', () => {
    it('should get all tickets for authenticated user', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          subject: 'Issue 1',
          status: 'open',
          priority: 'high',
          created_at: new Date(),
        },
        {
          id: 'ticket-2',
          subject: 'Issue 2',
          status: 'closed',
          priority: 'low',
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockTickets });

      const response = await request(app)
        .get('/api/support/my-tickets')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter tickets by status', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          subject: 'Issue 1',
          status: 'open',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockTickets });

      const response = await request(app)
        .get('/api/support/my-tickets')
        .query({ status: 'open' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should handle empty ticket list', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/support/my-tickets')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/support/tickets/:id', () => {
    it('should get ticket details with messages', async () => {
      const mockTicket = {
        id: 'ticket-123',
        subject: 'Test Issue',
        message: 'Description',
        status: 'open',
        priority: 'medium',
        created_at: new Date(),
      };

      const mockMessages = [
        {
          id: 'msg-1',
          content: 'First response',
          sender_id: 'admin-1',
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockTicket] })
        .mockResolvedValueOnce({ rows: mockMessages });

      const response = await request(app)
        .get('/api/support/tickets/ticket-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ticket).toHaveProperty('subject');
      expect(response.body.data).toHaveProperty('messages');
    });

    it('should return 404 for non-existent ticket', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/support/tickets/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should prevent access to other user tickets', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/support/tickets/other-user-ticket')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/support/tickets/:id/messages', () => {
    it('should add message to ticket', async () => {
      const mockMessage = {
        id: 'msg-123',
        ticket_id: 'ticket-123',
        sender_id: 'user-123',
        message: 'Additional information',
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockMessage] });

      const response = await request(app)
        .post('/api/support/tickets/ticket-123/messages')
        .set('Authorization', 'Bearer mock-token')
        .send({
          message: 'Additional information',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Additional information');
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post('/api/support/tickets/ticket-123/messages')
        .set('Authorization', 'Bearer mock-token')
        .send({
          content: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/support/tickets/:id', () => {
    it('should delete ticket', async () => {
      const mockTicket = {
        id: 'ticket-123',
        user_id: 'user-123',
        subject: 'Test',
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockTicket] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/support/tickets/ticket-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 if ticket not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .delete('/api/support/tickets/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/support/faq', () => {
    it('should get FAQ items', async () => {
      const mockFAQ = [
        {
          id: 'faq-1',
          question: 'How to reset password?',
          answer: 'Click on forgot password...',
          category: 'account',
        },
        {
          id: 'faq-2',
          question: 'How to schedule appointment?',
          answer: 'Go to appointments page...',
          category: 'appointments',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockFAQ });

      const response = await request(app)
        .get('/api/support/faq')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter FAQ by category', async () => {
      const mockFAQ = [
        {
          id: 'faq-1',
          question: 'Account question',
          category: 'account',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockFAQ });

      const response = await request(app)
        .get('/api/support/faq')
        .query({ category: 'account' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});