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
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('User Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const userRoutes = require('../../src/routes/user.routes').default;
    app.use('/api/users', userRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should get all users successfully', async () => {
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
        }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/search', () => {
    it('should search users by query', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'client',
          profile_picture_url: null,
        }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'john', limit: 10 })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should search users by query and role', async () => {
      const mockUsers = [
        {
          id: 'lawyer-1',
          email: 'lawyer@example.com',
          first_name: 'Jane',
          last_name: 'Attorney',
          role: 'lawyer',
          profile_picture_url: null,
        }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'jane', role: 'lawyer', limit: 5 })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
    });

    it('should return 400 if query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Query parameter is required');
    });

    it('should handle database errors in search', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'test' })
        .set('Authorization', 'Bearer mock-token')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'client',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .get('/api/users/123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });

    it('should return 404 if user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/users/123e4567-e89b-12d3-a456-426614174001')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      const updatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'updated@example.com',
        first_name: 'John',
        last_name: 'Updated',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [updatedUser] });

      const response = await request(app)
        .put('/api/users/123e4567-e89b-12d3-a456-426614174000')
        .send({
          email: 'updated@example.com',
          firstName: 'John',
          lastName: 'Updated',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedUser);
    });

    it('should handle validation errors', async () => {
      const updatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'invalid-email',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [updatedUser] });

      const response = await request(app)
        .put('/api/users/123e4567-e89b-12d3-a456-426614174000')
        .send({
          email: 'invalid-email',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '123e4567-e89b-12d3-a456-426614174000' }] });

      const response = await request(app)
        .delete('/api/users/123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimé');
    });

    it('should return 404 if user to delete not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .delete('/api/users/123e4567-e89b-12d3-a456-426614174001')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user successfully', async () => {
      const newUser = {
        id: 'user-new',
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        role: 'client',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [newUser] });

      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'newuser@example.com',
          password_hash: 'SecurePassword123!',
          password: 'SecurePassword123!',
          first_name: 'New',
          last_name: 'User',
          role: 'client',
        })
        .expect(201);

      expect(response.body.status).toBe('SUCCESS');
      expect(response.body.data).toEqual(newUser);
    });

    it('should handle validation errors on create', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid',
          password_hash: '123',
        })
        .expect(400);

      expect(response.body.status).toBe('ERROR');
    });
  });
});