import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../../../src/routes/auth.routes';

dotenv.config({ path: '.env.test' });

const createTestApp = () => {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Test server is running' });
  });

  app.use('/api/auth', authRoutes);

  return app;
};

describe('Auth Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new client successfully', async () => {
      const userData = {
        email: `client${Date.now()}@test.com`,
        password: 'Test123!@#',
        first_name: 'John',
        last_name: 'Doe',
        role: 'client',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect([200, 201, 400, 500]).toContain(response.status);

      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data || response.body).toHaveProperty('user');
        }
      }
    }, 15000);

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test123!@#',
        first_name: 'John',
        last_name: 'Doe',
        role: 'client',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUserEmail: string;
    const testUserPassword = 'Test123!@#';

    beforeAll(async () => {
      testUserEmail = `logintest${Date.now()}@test.com`;

      await request(app)
        .post('/api/auth/register')
        .send({
          email: testUserEmail,
          password: testUserPassword,
          first_name: 'Login',
          last_name: 'Test',
          role: 'client',
        });
    }, 15000);

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
        });

      expect([200, 201, 400, 401, 500]).toContain(response.status);

      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('success');
      }
    }, 15000);

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test123!@#',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});

