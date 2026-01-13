import * as adminService from '../../../src/services/admin.service';
import * as adminQueries from '../../../src/database/queries/admin.queries';
import * as authQueries from '../../../src/database/queries/auth.queries';
import * as emailUtil from '../../../src/utils/email.util';
import * as passwordUtil from '../../../src/utils/password.util';

jest.mock('../../../src/database/queries/admin.queries');
jest.mock('../../../src/database/queries/auth.queries');
jest.mock('../../../src/utils/email.util');
jest.mock('../../../src/utils/password.util');

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (emailUtil.sendEmail as jest.Mock).mockResolvedValue(undefined);
  });

  describe('createAdmin', () => {
    it('should create a new admin successfully', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'newadmin@example.com',
        role: 'admin',
        first_name: 'John',
        last_name: 'Doe',
      };

      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (authQueries.createUser as jest.Mock).mockResolvedValue(mockAdmin);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      const result = await adminService.createAdmin(
        'newadmin@example.com',
        'password123',
        'John',
        'Doe',
        '+33612345678',
        'creator-admin-123'
      );

      expect(authQueries.findUserByEmail).toHaveBeenCalledWith('newadmin@example.com');
      expect(passwordUtil.hashPassword).toHaveBeenCalledWith('password123');
      expect(authQueries.createUser).toHaveBeenCalledWith(
        'newadmin@example.com',
        'hashed-password',
        'admin',
        'John',
        'Doe',
        '+33612345678'
      );
      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'creator-admin-123',
        'ADMIN_CREATED',
        'user',
        'admin-123',
        null,
        null
      );
      expect(emailUtil.sendEmail).toHaveBeenCalled();
      expect(result).toEqual({ success: true, admin: mockAdmin });
    });

    it('should throw error if user already exists', async () => {
      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue({
        id: 'existing-123',
        email: 'existing@example.com',
      });

      await expect(
        adminService.createAdmin(
          'existing@example.com',
          'password123',
          'John',
          'Doe',
          null,
          'admin-123'
        )
      ).rejects.toThrow('A user with this email already exists');

      expect(passwordUtil.hashPassword).not.toHaveBeenCalled();
      expect(authQueries.createUser).not.toHaveBeenCalled();
    });

    it('should handle phone as null', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'newadmin@example.com',
        role: 'admin',
      };

      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (authQueries.createUser as jest.Mock).mockResolvedValue(mockAdmin);

      await adminService.createAdmin(
        'newadmin@example.com',
        'password123',
        'John',
        'Doe',
        null,
        'admin-123'
      );

      expect(authQueries.createUser).toHaveBeenCalledWith(
        'newadmin@example.com',
        'hashed-password',
        'admin',
        'John',
        'Doe',
        undefined
      );
    });

    it('should continue even if email fails', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'newadmin@example.com',
        role: 'admin',
      };

      (authQueries.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (authQueries.createUser as jest.Mock).mockResolvedValue(mockAdmin);
      (emailUtil.sendEmail as jest.Mock).mockRejectedValue(new Error('Email service down'));

      const result = await adminService.createAdmin(
        'newadmin@example.com',
        'password123',
        'John',
        'Doe',
        null,
        'admin-123'
      );

      expect(result).toEqual({ success: true, admin: mockAdmin });
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalUsers: 150,
        activeUsers: 120,
        totalLawyers: 50,
        totalClients: 80,
      };

      (adminQueries.getDashboardStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await adminService.getDashboardStats();

      expect(adminQueries.getDashboardStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('getUsers', () => {
    it('should get users with filters and pagination', async () => {
      const mockResult = {
        users: [
          { id: '1', email: 'user1@example.com', role: 'client' },
          { id: '2', email: 'user2@example.com', role: 'avocat' },
        ],
        total: 2,
      };

      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue(mockResult);

      const result = await adminService.getUsers(1, 20, 'client', 'search', true);

      expect(adminQueries.getAllUsers).toHaveBeenCalledWith(1, 20, 'client', 'search', true);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserDetails', () => {
    it('should return user details', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'client',
      };

      (adminQueries.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await adminService.getUserDetails('user-123');

      expect(adminQueries.getUserById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      (adminQueries.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(adminService.getUserDetails('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('toggleUserStatus', () => {
    it('should activate user', async () => {
      (adminQueries.updateUserStatus as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      const result = await adminService.toggleUserStatus('user-123', true, 'admin-123');

      expect(adminQueries.updateUserStatus).toHaveBeenCalledWith('user-123', true);
      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'admin-123',
        'USER_ACTIVATED',
        'user',
        'user-123',
        null,
        null
      );
      expect(result).toEqual({ success: true, message: 'User activated successfully' });
    });

    it('should deactivate user', async () => {
      (adminQueries.updateUserStatus as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      const result = await adminService.toggleUserStatus('user-123', false, 'admin-123');

      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'admin-123',
        'USER_DEACTIVATED',
        'user',
        'user-123',
        null,
        null
      );
      expect(result).toEqual({ success: true, message: 'User deactivated successfully' });
    });
  });

  describe('verifyUser', () => {
    it('should verify user and send email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        first_name: 'John',
      };

      (adminQueries.updateUserVerification as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await adminService.verifyUser('user-123', 'admin-123');

      expect(adminQueries.updateUserVerification).toHaveBeenCalledWith('user-123', true);
      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'admin-123',
        'USER_VERIFIED',
        'user',
        'user-123',
        null,
        null
      );
      expect(emailUtil.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Votre compte a été vérifié',
        })
      );
      expect(result).toEqual({ success: true, message: 'User verified successfully' });
    });

    it('should work even if user not found for email', async () => {
      (adminQueries.updateUserVerification as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.getUserById as jest.Mock).mockResolvedValue(null);

      const result = await adminService.verifyUser('user-123', 'admin-123');

      expect(result).toEqual({ success: true, message: 'User verified successfully' });
    });
  });

  describe('deleteUserAccount', () => {
    it('should delete user account', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        first_name: 'John',
      };

      (adminQueries.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.deleteUser as jest.Mock).mockResolvedValue(undefined);

      const result = await adminService.deleteUserAccount('user-123', 'admin-123');

      expect(adminQueries.getUserById).toHaveBeenCalledWith('user-123');
      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'admin-123',
        'USER_DELETED',
        'user',
        'user-123',
        null,
        null
      );
      expect(adminQueries.deleteUser).toHaveBeenCalledWith('user-123');
      expect(emailUtil.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Votre compte a été supprimé',
        })
      );
      expect(result).toEqual({ success: true, message: 'User deleted successfully' });
    });

    it('should throw error if user not found', async () => {
      (adminQueries.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(adminService.deleteUserAccount('nonexistent', 'admin-123')).rejects.toThrow(
        'User not found'
      );

      expect(adminQueries.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('getUserGrowthStats', () => {
    it('should return growth statistics', async () => {
      const mockStats = {
        daily: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-02', count: 8 },
        ],
      };

      (adminQueries.getUserGrowthStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await adminService.getUserGrowthStats(7);

      expect(adminQueries.getUserGrowthStats).toHaveBeenCalledWith(7);
      expect(result).toEqual(mockStats);
    });

    it('should use default days value', async () => {
      (adminQueries.getUserGrowthStats as jest.Mock).mockResolvedValue({});

      await adminService.getUserGrowthStats();

      expect(adminQueries.getUserGrowthStats).toHaveBeenCalledWith(30);
    });
  });

  describe('getActivityLogs', () => {
    it('should return activity logs', async () => {
      const mockLogs = {
        logs: [
          { id: '1', action: 'USER_CREATED' },
          { id: '2', action: 'USER_DELETED' },
        ],
        total: 2,
      };

      (adminQueries.getActivityLogs as jest.Mock).mockResolvedValue(mockLogs);

      const result = await adminService.getActivityLogs(1, 50, 'user-123');

      expect(adminQueries.getActivityLogs).toHaveBeenCalledWith(1, 50, 'user-123');
      expect(result).toEqual(mockLogs);
    });
  });

  describe('sendBulkEmailByRole', () => {
    it('should send bulk email to users by role', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', role: 'client' },
        { id: '2', email: 'user2@example.com', role: 'client' },
      ];

      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue({
        users: mockUsers,
        total: 2,
      });
      (emailUtil.sendEmail as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      const result = await adminService.sendBulkEmailByRole(
        'client',
        'Test Subject',
        'Test Message',
        'admin-123'
      );

      expect(adminQueries.getAllUsers).toHaveBeenCalledWith(1, 10000, 'client', undefined);
      expect(emailUtil.sendEmail).toHaveBeenCalledTimes(2);
      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'admin-123',
        'BULK_EMAIL_SENT',
        'email',
        null,
        null,
        null,
        expect.objectContaining({
          role: 'client',
          recipientsCount: 2,
          successCount: 2,
        })
      );
      expect(result.sent).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should handle "all" role', async () => {
      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue({
        users: [{ id: '1', email: 'user@example.com' }],
        total: 1,
      });

      await adminService.sendBulkEmailByRole('all', 'Subject', 'Message', 'admin-123');

      expect(adminQueries.getAllUsers).toHaveBeenCalledWith(1, 10000, undefined, undefined);
    });

    it('should return message if no users found', async () => {
      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue({
        users: [],
        total: 0,
      });

      const result = await adminService.sendBulkEmailByRole('client', 'Subject', 'Message', 'admin-123');

      expect(result).toEqual({
        success: true,
        message: 'No users found for this role',
        sent: 0,
      });
      expect(emailUtil.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle partial email failures', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
        { id: '3', email: 'user3@example.com' },
      ];

      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue({
        users: mockUsers,
        total: 3,
      });

      (emailUtil.sendEmail as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Email failed'))
        .mockResolvedValueOnce(undefined);

      const result = await adminService.sendBulkEmailByRole('client', 'Subject', 'Message', 'admin-123');

      expect(result.sent).toBe(2);
      expect(result.total).toBe(3);
    });
  });

  describe('sendBulkEmail (legacy)', () => {
    it('should send bulk email to specific user IDs', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ];

      (adminQueries.getUserById as jest.Mock)
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(mockUsers[1]);
      (emailUtil.sendEmail as jest.Mock).mockResolvedValue(undefined);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      const result = await adminService.sendBulkEmail(
        ['1', '2'],
        'Subject',
        '<html>Content</html>',
        'admin-123'
      );

      expect(adminQueries.getUserById).toHaveBeenCalledTimes(2);
      expect(emailUtil.sendEmail).toHaveBeenCalledTimes(2);
      expect(result.sent).toBe(2);
    });

    it('should filter out null users', async () => {
      (adminQueries.getUserById as jest.Mock)
        .mockResolvedValueOnce({ id: '1', email: 'user1@example.com' })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '3', email: 'user3@example.com' });

      const result = await adminService.sendBulkEmail(
        ['1', '2', '3'],
        'Subject',
        '<html>Content</html>',
        'admin-123'
      );

      expect(emailUtil.sendEmail).toHaveBeenCalledTimes(2);
      expect(result.sent).toBe(2);
    });
  });

  describe('exportUsersData', () => {
    it('should export all users data', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          role: 'client',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+33612345678',
          is_active: true,
          is_verified: true,
          created_at: new Date('2024-01-01'),
        },
        {
          id: '2',
          email: 'user2@example.com',
          role: 'avocat',
          first_name: 'Jane',
          last_name: 'Smith',
          phone: null,
          is_active: false,
          is_verified: false,
          created_at: new Date('2024-01-02'),
        },
      ];

      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      const result = await adminService.exportUsersData();

      expect(adminQueries.getAllUsers).toHaveBeenCalledWith(1, 10000, undefined);
      expect(result.headers).toEqual([
        'ID',
        'Email',
        'Role',
        'First Name',
        'Last Name',
        'Phone',
        'Active',
        'Verified',
        'Created At',
      ]);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual([
        '1',
        'user1@example.com',
        'client',
        'John',
        'Doe',
        '+33612345678',
        'Yes',
        'Yes',
        '2024-01-01T00:00:00.000Z',
      ]);
      expect(result.data[1][6]).toBe('No');
      expect(result.data[1][7]).toBe('No');
    });

    it('should export users filtered by role', async () => {
      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue({
        users: [],
        total: 0,
      });

      await adminService.exportUsersData('avocat');

      expect(adminQueries.getAllUsers).toHaveBeenCalledWith(1, 10000, 'avocat');
    });

    it('should handle null phone numbers', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user@example.com',
          role: 'client',
          first_name: 'John',
          last_name: 'Doe',
          phone: null,
          is_active: true,
          is_verified: true,
          created_at: new Date(),
        },
      ];

      (adminQueries.getAllUsers as jest.Mock).mockResolvedValue({
        users: mockUsers,
        total: 1,
      });

      const result = await adminService.exportUsersData();

      expect(result.data[0][5]).toBe('');
    });
  });
});