import request from 'supertest';
import express, { Express } from 'express';
import * as authService from '../../src/services/auth.service';
import * as adminQueries from '../../src/database/queries/admin.queries';

jest.mock('../../src/services/auth.service');
jest.mock('../../src/database/queries/admin.queries');

describe('Auth API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const authRoutes = require('../../src/routes/auth.routes').default;
    app.use('/api/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        role: 'client',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
      };

      const mockResponse = {
        user: {
          id: 'user-123',
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          isActive: true,
          emailVerified: false,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(authService.register).toHaveBeenCalledWith(userData);
    });

    it('devrait retourner 409 si l\'email existe déjà', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'NewPassword123!',
        role: 'client',
        firstName: 'New',
        lastName: 'User',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new Error('User with this email already exists')
      );

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        role: 'client',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
      };

      const mockResponse = {
        user: {
          id: 'user-123',
          email: loginData.email,
          role: 'client',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(authService.login).toHaveBeenCalledWith(loginData);
    });

    it('devrait retourner 401 pour un email inexistant', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid email or password')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('devrait retourner 401 pour un mot de passe incorrect', async () => {
      const loginData = {
        email: 'testuser2@example.com',
        password: 'WrongPassword123!',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid email or password')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('devrait générer de nouveaux tokens avec un refresh token valide', async () => {
      const refreshToken = 'valid-refresh-token';

      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (authService.refreshAccessToken as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(refreshToken);
    });

    it('devrait retourner 401 pour un refresh token invalide', async () => {
      const invalidToken = 'invalid-refresh-token-xyz';

      (authService.refreshAccessToken as jest.Mock).mockRejectedValue(
        new Error('Invalid or expired refresh token')
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: invalidToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('devrait déconnecter un utilisateur avec succès', async () => {
      const userId = 'user-123';
      const accessToken = 'mock-access-token';

      // Mock the logout functionality - for now we just test the route exists
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
