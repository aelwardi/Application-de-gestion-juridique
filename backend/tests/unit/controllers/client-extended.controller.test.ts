import { Request, Response } from 'express';

// Create mock service instance BEFORE any imports that might use it
const mockServiceInstance = {
  createClientRequest: jest.fn(),
  getClientRequestById: jest.fn(),
  getClientRequestsByClientId: jest.fn(),
  updateClientRequest: jest.fn(),
  deleteClientRequest: jest.fn(),
  createClientNote: jest.fn(),
  getClientNotesByClientId: jest.fn(),
  getPendingReminders: jest.fn(),
  createClientPayment: jest.fn(),
  getClientPaymentsByClientId: jest.fn(),
  getClientFinancialSummary: jest.fn(),
  getOverduePayments: jest.fn(),
  createClientCommunication: jest.fn(),
  getClientCommunicationsByClientId: jest.fn(),
  getClientActivitySummary: jest.fn(),
  getPendingFollowUps: jest.fn(),
};

// Mock the service module BEFORE importing the controller
jest.mock('../../../src/services', () => ({
  ClientExtendedService: jest.fn().mockImplementation(() => mockServiceInstance),
}));

// NOW import the controller
import { ClientExtendedController } from '../../../src/controllers/client-extended.controller';

describe('ClientExtendedController', () => {
  let controller: ClientExtendedController;
  let mockService: typeof mockServiceInstance;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockService = mockServiceInstance;
    controller = new ClientExtendedController();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Client Requests', () => {
    it('should create a client request', async () => {
      const mockRequest = { id: 'req-1', title: 'Test' };
      mockService.createClientRequest.mockResolvedValue(mockRequest as any);

      const req = {
        body: {
          client_id: 'client-1',
          request_type: 'consultation',
          title: 'Test',
          description: 'Description',
        },
      } as Request;

      await controller.createClientRequest(req, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    it('should get client request by id', async () => {
      const mockRequest = { id: 'req-1' };
      mockService.getClientRequestById.mockResolvedValue(mockRequest as any);

      const req = { params: { id: 'req-1' } } as any;

      await controller.getClientRequestById(req, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('Client Notes', () => {
    it('should get client notes', async () => {
      mockService.getClientNotesByClientId.mockResolvedValue({
        notes: [{ id: 'note-1' }],
        total: 5,
      } as any);

      const req = { params: { clientId: 'client-1' }, query: {} } as any;

      await controller.getClientNotes(req, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should get pending reminders', async () => {
      mockService.getPendingReminders.mockResolvedValue([{ id: 'note-1' }] as any);

      const req = { params: { lawyerId: 'lawyer-1' } } as any;

      await controller.getPendingReminders(req, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('Client Payments', () => {
    it('should get financial summary', async () => {
      const mockSummary = {
        total_billed: 10000,
        total_paid: 7000,
        total_pending: 2000,
        total_overdue: 1000,
        payment_history: [],
      };
      mockService.getClientFinancialSummary.mockResolvedValue(mockSummary as any);

      const req = { params: { clientId: 'client-1' } } as any;

      await controller.getClientFinancialSummary(req, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should get overdue payments', async () => {
      mockService.getOverduePayments.mockResolvedValue([{ id: 'payment-1' }] as any);

      const req = { params: { lawyerId: 'lawyer-1' } } as any;

      await controller.getOverduePayments(req, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('Client Communications', () => {
    it('should get activity summary', async () => {
      const mockSummary = {
        total_communications: 50,
        last_contact_date: '2026-01-13',
        pending_follow_ups: 3,
        upcoming_reminders: 0,
        communication_breakdown: {
          email: 20,
          phone: 15,
          meeting: 10,
          sms: 3,
          video_call: 2,
          other: 0,
        },
      };
      mockService.getClientActivitySummary.mockResolvedValue(mockSummary as any);

      const req = { params: { clientId: 'client-1' } } as any;

      await controller.getClientActivitySummary(req, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });
});

