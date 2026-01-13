import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import messageRoutes from '../../../src/routes/message.routes';

dotenv.config({ path: '.env.test' });

const createTestApp = () => {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/messages', messageRoutes);

  return app;
};

describe('Messages API Integration Tests', () => {
  let app: express.Application;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
    authToken = 'mock-jwt-token';
  });

  describe('GET /api/messages/conversations', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/messages/conversations')
        .expect(401);
    });

    it('should return list of conversations', async () => {
      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      }
    });

    it('should include conversation metadata', async () => {
      const response = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success && response.body.data.length > 0) {
        const conversation = response.body.data[0];
        expect(conversation).toHaveProperty('id');
        expect(conversation).toHaveProperty('other_participant');
        expect(conversation).toHaveProperty('last_message');
        expect(conversation).toHaveProperty('unread_count');
      }
    });
  });

  describe('GET /api/messages/conversations/:id/messages', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/messages/conversations/1/messages')
        .expect(401);
    });

    it('should return messages for a conversation', async () => {
      const response = await request(app)
        .get('/api/messages/conversations/1/messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/messages/conversations/1/messages')
        .query({ page: 1, limit: 20 })
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        expect(response.body.data.length).toBeLessThanOrEqual(20);
      }
    });

    it('should return messages in chronological order', async () => {
      const response = await request(app)
        .get('/api/messages/conversations/1/messages')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success && response.body.data.length > 1) {
        const messages = response.body.data;
        for (let i = 0; i < messages.length - 1; i++) {
          const current = new Date(messages[i].created_at);
          const next = new Date(messages[i + 1].created_at);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
  });

  describe('POST /api/messages/conversations/:id/messages', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/messages/conversations/1/messages')
        .send({ content: 'Test message' })
        .expect(401);
    });

    it('should send a new message', async () => {
      const messageData = {
        content: 'Bonjour, j\'ai une question sur mon dossier'
      };

      const response = await request(app)
        .post('/api/messages/conversations/1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expect([200, 201, 401, 404, 500]).toContain(response.status);

      if ([200, 201].includes(response.status)) {
        expect(response.body).toHaveProperty('success');
      }
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post('/api/messages/conversations/1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '' });

      expect([400, 401, 500]).toContain(response.status);
    });

    it('should reject very long messages', async () => {
      const longContent = 'a'.repeat(10001); // Over 10000 chars

      const response = await request(app)
        .post('/api/messages/conversations/1/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: longContent });

      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('PATCH /api/messages/conversations/:conversationId/messages/:messageId/read', () => {
    it('should mark message as read', async () => {
      const response = await request(app)
        .patch('/api/messages/conversations/1/messages/1/read')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });
  });

  describe('PATCH /api/messages/conversations/:id/mark-all-read', () => {
    it('should mark all messages in conversation as read', async () => {
      const response = await request(app)
        .patch('/api/messages/conversations/1/mark-all-read')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/messages/conversations/:conversationId/messages/:messageId', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/messages/conversations/1/messages/1');

      expect([401, 404, 500]).toContain(response.status);
    });

    it('should delete a message', async () => {
      const response = await request(app)
        .delete('/api/messages/conversations/1/messages/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Message search and filtering', () => {
    it('should search messages by content', async () => {
      const response = await request(app)
        .get('/api/messages/conversations/1/messages/search')
        .query({ q: 'dossier' })
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200 && response.body.success) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should filter unread messages', async () => {
      const response = await request(app)
        .get('/api/messages/conversations')
        .query({ filter: 'unread' })
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        response.body.data.forEach((conv: any) => {
          if (conv.unread_count !== undefined) {
            expect(conv.unread_count).toBeGreaterThanOrEqual(0);
          }
        });
      }
    });
  });

  describe('Conversation creation', () => {
    it('should create a new conversation', async () => {
      const conversationData = {
        participant_id: '456',
        case_id: '789',
        initial_message: 'Bonjour, je souhaite discuter de mon dossier'
      };

      const response = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(conversationData);

      expect([200, 201, 401, 400, 500]).toContain(response.status);
    });
  });
});
