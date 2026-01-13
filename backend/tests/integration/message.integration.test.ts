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

describe('Message Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const messageRoutes = require('../../src/routes/message.routes').default;
    app.use('/api/messages', messageRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/messages/conversations', () => {
    it('should get all conversations for authenticated user', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          case_id: 'case-123',
          participant1_id: 'user-123',
          participant2_id: 'user-456',
          created_at: new Date(),
          last_message_at: new Date(),
          case_info: {
            id: 'case-123',
            title: 'Test Case',
            case_number: 'CASE-001',
          },
          other_participant: {
            id: 'user-456',
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane@example.com',
            role: 'lawyer',
            profile_picture_url: null,
          },
          last_message: {
            message_text: 'Hello',
            created_at: new Date(),
            sender_id: 'user-456',
            is_read: false,
          },
          unread_count: 2,
        }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockConversations });

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('case_info');
      expect(response.body.data[0]).toHaveProperty('other_participant');
      expect(response.body.data[0].unread_count).toBe(2);
    });

    it('should handle empty conversations', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', 'Bearer mock-token')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/conversations/:id', () => {
    it('should get messages for a specific conversation', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversation_id: 'conv-123',
          sender_id: 'user-123',
          content: 'Hello',
          created_at: new Date(),
          is_read: true,
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-123',
          sender_id: 'user-456',
          content: 'Hi there',
          created_at: new Date(),
          is_read: false,
        }
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'conv-123', participant1_id: 'user-123' }] }) // conversation check
        .mockResolvedValueOnce({ rows: mockMessages }); // messages query

      const response = await request(app)
        .get('/api/messages/conversations/conv-123/messages')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array for conversation with no messages', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'conv-empty', participant1_id: 'user-123' }] }) // conversation check
        .mockResolvedValueOnce({ rows: [] }); // empty messages

      const response = await request(app)
        .get('/api/messages/conversations/conv-empty/messages')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/messages/conversations', () => {
    it('should create or get existing conversation', async () => {
      const mockConversation = {
        id: 'conv-new',
        participant1_id: 'user-123',
        participant2_id: 'user-456',
        case_id: 'case-123',
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockConversation] });

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', 'Bearer mock-token')
        .send({
          participantId: 'user-456',
          caseId: 'case-123',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', 'Bearer mock-token')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/messages', () => {
    it('should send a message successfully', async () => {
      const mockMessage = {
        id: 'msg-new',
        conversation_id: 'conv-123',
        sender_id: 'user-123',
        content: 'Test message',
        created_at: new Date(),
        is_read: false,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockMessage] });

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', 'Bearer mock-token')
        .send({
          conversationId: 'conv-123',
          content: 'Test message',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Test message');
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', 'Bearer mock-token')
        .send({
          conversationId: 'conv-123',
          content: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate conversation exists', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', 'Bearer mock-token')
        .send({
          conversationId: 'nonexistent',
          content: 'Test',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/messages/:id/read', () => {
    it('should mark message as read', async () => {
      const mockMessage = {
        id: 'msg-123',
        is_read: true,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockMessage] });

      const response = await request(app)
        .patch('/api/messages/msg-123/read')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should handle non-existent message', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .patch('/api/messages/nonexistent/read')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/messages/conversations/:id/read-all', () => {
    it('should mark all messages in conversation as read', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 5 });

      const response = await request(app)
        .patch('/api/messages/conversations/conv-123/read-all')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('marked as read');
    });

    it('should handle conversation with no unread messages', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const response = await request(app)
        .patch('/api/messages/conversations/conv-123/read-all')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete message successfully', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/messages/msg-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 if message not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const response = await request(app)
        .delete('/api/messages/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/unread-count', () => {
    it('should get unread message count', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ count: 7 }],
      });

      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(7);
    });

    it('should return 0 if no unread messages', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ count: 0 }],
      });

      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.count).toBe(0);
    });
  });
});
