import * as lawyerIdResolver from '../../../src/utils/lawyer-id-resolver.util';
import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('LawyerIdResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveLawyerId', () => {
    it('should resolve valid lawyer user_id directly', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'user-123', role: 'avocat' }],
      });

      const result = await lawyerIdResolver.resolveLawyerId('user-123');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, role FROM users WHERE id = $1',
        ['user-123']
      );
      expect(result).toBe('user-123');
    });

    it('should resolve lawyer user_id with role "lawyer"', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'user-123', role: 'lawyer' }],
      });

      const result = await lawyerIdResolver.resolveLawyerId('user-123');

      expect(result).toBe('user-123');
    });

    it('should throw error if user is not a lawyer', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'user-123', role: 'client' }],
      });

      await expect(lawyerIdResolver.resolveLawyerId('user-123')).rejects.toThrow(
        'User user-123 is not a lawyer (role: client)'
      );
    });

    it('should resolve lawyers table id to user_id', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // No user found
        .mockResolvedValueOnce({ rows: [{ user_id: 'user-456' }] }); // Found in lawyers table

      const result = await lawyerIdResolver.resolveLawyerId('lawyer-id-123');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT user_id FROM lawyers WHERE id = $1',
        ['lawyer-id-123']
      );
      expect(result).toBe('user-456');
    });

    it('should throw error if lawyer_id is empty', async () => {
      await expect(lawyerIdResolver.resolveLawyerId('')).rejects.toThrow(
        'Lawyer ID is required'
      );
    });

    it('should throw error if lawyer not found in both tables', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(lawyerIdResolver.resolveLawyerId('unknown-id')).rejects.toThrow(
        'Lawyer with ID unknown-id not found in users or lawyers table'
      );
    });
  });

  describe('resolveLawyerIds', () => {
    it('should resolve multiple lawyer ids in parallel', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', role: 'avocat' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'user-2', role: 'avocat' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'user-3', role: 'avocat' }] });

      const result = await lawyerIdResolver.resolveLawyerIds(['user-1', 'user-2', 'user-3']);

      expect(result).toEqual(['user-1', 'user-2', 'user-3']);
      expect(pool.query).toHaveBeenCalledTimes(3);
    });

    it('should handle empty array', async () => {
      const result = await lawyerIdResolver.resolveLawyerIds([]);

      expect(result).toEqual([]);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should resolve mix of user_ids and lawyer_ids', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', role: 'avocat' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ user_id: 'user-2' }] });

      const result = await lawyerIdResolver.resolveLawyerIds(['user-1', 'lawyer-id-2']);

      expect(result).toEqual(['user-1', 'user-2']);
    });

    it('should throw error if any resolution fails', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', role: 'avocat' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(
        lawyerIdResolver.resolveLawyerIds(['user-1', 'invalid-id'])
      ).rejects.toThrow();
    });
  });

  describe('resolveLawyerIdOptional', () => {
    it('should resolve valid lawyer id', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'user-123', role: 'avocat' }],
      });

      const result = await lawyerIdResolver.resolveLawyerIdOptional('user-123');

      expect(result).toBe('user-123');
    });

    it('should return null for null input', async () => {
      const result = await lawyerIdResolver.resolveLawyerIdOptional(null);

      expect(result).toBeNull();
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return null for undefined input', async () => {
      const result = await lawyerIdResolver.resolveLawyerIdOptional(undefined);

      expect(result).toBeNull();
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return null if resolution fails', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await lawyerIdResolver.resolveLawyerIdOptional('invalid-id');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const result = await lawyerIdResolver.resolveLawyerIdOptional('user-123');

      expect(result).toBeNull();
    });
  });

  describe('getLawyerTableId', () => {
    it('should get lawyer table id from user_id', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'lawyer-table-id-123' }],
      });

      const result = await lawyerIdResolver.getLawyerTableId('user-123');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id FROM lawyers WHERE user_id = $1',
        ['user-123']
      );
      expect(result).toBe('lawyer-table-id-123');
    });

    it('should return null if no lawyer record found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      const result = await lawyerIdResolver.getLawyerTableId('user-123');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(lawyerIdResolver.getLawyerTableId('user-123')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('isLawyer', () => {
    it('should return true for lawyer user_id', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ role: 'avocat' }],
      });

      const result = await lawyerIdResolver.isLawyer('user-123');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT role FROM users WHERE id = $1',
        ['user-123']
      );
      expect(result).toBe(true);
    });

    it('should return true for role "lawyer"', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ role: 'lawyer' }],
      });

      const result = await lawyerIdResolver.isLawyer('user-123');

      expect(result).toBe(true);
    });

    it('should return false for non-lawyer user', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ role: 'client' }],
      });

      const result = await lawyerIdResolver.isLawyer('user-123');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });

      const result = await lawyerIdResolver.isLawyer('user-123');

      expect(result).toBe(false);
    });
  });
});