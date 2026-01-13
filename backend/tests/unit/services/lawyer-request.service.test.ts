import {
  createLawyerRequest,
  getLawyerRequestById,
  acceptLawyerRequest,
  rejectLawyerRequest,
  cancelLawyerRequest,
  getLawyerRequestStats,
} from '../../../src/services/lawyer-request.service';
import { pool } from '../../../src/config/database.config';
import {
  sendNewRequestToLawyer,
  sendRequestAcceptedToClient,
  sendRequestRejectedToClient,
} from '../../../src/utils/email.util';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/config/database.config');
jest.mock('../../../src/utils/email.util');
jest.mock('uuid');

describe('LawyerRequestService', () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
    (uuidv4 as jest.Mock).mockReturnValue('uuid-1234');
    (sendNewRequestToLawyer as jest.Mock).mockResolvedValue(true);
    (sendRequestAcceptedToClient as jest.Mock).mockResolvedValue(true);
    (sendRequestRejectedToClient as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLawyerRequest', () => {
    it('should create a lawyer request successfully', async () => {
      const mockRequest = {
        id: 'uuid-1234',
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        title: 'Legal Consultation',
        description: 'Need legal advice',
        status: 'pending',
      };

      const mockUserData = {
        client_first_name: 'Jean',
        client_last_name: 'Dupont',
        lawyer_first_name: 'Marie',
        lawyer_last_name: 'Martin',
        lawyer_email: 'lawyer@test.com',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockRequest] })
        .mockResolvedValueOnce({ rows: [mockUserData] });

      const input = {
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        request_type: 'consultation',
        title: 'Legal Consultation',
        description: 'Need legal advice',
        case_category: 'civil',
        urgency: 'medium' as const,
      };

      const result = await createLawyerRequest(input);

      expect(result).toEqual(mockRequest);
      expect(sendNewRequestToLawyer).toHaveBeenCalledWith(
        'lawyer@test.com',
        'Marie',
        'Jean Dupont',
        'Legal Consultation',
        'Need legal advice',
        'medium',
        'civil'
      );
    });

    it('should use default urgency if not provided', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'uuid-1234' }] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        request_type: 'consultation',
        title: 'Test',
        description: 'Test',
        case_category: 'civil',
      };

      await createLawyerRequest(input);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['medium'])
      );
    });
  });

  describe('getLawyerRequestById', () => {
    it('should return a request by id', async () => {
      const mockRequest = {
        id: 'req-1',
        title: 'Legal Consultation',
        client_first_name: 'Jean',
      };

      mockQuery.mockResolvedValue({ rows: [mockRequest] });

      const result = await getLawyerRequestById('req-1');

      expect(result).toEqual(mockRequest);
    });

    it('should return null if request not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await getLawyerRequestById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('acceptLawyerRequest', () => {
    it('should accept a request', async () => {
      const mockRequest = { id: 'req-1', status: 'accepted' };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockRequest] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await acceptLawyerRequest('req-1');

      expect(result).toEqual(mockRequest);
    });

    it('should throw error if request not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await expect(acceptLawyerRequest('req-1')).rejects.toThrow('Request not found');
    });
  });

  describe('rejectLawyerRequest', () => {
    it('should reject a request', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 'req-1', status: 'rejected' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await rejectLawyerRequest('req-1');

      expect(result.status).toBe('rejected');
    });

    it('should throw error if request not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await expect(rejectLawyerRequest('req-1')).rejects.toThrow('Request not found');
    });
  });

  describe('cancelLawyerRequest', () => {
    it('should cancel a request by client', async () => {
      const mockRequest = { id: 'req-1', status: 'cancelled' };
      mockQuery.mockResolvedValue({ rows: [mockRequest] });

      const result = await cancelLawyerRequest('req-1', 'client-1');

      expect(result).toEqual(mockRequest);
    });

    it('should throw error if request not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await expect(cancelLawyerRequest('req-1', 'client-1')).rejects.toThrow();
    });
  });

  describe('getLawyerRequestStats', () => {
    it('should return request statistics', async () => {
      const mockStats = {
        total: '10',
        pending: '3',
        accepted: '5',
        rejected: '1',
        cancelled: '1',
      };

      mockQuery.mockResolvedValue({ rows: [mockStats] });

      const result = await getLawyerRequestStats('lawyer-1');

      expect(result.total).toBe(10);
      expect(result.pending).toBe(3);
    });
  });
});