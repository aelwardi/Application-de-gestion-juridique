import { Request, Response, NextFunction } from 'express';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
} from '../../../src/validators/user.validator';

describe('User Validators', () => {
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
      body: {},
      params: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('validateCreateUser', () => {
    it('should pass validation with valid user data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'client',
        first_name: 'John',
        last_name: 'Doe',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should pass validation with avocat role', () => {
      mockRequest.body = {
        email: 'lawyer@example.com',
        password_hash: 'hashed_password',
        role: 'avocat',
        first_name: 'Jane',
        last_name: 'Smith',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should pass validation with admin role', () => {
      mockRequest.body = {
        email: 'admin@example.com',
        password_hash: 'hashed_password',
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should pass validation with collaborateur role', () => {
      mockRequest.body = {
        email: 'collab@example.com',
        password_hash: 'hashed_password',
        role: 'collaborateur',
        first_name: 'Collab',
        last_name: 'User',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail validation with missing email', () => {
      mockRequest.body = {
        password_hash: 'hashed_password',
        role: 'client',
        first_name: 'John',
        last_name: 'Doe',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Email requis',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with non-string email', () => {
      mockRequest.body = {
        email: 123,
        password_hash: 'hashed_password',
        role: 'client',
        first_name: 'John',
        last_name: 'Doe',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Email requis',
      });
    });

    it('should fail validation with missing password_hash', () => {
      mockRequest.body = {
        email: 'test@example.com',
        role: 'client',
        first_name: 'John',
        last_name: 'Doe',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Mot de passe requis',
      });
    });

    it('should fail validation with invalid role', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'invalid_role',
        first_name: 'John',
        last_name: 'Doe',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Role invalide',
      });
    });

    it('should fail validation with missing first_name', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'client',
        last_name: 'Doe',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Prénom requis',
      });
    });

    it('should fail validation with missing last_name', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'client',
        first_name: 'John',
      };

      validateCreateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Nom requis',
      });
    });
  });

  describe('validateUpdateUser', () => {
    it('should pass validation with at least one field', () => {
      mockRequest.body = {
        first_name: 'Jane',
      };

      validateUpdateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should pass validation with multiple fields', () => {
      mockRequest.body = {
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+33612345678',
      };

      validateUpdateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail validation with empty body', () => {
      mockRequest.body = {};

      validateUpdateUser(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Au moins un champ à mettre à jour',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateUserId', () => {
    it('should pass validation with valid UUID', () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid UUID format', () => {
      mockRequest.params = {
        id: 'invalid-uuid',
      };

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'ID utilisateur invalide',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with missing id', () => {
      mockRequest.params = {};

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'ID utilisateur invalide',
      });
    });

    it('should fail validation with uppercase UUID letters', () => {
      mockRequest.params = {
        id: '123E4567-E89B-12D3-A456-426614174000',
      };

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail validation with non-UUID string', () => {
      mockRequest.params = {
        id: '12345',
      };

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });
});