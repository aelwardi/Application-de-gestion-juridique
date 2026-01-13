import { pool } from '../../../src/config/database.config';
import { caseQueries } from '../../../src/database/queries/dossier.queries';

jest.mock('../../../src/config/database.config');

describe('Case Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCase', () => {
    it('should create a new case', async () => {
      const mockCase = {
        id: 'case-123',
        title: 'Test Case',
        case_number: 'CASE-001',
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        status: 'open',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockCase] });

      const result = await caseQueries.createCase({
        title: 'Test Case',
        description: 'Test description',
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        case_type: 'civil',
        priority: 'medium',
      });

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockCase);
    });
  });

  describe('getCaseById', () => {
    it('should get case by id', async () => {
      const mockCase = {
        id: 'case-123',
        title: 'Test Case',
        status: 'open',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockCase] });

      const result = await caseQueries.getCaseById('case-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockCase);
    });

    it('should return null if case not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await caseQueries.getCaseById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getCasesByClient', () => {
    it('should get cases for a client', async () => {
      const mockCases = [
        { id: 'case-1', client_id: 'client-123' },
        { id: 'case-2', client_id: 'client-123' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockCases });

      const result = await caseQueries.getCasesByClient('client-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockCases);
    });
  });

  describe('getCasesByLawyer', () => {
    it('should get cases for a lawyer', async () => {
      const mockCases = [
        { id: 'case-1', lawyer_id: 'lawyer-123' },
        { id: 'case-2', lawyer_id: 'lawyer-123' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockCases });

      const result = await caseQueries.getCasesByLawyer('lawyer-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockCases);
    });

    it('should filter by status', async () => {
      const mockCases = [
        { id: 'case-1', lawyer_id: 'lawyer-123', status: 'in_progress' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockCases });

      const result = await caseQueries.getCasesByLawyer('lawyer-123', { status: 'in_progress' as any });

      expect(result).toEqual(mockCases);
    });
  });

  describe('updateCase', () => {
    it('should update a case', async () => {
      const mockCase = {
        id: 'case-123',
        title: 'Updated Title',
        status: 'in_progress',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockCase] });

      const result = await caseQueries.updateCase('case-123', {
        title: 'Updated Title',
        status: 'in_progress',
      });

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockCase);
    });
  });

  describe('closeCase', () => {
    it('should close a case', async () => {
      const mockCase = {
        id: 'case-123',
        status: 'closed',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockCase] });

      const result = await caseQueries.closeCase('case-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result?.status).toBe('closed');
    });
  });

  describe('deleteCase', () => {
    it('should delete a case', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await caseQueries.deleteCase('case-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if case not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await caseQueries.deleteCase('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getAllCases', () => {
    it('should get all cases', async () => {
      const mockCases = [
        { id: 'case-1', title: 'Test 1' },
        { id: 'case-2', title: 'Test 2' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockCases });

      const result = await caseQueries.getAllCases();

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockCases);
    });
  });

  describe('getCaseStats', () => {
    it('should get case statistics', async () => {
      const mockStats = {
        total: '100',
        pending: '10',
        accepted: '15',
        in_progress: '25',
        on_hold: '5',
        resolved: '20',
        closed: '20',
        rejected: '3',
        archived: '2',
        priority_low: '30',
        priority_medium: '40',
        priority_high: '20',
        priority_urgent: '10',
      };

      const mockTypeStats = [
        { case_type: 'civil', count: '50' },
        { case_type: 'criminal', count: '30' },
        { case_type: 'family', count: '20' },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockStats] })
        .mockResolvedValueOnce({ rows: mockTypeStats });

      const result = await caseQueries.getCaseStats('lawyer-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result.total).toBe(100);
      expect(result.by_type).toHaveProperty('civil');
    });
  });

  describe('assignLawyer', () => {
    it('should assign a lawyer to a case', async () => {
      const mockCase = {
        id: 'case-123',
        lawyer_id: 'lawyer-456',
        status: 'in_progress',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockCase] });

      const result = await caseQueries.assignLawyer('case-123', 'lawyer-456');

      expect(pool.query).toHaveBeenCalled();
      expect(result?.lawyer_id).toBe('lawyer-456');
    });
  });
});
