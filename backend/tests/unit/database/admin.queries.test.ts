import { pool } from '../../../src/config/database.config';
import * as adminQueries from '../../../src/database/queries/admin.queries';

jest.mock('../../../src/config/database.config');

describe('Admin Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should retrieve admin statistics', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '100' }] }) // totalUsers
        .mockResolvedValueOnce({ rows: [{ count: '30' }] }) // totalLawyers
        .mockResolvedValueOnce({ rows: [{ count: '70' }] }) // totalClients
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // totalCollaborators
        .mockResolvedValueOnce({ rows: [{ count: '90' }] }) // activeUsers
        .mockResolvedValueOnce({ rows: [{ count: '15' }] }) // newUsersThisMonth
        .mockResolvedValueOnce({ rows: [{ count: '50' }] }) // totalCases
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // newCasesThisMonth
        .mockResolvedValueOnce({ rows: [{ count: '200' }] }) // totalAppointments
        .mockResolvedValueOnce({ rows: [{ count: '150' }] }); // totalMessages

      const result = await adminQueries.getDashboardStats();

      expect(pool.query).toHaveBeenCalled();
      expect(result).toHaveProperty('totalUsers');
      expect(result.totalUsers).toBe(100);
    });
  });

  describe('getAllUsers', () => {
    it('should get all users with pagination', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com', role: 'client' },
        { id: 'user-2', email: 'user2@example.com', role: 'lawyer' },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '50' }] })
        .mockResolvedValueOnce({ rows: mockUsers });

      const result = await adminQueries.getAllUsers(1, 20);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(50);
    });

    it('should filter users by role', async () => {
      const mockLawyers = [
        { id: 'lawyer-1', role: 'lawyer' },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '30' }] })
        .mockResolvedValueOnce({ rows: mockLawyers });

      const result = await adminQueries.getAllUsers(1, 20, 'lawyer');

      expect(result.users).toEqual(mockLawyers);
      expect(result.total).toBe(30);
    });

    it('should search users', async () => {
      const mockResults = [
        { id: 'user-1', first_name: 'John', last_name: 'Doe' },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: mockResults });

      const result = await adminQueries.getAllUsers(1, 20, undefined, 'john');

      expect(result.users).toEqual(mockResults);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status to active', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      await adminQueries.updateUserStatus('user-123', true);

      expect(pool.query).toHaveBeenCalled();
    });

    it('should update user status to inactive', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      await adminQueries.updateUserStatus('user-123', false);

      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      await adminQueries.deleteUser('user-123');

      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('getActivityLogs', () => {
    it('should retrieve activity logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          user_id: 'user-1',
          action: 'login',
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '100' }] })
        .mockResolvedValueOnce({ rows: mockLogs });

      const result = await adminQueries.getActivityLogs(1, 20);

      expect(result.logs).toEqual(mockLogs);
      expect(result.total).toBe(100);
    });

    it('should filter logs by user', async () => {
      const mockLogs = [
        { id: 'log-1', user_id: 'user-123' },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: mockLogs });

      const result = await adminQueries.getActivityLogs(1, 20, 'user-123');

      expect(result.logs[0].user_id).toBe('user-123');
    });
  });

  describe('createActivityLog', () => {
    it('should create an activity log', async () => {
      const mockLog = {
        id: 'log-new',
        user_id: 'user-123',
        action: 'login',
        details: 'User logged in',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockLog] });

      await adminQueries.createActivityLog(
        'user-123',
        'login',
        'User logged in',
        '127.0.0.1',
        'admin-123',
        'Chrome'
      );

      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'client',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const result = await adminQueries.getUserById('user-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await adminQueries.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
