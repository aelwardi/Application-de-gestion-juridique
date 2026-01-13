import { Request, Response } from 'express';
import * as adminController from '../../../src/controllers/admin.controller';
import * as adminService from '../../../src/services/admin.service';

jest.mock('../../../src/services/admin.service');

describe('AdminController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let setHeaderMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    setHeaderMock = jest.fn();
    sendMock = jest.fn();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      },
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
      send: sendMock,
    };

    jest.clearAllMocks();
  });

  describe('createAdmin', () => {
    it('should create admin successfully', async () => {
      mockRequest.body = {
        email: 'newadmin@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+33612345678',
      };

      const mockAdmin = {
        id: 'new-admin-123',
        email: 'newadmin@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
      };

      (adminService.createAdmin as jest.Mock).mockResolvedValue({
        success: true,
        admin: mockAdmin,
      });

      await adminController.createAdmin(mockRequest as Request, mockResponse as Response);

      expect(adminService.createAdmin).toHaveBeenCalledWith(
        'newadmin@example.com',
        'SecurePassword123!',
        'John',
        'Doe',
        '+33612345678',
        'admin-123'
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Admin created successfully',
        data: mockAdmin,
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'short',
        firstName: '',
        lastName: 'Doe',
      };

      await adminController.createAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
        })
      );
    });

    it('should handle duplicate email error', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      (adminService.createAdmin as jest.Mock).mockRejectedValue(
        new Error('A user with this email already exists')
      );

      await adminController.createAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'A user with this email already exists',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        email: 'admin@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      (adminService.createAdmin as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.createAdmin(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create admin',
      });
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalUsers: 150,
        activeUsers: 120,
        totalLawyers: 50,
        totalClients: 80,
        totalAppointments: 200,
      };

      (adminService.getDashboardStats as jest.Mock).mockResolvedValue(mockStats);

      await adminController.getDashboardStats(mockRequest as Request, mockResponse as Response);

      expect(adminService.getDashboardStats).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should handle errors when fetching stats', async () => {
      (adminService.getDashboardStats as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getDashboardStats(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch dashboard statistics',
      });
    });
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      mockRequest.query = {
        page: '2',
        limit: '10',
      };

      const mockResult = {
        users: [
          { id: '1', email: 'user1@example.com', role: 'client' },
          { id: '2', email: 'user2@example.com', role: 'avocat' },
        ],
        total: 25,
      };

      (adminService.getUsers as jest.Mock).mockResolvedValue(mockResult);

      await adminController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(adminService.getUsers).toHaveBeenCalledWith(2, 10, undefined, undefined, undefined);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult.users,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it('should apply filters correctly', async () => {
      mockRequest.query = {
        page: '1',
        limit: '20',
        role: 'avocat',
        search: 'john',
        isActive: 'true',
      };

      const mockResult = {
        users: [{ id: '1', email: 'john@example.com', role: 'avocat' }],
        total: 1,
      };

      (adminService.getUsers as jest.Mock).mockResolvedValue(mockResult);

      await adminController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(adminService.getUsers).toHaveBeenCalledWith(1, 20, 'avocat', 'john', true);
    });

    it('should use default pagination values', async () => {
      mockRequest.query = {};

      const mockResult = { users: [], total: 0 };
      (adminService.getUsers as jest.Mock).mockResolvedValue(mockResult);

      await adminController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(adminService.getUsers).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
    });

    it('should handle errors', async () => {
      (adminService.getUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch users',
      });
    });
  });

  describe('getUserDetails', () => {
    it('should return user details', async () => {
      mockRequest.params = { id: 'user-123' };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        role: 'client',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (adminService.getUserDetails as jest.Mock).mockResolvedValue(mockUser);

      await adminController.getUserDetails(mockRequest as Request, mockResponse as Response);

      expect(adminService.getUserDetails).toHaveBeenCalledWith('user-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      (adminService.getUserDetails as jest.Mock).mockRejectedValue(new Error('User not found'));

      await adminController.getUserDetails(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: 'user-123' };

      (adminService.getUserDetails as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getUserDetails(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch user details',
      });
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status successfully', async () => {
      mockRequest.params = { id: 'user-123' };
      mockRequest.body = { isActive: false };

      (adminService.toggleUserStatus as jest.Mock).mockResolvedValue({
        message: 'User status updated successfully',
      });

      await adminController.toggleUserStatus(mockRequest as Request, mockResponse as Response);

      expect(adminService.toggleUserStatus).toHaveBeenCalledWith('user-123', false, 'admin-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'User status updated successfully',
      });
    });

    it('should return 400 if isActive is not boolean', async () => {
      mockRequest.params = { id: 'user-123' };
      mockRequest.body = { isActive: 'invalid' };

      await adminController.toggleUserStatus(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'isActive must be a boolean',
      });
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: 'user-123' };
      mockRequest.body = { isActive: true };

      (adminService.toggleUserStatus as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.toggleUserStatus(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update user status',
      });
    });
  });

  describe('verifyUser', () => {
    it('should verify user successfully', async () => {
      mockRequest.params = { id: 'user-123' };

      (adminService.verifyUser as jest.Mock).mockResolvedValue({
        message: 'User verified successfully',
      });

      await adminController.verifyUser(mockRequest as Request, mockResponse as Response);

      expect(adminService.verifyUser).toHaveBeenCalledWith('user-123', 'admin-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'User verified successfully',
      });
    });

    it('should handle errors', async () => {
      mockRequest.params = { id: 'user-123' };

      (adminService.verifyUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.verifyUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to verify user',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: 'user-123' };

      (adminService.deleteUserAccount as jest.Mock).mockResolvedValue({
        message: 'User deleted successfully',
      });

      await adminController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(adminService.deleteUserAccount).toHaveBeenCalledWith('user-123', 'admin-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully',
      });
    });

    it('should prevent admin from deleting their own account', async () => {
      mockRequest.params = { id: 'admin-123' };

      await adminController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(adminService.deleteUserAccount).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'You cannot delete your own account',
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      (adminService.deleteUserAccount as jest.Mock).mockRejectedValue(new Error('User not found'));

      await adminController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: 'user-123' };

      (adminService.deleteUserAccount as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete user',
      });
    });
  });

  describe('getUserGrowthStats', () => {
    it('should return growth statistics', async () => {
      mockRequest.query = { days: '7' };

      const mockStats = {
        daily: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-02', count: 8 },
        ],
      };

      (adminService.getUserGrowthStats as jest.Mock).mockResolvedValue(mockStats);

      await adminController.getUserGrowthStats(mockRequest as Request, mockResponse as Response);

      expect(adminService.getUserGrowthStats).toHaveBeenCalledWith(7);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should use default days value', async () => {
      mockRequest.query = {};

      (adminService.getUserGrowthStats as jest.Mock).mockResolvedValue({});

      await adminController.getUserGrowthStats(mockRequest as Request, mockResponse as Response);

      expect(adminService.getUserGrowthStats).toHaveBeenCalledWith(30);
    });

    it('should handle errors', async () => {
      (adminService.getUserGrowthStats as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getUserGrowthStats(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch growth statistics',
      });
    });
  });

  describe('getActivityLogs', () => {
    it('should return activity logs with pagination', async () => {
      mockRequest.query = {
        page: '1',
        limit: '50',
      };

      const mockResult = {
        logs: [
          { id: '1', action: 'USER_CREATED', timestamp: new Date() },
          { id: '2', action: 'USER_DELETED', timestamp: new Date() },
        ],
        total: 100,
      };

      (adminService.getActivityLogs as jest.Mock).mockResolvedValue(mockResult);

      await adminController.getActivityLogs(mockRequest as Request, mockResponse as Response);

      expect(adminService.getActivityLogs).toHaveBeenCalledWith(1, 50, undefined);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult.logs,
        pagination: {
          page: 1,
          limit: 50,
          total: 100,
          totalPages: 2,
        },
      });
    });

    it('should filter by userId', async () => {
      mockRequest.query = {
        userId: 'user-123',
      };

      const mockResult = { logs: [], total: 0 };
      (adminService.getActivityLogs as jest.Mock).mockResolvedValue(mockResult);

      await adminController.getActivityLogs(mockRequest as Request, mockResponse as Response);

      expect(adminService.getActivityLogs).toHaveBeenCalledWith(1, 50, 'user-123');
    });

    it('should handle errors', async () => {
      (adminService.getActivityLogs as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getActivityLogs(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch activity logs',
      });
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk email successfully', async () => {
      mockRequest.body = {
        role: 'client',
        subject: 'Important Update',
        message: 'This is an important announcement.',
      };

      (adminService.sendBulkEmailByRole as jest.Mock).mockResolvedValue({
        message: 'Bulk email sent successfully',
        sent: 50,
      });

      await adminController.sendBulkEmail(mockRequest as Request, mockResponse as Response);

      expect(adminService.sendBulkEmailByRole).toHaveBeenCalledWith(
        'client',
        'Important Update',
        'This is an important announcement.',
        'admin-123'
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Bulk email sent successfully',
        data: { sent: 50 },
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {
        role: 'client',
        subject: 'Test',
      };

      await adminController.sendBulkEmail(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'role, subject and message are required',
      });
    });

    it('should handle errors', async () => {
      mockRequest.body = {
        role: 'client',
        subject: 'Test',
        message: 'Test message',
      };

      (adminService.sendBulkEmailByRole as jest.Mock).mockRejectedValue(
        new Error('Email service unavailable')
      );

      await adminController.sendBulkEmail(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Email service unavailable',
      });
    });
  });

  describe('exportUsers', () => {
    it('should export users as CSV', async () => {
      const mockResult = {
        headers: ['ID', 'Email', 'Role', 'Created At'],
        data: [
          ['1', 'user1@example.com', 'client', '2024-01-01'],
          ['2', 'user2@example.com', 'avocat', '2024-01-02'],
        ],
      };

      (adminService.exportUsersData as jest.Mock).mockResolvedValue(mockResult);

      await adminController.exportUsers(mockRequest as Request, mockResponse as Response);

      expect(adminService.exportUsersData).toHaveBeenCalledWith(undefined);
      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename=users-export-')
      );
      expect(sendMock).toHaveBeenCalledWith(expect.stringContaining('ID,Email,Role'));
    });

    it('should filter by role when exporting', async () => {
      mockRequest.query = { role: 'avocat' };

      const mockResult = {
        headers: ['ID', 'Email'],
        data: [['1', 'lawyer@example.com']],
      };

      (adminService.exportUsersData as jest.Mock).mockResolvedValue(mockResult);

      await adminController.exportUsers(mockRequest as Request, mockResponse as Response);

      expect(adminService.exportUsersData).toHaveBeenCalledWith('avocat');
    });

    it('should handle errors', async () => {
      (adminService.exportUsersData as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.exportUsers(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to export users data',
      });
    });
  });
});

