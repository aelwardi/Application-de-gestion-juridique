import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../../../src/middleware/auth.middleware';
import * as jwtUtil from '../../../src/utils/jwt.util';

jest.mock('../../../src/utils/jwt.util');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    nextFunction = jest.fn();

    mockRequest = {
      headers: {},
      user: undefined,
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'client',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwtUtil.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should deny access if no authorization header', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.',
      });
    });

    it('should deny access if token format is invalid', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>',
      });
    });

    it('should handle expired token', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    });

    it('should handle invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    });

    it('should handle unknown verification errors', () => {
      mockRequest.headers = {
        authorization: 'Bearer problematic-token',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Unknown error');
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token verification failed',
      });
    });

    it('should handle non-Error exceptions', () => {
      mockRequest.headers = {
        authorization: 'Bearer problematic-token',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw 'String error';
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token verification failed',
      });
    });
  });

  describe('authorize', () => {
    it('should allow access for authorized role', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
      };

      const middleware = authorize('admin', 'avocat');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should allow access for multiple authorized roles', () => {
      mockRequest.user = {
        userId: 'lawyer-123',
        email: 'lawyer@example.com',
        role: 'avocat',
      };

      const middleware = authorize('admin', 'avocat', 'client');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should deny access if user is not authenticated', () => {
      mockRequest.user = undefined;

      const middleware = authorize('admin');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
    });

    it('should deny access for unauthorized role', () => {
      mockRequest.user = {
        userId: 'client-123',
        email: 'client@example.com',
        role: 'client',
      };

      const middleware = authorize('admin', 'avocat');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Access forbidden. Insufficient permissions.',
      });
    });

    it('should work with single role', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };

      const middleware = authorize('admin');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('optionalAuthenticate', () => {
    it('should authenticate valid token when provided', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'client',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jwtUtil.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should continue without authentication if no token provided', () => {
      mockRequest.headers = {};

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should continue without authentication if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should continue if authorization header format is invalid', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should continue if token verification throws error', () => {
      mockRequest.headers = {
        authorization: 'Bearer problematic-token',
      };

      (jwtUtil.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});