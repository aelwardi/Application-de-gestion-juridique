import * as authController from '../../../src/controllers/auth.controller';
import * as authService from '../../../src/services/auth.service';
import * as adminQueries from '../../../src/database/queries/admin.queries';
import { mockRequest, mockResponse } from '../../helpers/mock-helpers';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/database/queries/admin.queries');

describe('AuthController', () => {
  const mockAuthService = authService as jest.Mocked<typeof authService>;
  const mockAdminQueries = adminQueries as jest.Mocked<typeof adminQueries>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminQueries.createActivityLog.mockResolvedValue(undefined as any);
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerData = {
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'client',
        phone: '+1234567890',
      };

      const authResult = {
        user: {
          id: uuidv4(),
          email: registerData.email,
          role: registerData.role,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.register.mockResolvedValueOnce(authResult as any);

      const req = mockRequest({ body: registerData });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: authResult,
      });
    });

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        firstName: 'J',
        lastName: 'D',
        role: 'client',
      };

      const req = mockRequest({ body: invalidData });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
          errors: expect.any(Array),
        })
      );
    });

    it('should return 409 if email already exists', async () => {
      const registerData = {
        email: 'existing@test.com',
        password: 'Password123!',
        firstName: 'Existing',
        lastName: 'User',
        role: 'client',
      };

      mockAuthService.register.mockRejectedValueOnce(
        new Error('User with this email already exists')
      );

      const req = mockRequest({ body: registerData });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists',
      });
    });

    it('should return 500 for server errors', async () => {
      const registerData = {
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'client',
      };

      mockAuthService.register.mockRejectedValueOnce(new Error('Database error'));

      const req = mockRequest({ body: registerData });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to register user',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'Password123!',
      };

      const authResult = {
        user: {
          id: uuidv4(),
          email: loginData.email,
          role: 'client',
          firstName: 'Test',
          lastName: 'User',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requiresTwoFactor: false,
      };

      mockAuthService.login.mockResolvedValueOnce(authResult as any);

      const req = mockRequest({
        body: loginData,
        ip: '127.0.0.1',
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        authResult.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: authResult,
      });
    });

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      const req = mockRequest({ body: invalidData });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
        })
      );
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'WrongPassword123!',
      };

      mockAuthService.login.mockRejectedValueOnce(
        new Error('Invalid email or password')
      );

      const req = mockRequest({ body: loginData });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle login with two-factor authentication enabled', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'Password123!',
      };

      const userId = uuidv4();
      const authResult = {
        user: {
          id: userId,
          email: loginData.email,
          role: 'client',
          firstName: 'Test',
          lastName: 'User',
        },
        accessToken: '',
        refreshToken: '',
        requiresTwoFactor: true,
        tempToken: 'temp-token-123',
      };

      mockAuthService.login.mockResolvedValueOnce(authResult as any);

      const req = mockRequest({
        body: loginData,
        ip: '127.0.0.1',
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).not.toHaveBeenCalled(); // No cookie set when 2FA is required
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '2FA verification required',
        data: {
          requiresTwoFactor: true,
          tempToken: 'temp-token-123',
          user: {
            id: userId,
            email: loginData.email,
            firstName: 'Test',
            lastName: 'User',
          },
        },
      });
    });

    it('should return 401 for deactivated account', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'Password123!',
      };

      mockAuthService.login.mockRejectedValueOnce(
        new Error('Account is deactivated. Please contact support.')
      );

      const req = mockRequest({ body: loginData });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
      });
    });
  });
});