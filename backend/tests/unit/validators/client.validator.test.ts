import { Request, Response, NextFunction } from 'express';
import {
  validateCreateClient,
  validateUpdateClient,
  validateClientId,
  validateUserId,
} from '../../../src/validators/client.validator';

describe('Client Validators', () => {
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

  describe('validateCreateClient', () => {
    it('should pass validation with valid data', () => {
      mockRequest.body = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        address: '123 Main St',
        city: 'Paris',
        postal_code: '75001',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '+33612345678',
        notes: 'Some notes',
      };

      validateCreateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should pass validation with only required fields', () => {
      mockRequest.body = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      validateCreateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid user_id', () => {
      mockRequest.body = {
        user_id: 'invalid-uuid',
      };

      validateCreateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Données de validation invalides',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with missing user_id', () => {
      mockRequest.body = {
        address: '123 Main St',
      };

      validateCreateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Données de validation invalides',
        })
      );
    });

    it('should fail validation with city exceeding max length', () => {
      mockRequest.body = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        city: 'A'.repeat(101),
      };

      validateCreateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateClient', () => {
    it('should pass validation with valid update data', () => {
      mockRequest.body = {
        address: '456 New St',
        city: 'Lyon',
      };

      validateUpdateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should pass validation with single field update', () => {
      mockRequest.body = {
        notes: 'Updated notes',
      };

      validateUpdateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should pass validation with empty body for partial updates', () => {
      mockRequest.body = {};

      validateUpdateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should fail validation with city exceeding max length', () => {
      mockRequest.body = {
        city: 'A'.repeat(101),
      };

      validateUpdateClient(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('validateClientId', () => {
    it('should pass validation with valid UUID', () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      validateClientId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid UUID', () => {
      mockRequest.params = {
        id: 'invalid-uuid',
      };

      validateClientId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Données de validation invalides',
        })
      );
    });

    it('should fail validation with missing id', () => {
      mockRequest.params = {};

      validateClientId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUserId', () => {
    it('should pass validation with valid userId', () => {
      mockRequest.params = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid userId', () => {
      mockRequest.params = {
        userId: 'invalid-uuid',
      };

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should fail validation with missing userId', () => {
      mockRequest.params = {};

      validateUserId(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });
});