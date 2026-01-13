import { Request, Response } from 'express';
import * as lawyerRequestController from '../../../src/controllers/lawyer-request.controller';
import * as lawyerRequestService from '../../../src/services/lawyer-request.service';

jest.mock('../../../src/services/lawyer-request.service');

describe('LawyerRequestController', () => {
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
        userId: 'user-123',
        email: 'user@example.com',
        role: 'client',
      },
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('createLawyerRequest', () => {
    it('should create lawyer request successfully', async () => {
      mockRequest.body = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation juridique',
        description: 'Besoin de conseil',
      };

      const mockRequest_data = {
        id: 'request-123',
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation juridique',
        status: 'pending',
      };

      (lawyerRequestService.createLawyerRequest as jest.Mock).mockResolvedValue(mockRequest_data);

      await lawyerRequestController.createLawyerRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.createLawyerRequest).toHaveBeenCalledWith(mockRequest.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockRequest_data,
        message: 'Lawyer request created successfully',
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {
        lawyer_id: 'lawyer-123',
        // missing client_id and title
      };

      await lawyerRequestController.createLawyerRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: client_id, lawyer_id, title',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Test',
      };

      (lawyerRequestService.createLawyerRequest as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.createLawyerRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create lawyer request',
        error: 'Database error',
      });
    });
  });

  describe('getLawyerRequestById', () => {
    it('should return lawyer request by id', async () => {
      mockRequest.params = { id: 'request-123' };

      const mockRequestData = {
        id: 'request-123',
        title: 'Test Request',
        status: 'pending',
      };

      (lawyerRequestService.getLawyerRequestById as jest.Mock).mockResolvedValue(mockRequestData);

      await lawyerRequestController.getLawyerRequestById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.getLawyerRequestById).toHaveBeenCalledWith('request-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockRequestData,
      });
    });

    it('should return 404 if request not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      (lawyerRequestService.getLawyerRequestById as jest.Mock).mockResolvedValue(null);

      await lawyerRequestController.getLawyerRequestById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Lawyer request not found',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: 'request-123' };

      (lawyerRequestService.getLawyerRequestById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.getLawyerRequestById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch lawyer request',
        error: 'Database error',
      });
    });
  });

  describe('getClientRequests', () => {
    it('should return client requests with pagination', async () => {
      mockRequest.params = { clientId: 'client-123' };
      mockRequest.query = { limit: '10', offset: '0', status: 'pending' };

      const mockResult = {
        requests: [
          { id: '1', title: 'Request 1' },
          { id: '2', title: 'Request 2' },
        ],
        total: 2,
      };

      (lawyerRequestService.getClientRequests as jest.Mock).mockResolvedValue(mockResult);

      await lawyerRequestController.getClientRequests(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.getClientRequests).toHaveBeenCalledWith(
        'client-123',
        'pending',
        10,
        0
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult.requests,
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
          page: 1,
          totalPages: 1,
        },
      });
    });

    it('should use default pagination values', async () => {
      mockRequest.params = { clientId: 'client-123' };
      mockRequest.query = {};

      (lawyerRequestService.getClientRequests as jest.Mock).mockResolvedValue({
        requests: [],
        total: 0,
      });

      await lawyerRequestController.getClientRequests(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.getClientRequests).toHaveBeenCalledWith(
        'client-123',
        undefined,
        20,
        0
      );
    });

    it('should handle service errors', async () => {
      mockRequest.params = { clientId: 'client-123' };

      (lawyerRequestService.getClientRequests as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.getClientRequests(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch client requests',
        error: 'Database error',
      });
    });
  });

  describe('getLawyerRequests', () => {
    it('should return lawyer requests with pagination', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };
      mockRequest.query = { limit: '15', offset: '30' };

      const mockResult = {
        requests: [{ id: '1', title: 'Request 1' }],
        total: 50,
      };

      (lawyerRequestService.getLawyerRequests as jest.Mock).mockResolvedValue(mockResult);

      await lawyerRequestController.getLawyerRequests(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.getLawyerRequests).toHaveBeenCalledWith(
        'lawyer-123',
        undefined,
        15,
        30
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult.requests,
        pagination: {
          total: 50,
          limit: 15,
          offset: 30,
          page: 3,
          totalPages: 4,
        },
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };

      (lawyerRequestService.getLawyerRequests as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.getLawyerRequests(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('acceptRequest', () => {
    it('should accept request successfully', async () => {
      mockRequest.params = { id: 'request-123' };

      const mockUpdatedRequest = {
        id: 'request-123',
        status: 'accepted',
      };

      (lawyerRequestService.acceptLawyerRequest as jest.Mock).mockResolvedValue(
        mockUpdatedRequest
      );

      await lawyerRequestController.acceptRequest(mockRequest as Request, mockResponse as Response);

      expect(lawyerRequestService.acceptLawyerRequest).toHaveBeenCalledWith('request-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedRequest,
        message: 'Request accepted successfully',
      });
    });

    it('should return 404 if request not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      (lawyerRequestService.acceptLawyerRequest as jest.Mock).mockRejectedValue(
        new Error('Request not found')
      );

      await lawyerRequestController.acceptRequest(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Request not found',
      });
    });

    it('should handle other errors', async () => {
      mockRequest.params = { id: 'request-123' };

      (lawyerRequestService.acceptLawyerRequest as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.acceptRequest(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to accept request',
        error: 'Database error',
      });
    });
  });

  describe('rejectRequest', () => {
    it('should reject request successfully', async () => {
      mockRequest.params = { id: 'request-123' };

      const mockUpdatedRequest = {
        id: 'request-123',
        status: 'rejected',
      };

      (lawyerRequestService.rejectLawyerRequest as jest.Mock).mockResolvedValue(
        mockUpdatedRequest
      );

      await lawyerRequestController.rejectRequest(mockRequest as Request, mockResponse as Response);

      expect(lawyerRequestService.rejectLawyerRequest).toHaveBeenCalledWith('request-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedRequest,
        message: 'Request rejected successfully',
      });
    });

    it('should return 404 if request not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      (lawyerRequestService.rejectLawyerRequest as jest.Mock).mockRejectedValue(
        new Error('Request not found')
      );

      await lawyerRequestController.rejectRequest(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });
  });

  describe('cancelRequest', () => {
    it('should cancel request successfully', async () => {
      mockRequest.params = { id: 'request-123' };

      const mockUpdatedRequest = {
        id: 'request-123',
        status: 'cancelled',
      };

      (lawyerRequestService.cancelLawyerRequest as jest.Mock).mockResolvedValue(
        mockUpdatedRequest
      );

      await lawyerRequestController.cancelRequest(mockRequest as Request, mockResponse as Response);

      expect(lawyerRequestService.cancelLawyerRequest).toHaveBeenCalledWith(
        'request-123',
        'user-123'
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedRequest,
        message: 'Request cancelled successfully',
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.params = { id: 'request-123' };
      mockRequest.user = undefined;

      await lawyerRequestController.cancelRequest(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(lawyerRequestService.cancelLawyerRequest).not.toHaveBeenCalled();
    });

    it('should return 404 if request cannot be cancelled', async () => {
      mockRequest.params = { id: 'request-123' };

      (lawyerRequestService.cancelLawyerRequest as jest.Mock).mockRejectedValue(
        new Error('Request not found or cannot be cancelled')
      );

      await lawyerRequestController.cancelRequest(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Request not found or cannot be cancelled',
      });
    });

    it('should handle other errors', async () => {
      mockRequest.params = { id: 'request-123' };

      (lawyerRequestService.cancelLawyerRequest as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.cancelRequest(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getClientRequestStats', () => {
    it('should return client request statistics', async () => {
      mockRequest.params = { clientId: 'client-123' };

      const mockStats = {
        total: 10,
        pending: 3,
        accepted: 5,
        rejected: 2,
      };

      (lawyerRequestService.getClientRequestStats as jest.Mock).mockResolvedValue(mockStats);

      await lawyerRequestController.getClientRequestStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.getClientRequestStats).toHaveBeenCalledWith('client-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should handle errors', async () => {
      mockRequest.params = { clientId: 'client-123' };

      (lawyerRequestService.getClientRequestStats as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.getClientRequestStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch client stats',
        error: 'Database error',
      });
    });
  });

  describe('getLawyerRequestStats', () => {
    it('should return lawyer request statistics', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };

      const mockStats = {
        total: 25,
        pending: 8,
        accepted: 15,
        rejected: 2,
      };

      (lawyerRequestService.getLawyerRequestStats as jest.Mock).mockResolvedValue(mockStats);

      await lawyerRequestController.getLawyerRequestStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.getLawyerRequestStats).toHaveBeenCalledWith('lawyer-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should handle errors', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };

      (lawyerRequestService.getLawyerRequestStats as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.getLawyerRequestStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteLawyerRequest', () => {
    it('should delete request successfully', async () => {
      mockRequest.params = { id: 'request-123' };

      (lawyerRequestService.deleteLawyerRequest as jest.Mock).mockResolvedValue(true);

      await lawyerRequestController.deleteLawyerRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(lawyerRequestService.deleteLawyerRequest).toHaveBeenCalledWith('request-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Request deleted successfully',
      });
    });

    it('should return 404 if request not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      (lawyerRequestService.deleteLawyerRequest as jest.Mock).mockResolvedValue(false);

      await lawyerRequestController.deleteLawyerRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Request not found',
      });
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: 'request-123' };

      (lawyerRequestService.deleteLawyerRequest as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await lawyerRequestController.deleteLawyerRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete request',
        error: 'Database error',
      });
    });
  });
});

