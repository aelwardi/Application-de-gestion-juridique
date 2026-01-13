import { Request, Response } from 'express';
import * as authController from '../../../src/controllers/auth.controller';
import * as authService from '../../../src/services/auth.service';
import * as twoFactorService from '../../../src/services/two-factor.service';
import * as adminQueries from '../../../src/database/queries/admin.queries';
import {
  mockUser,
  mockUserResponse,
  mockRegisterInput,
  mockLoginInput,
} from '../../fixtures/user.fixture';
import { mockTokens } from '../../mocks/jwt.mock';

jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/services/two-factor.service');
jest.mock('../../../src/database/queries/admin.queries');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    const cookieMock = jest.fn();
    const clearCookieMock = jest.fn();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      cookies: {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any,
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      cookie: cookieMock,
      clearCookie: clearCookieMock,
    };

    jest.clearAllMocks();
    (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);
  });

  describe('register', () => {
    it('devrait créer un utilisateur et retourner 201', async () => {
      mockRequest.body = mockRegisterInput;
      const authResponse = {
        user: mockUserResponse,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      };
      (authService.register as jest.Mock).mockResolvedValue(authResponse);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(authService.register).toHaveBeenCalledWith(mockRegisterInput);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: authResponse,
      });
    });

    it('devrait retourner 400 pour des données invalides (Zod)', async () => {
      mockRequest.body = { email: 'invalid-email' };

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
          errors: expect.any(Array),
        })
      );
    });

    it('devrait retourner 409 si l\'email existe déjà', async () => {
      mockRequest.body = mockRegisterInput;
      (authService.register as jest.Mock).mockRejectedValue(
        new Error('User with this email already exists')
      );

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists',
      });
    });

    it('devrait retourner 500 pour une erreur serveur', async () => {
      mockRequest.body = mockRegisterInput;
      (authService.register as jest.Mock).mockRejectedValue(new Error('Database error'));

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to register user',
      });
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur et retourner 200', async () => {
      mockRequest.body = mockLoginInput;
      const authResponse = {
        user: mockUserResponse,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        requiresTwoFactor: false,
      };
      (authService.login as jest.Mock).mockResolvedValue(authResponse);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.login).toHaveBeenCalledWith(mockLoginInput);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: authResponse.user,
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          requiresTwoFactor: false,
        },
      });
    });

    it('devrait retourner requiresTwoFactor si 2FA activé', async () => {
      mockRequest.body = mockLoginInput;
      const authResponse = {
        user: mockUserResponse,
        accessToken: '',
        refreshToken: '',
        requiresTwoFactor: true,
        tempToken: 'temp-token-123',
      };
      (authService.login as jest.Mock).mockResolvedValue(authResponse);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: '2FA verification required',
        data: expect.objectContaining({
          requiresTwoFactor: true,
          tempToken: 'temp-token-123',
        }),
      });
    });

    it('devrait retourner 401 pour des identifiants invalides', async () => {
      mockRequest.body = mockLoginInput;
      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid email or password')
      );

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password',
      });
    });

    it('devrait retourner 400 pour des données invalides (Zod)', async () => {
      mockRequest.body = { email: 'invalid' };

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
        })
      );
    });
  });

  describe('logout', () => {
    it('devrait déconnecter un utilisateur avec succès', async () => {
      mockRequest.body = { userId: mockUser.id };
      (mockRequest as any).user = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      };

      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
      });
    });
  });

  describe('refreshToken', () => {
    it('devrait générer de nouveaux tokens', async () => {
      mockRequest.body = { refreshToken: 'valid-refresh-token' };
      const tokens = {
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      };
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue(tokens);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    });

    it('devrait retourner 401 si le refresh token est invalide', async () => {
      mockRequest.body = { refreshToken: 'invalid-token' };
      (authService.refreshAccessToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
    });
  });
});
