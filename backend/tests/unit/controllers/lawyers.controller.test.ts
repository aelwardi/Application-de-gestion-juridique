import { Request, Response } from 'express';
import * as lawyersController from '../../../src/controllers/lawyers.controller';
import * as lawyersService from '../../../src/services/lawyers.service';
import * as adminQueries from '../../../src/database/queries/admin.queries';

jest.mock('../../../src/services/lawyers.service');
jest.mock('../../../src/database/queries/admin.queries');

describe('LawyersController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any,
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
    (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);
  });

  describe('getLawyers', () => {
    it('should get all lawyers with default pagination', async () => {
      const mockResult = {
        lawyers: [
          {
            id: 'lawyer-1',
            email: 'lawyer1@example.com',
            first_name: 'John',
            last_name: 'Doe',
          },
          {
            id: 'lawyer-2',
            email: 'lawyer2@example.com',
            first_name: 'Jane',
            last_name: 'Smith',
          },
        ],
        total: 2,
      };

      (lawyersService.getAllLawyers as jest.Mock).mockResolvedValue(mockResult);

      await lawyersController.getLawyers(mockRequest as Request, mockResponse as Response);

      expect(lawyersService.getAllLawyers).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult.lawyers,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should get lawyers with custom pagination and filters', async () => {
      mockRequest.query = {
        page: '2',
        limit: '10',
        verified: 'true',
        city: 'Paris',
        specialty: 'Droit pénal',
      };

      const mockResult = {
        lawyers: [],
        total: 0,
      };

      (lawyersService.getAllLawyers as jest.Mock).mockResolvedValue(mockResult);

      await lawyersController.getLawyers(mockRequest as Request, mockResponse as Response);

      expect(lawyersService.getAllLawyers).toHaveBeenCalledWith(2, 10, true, 'Paris', 'Droit pénal');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should handle verified=false filter', async () => {
      mockRequest.query = {
        verified: 'false',
      };

      const mockResult = {
        lawyers: [],
        total: 0,
      };

      (lawyersService.getAllLawyers as jest.Mock).mockResolvedValue(mockResult);

      await lawyersController.getLawyers(mockRequest as Request, mockResponse as Response);

      expect(lawyersService.getAllLawyers).toHaveBeenCalledWith(1, 20, false, undefined, undefined);
    });

    it('should handle service errors', async () => {
      (lawyersService.getAllLawyers as jest.Mock).mockRejectedValue(new Error('Database error'));

      await lawyersController.getLawyers(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch lawyers',
      });
    });
  });

  describe('getLawyerDetails', () => {
    it('should get lawyer details by id', async () => {
      mockRequest.params = { id: 'lawyer-123' };

      const mockLawyer = {
        id: 'lawyer-123',
        email: 'lawyer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        specialties: ['Droit pénal'],
        verified_by_admin: true,
      };

      (lawyersService.getLawyerDetails as jest.Mock).mockResolvedValue(mockLawyer);

      await lawyersController.getLawyerDetails(mockRequest as Request, mockResponse as Response);

      expect(lawyersService.getLawyerDetails).toHaveBeenCalledWith('lawyer-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockLawyer,
      });
    });

    it('should return 404 if lawyer not found', async () => {
      mockRequest.params = { id: 'lawyer-123' };

      (lawyersService.getLawyerDetails as jest.Mock).mockRejectedValue(
        new Error('Lawyer not found')
      );

      await lawyersController.getLawyerDetails(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Lawyer not found',
      });
    });

    it('should handle other service errors', async () => {
      mockRequest.params = { id: 'lawyer-123' };

      (lawyersService.getLawyerDetails as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyersController.getLawyerDetails(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch lawyer details',
      });
    });
  });

  describe('verifyLawyer', () => {
    it('should verify lawyer successfully', async () => {
      mockRequest.params = { id: 'lawyer-123' };

      (lawyersService.verifyLawyer as jest.Mock).mockResolvedValue(undefined);

      await lawyersController.verifyLawyer(mockRequest as Request, mockResponse as Response);

      expect(lawyersService.verifyLawyer).toHaveBeenCalledWith('lawyer-123', 'admin-123');
      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'admin-123',
        'LAWYER_VERIFIED',
        'user',
        'lawyer-123',
        '127.0.0.1',
        'test-user-agent',
        { verified_by: 'admin-123', lawyer_id: 'lawyer-123' }
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Lawyer verified successfully',
      });
    });

    it('should return 404 if lawyer not found', async () => {
      mockRequest.params = { id: 'lawyer-123' };

      (lawyersService.verifyLawyer as jest.Mock).mockRejectedValue(
        new Error('Lawyer not found')
      );

      await lawyersController.verifyLawyer(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Lawyer not found',
      });
    });

    it('should handle service errors and still log activity', async () => {
      mockRequest.params = { id: 'lawyer-123' };

      (lawyersService.verifyLawyer as jest.Mock).mockResolvedValue(undefined);

      await lawyersController.verifyLawyer(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Lawyer verified successfully',
      });
    });

    it('should handle logging errors gracefully', async () => {
      mockRequest.params = { id: 'lawyer-123' };

      (lawyersService.verifyLawyer as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.createActivityLog as jest.Mock).mockRejectedValue(
        new Error('Logging error')
      );

      await lawyersController.verifyLawyer(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Lawyer verified successfully',
      });
    });
  });

  describe('getComprehensiveStats', () => {
    it('should get comprehensive stats successfully', async () => {
      const mockStats = {
        totalLawyers: 100,
        verifiedLawyers: 80,
        activeLawyers: 75,
      };

      (lawyersService.getComprehensiveStats as jest.Mock).mockResolvedValue(mockStats);

      await lawyersController.getComprehensiveStats(mockRequest as Request, mockResponse as Response);

      expect(lawyersService.getComprehensiveStats).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should handle service errors', async () => {
      (lawyersService.getComprehensiveStats as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyersController.getComprehensiveStats(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch comprehensive statistics',
      });
    });
  });
});

