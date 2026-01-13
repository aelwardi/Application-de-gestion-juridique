import { Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../../../src/middleware/admin.middleware';

describe('Admin Middleware', () => {
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
      user: undefined,
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('requireAdmin', () => {
    it('should allow access for admin users', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should deny access if user is not authenticated', () => {
      mockRequest.user = undefined;

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
    });

    it('should deny access for non-admin users (client)', () => {
      mockRequest.user = {
        userId: 'client-123',
        email: 'client@example.com',
        role: 'client',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Admin access required',
      });
    });

    it('should deny access for non-admin users (avocat)', () => {
      mockRequest.user = {
        userId: 'lawyer-123',
        email: 'lawyer@example.com',
        role: 'avocat',
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Admin access required',
      });
    });

    it('should handle errors gracefully', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };

      const errorNextFunction = jest.fn(() => {
        throw new Error('Unexpected error');
      });

      expect(() => {
        requireAdmin(mockRequest as Request, mockResponse as Response, errorNextFunction);
      }).not.toThrow();
    });
  });
});

