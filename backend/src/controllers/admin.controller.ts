import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { z } from 'zod';

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().nullable().optional(),
});

/**
 * POST /api/admin/create-admin
 * Create a new admin user
 */
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createAdminSchema.parse(req.body);
    const creatorAdminId = req.user!.userId;

    const result = await adminService.createAdmin(
      validatedData.email,
      validatedData.password,
      validatedData.firstName,
      validatedData.lastName,
      validatedData.phone || null,
      creatorAdminId
    );

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: result.admin,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
    });
  }
};

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
    });
  }
};

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const result = await adminService.getUsers(page, limit, role, search, isActive);

    res.json({
      success: true,
      data: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

/**
 * GET /api/admin/users/:id
 * Get user details
 */
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await adminService.getUserDetails(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
    });
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Toggle user active status
 */
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;
    const adminId = req.user!.userId;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isActive must be a boolean',
      });
      return;
    }

    const result = await adminService.toggleUserStatus(userId, isActive, adminId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

/**
 * PATCH /api/admin/users/:id/verify
 * Verify user account
 */
export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const adminId = req.user!.userId;

    const result = await adminService.verifyUser(userId, adminId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify user',
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user account
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const adminId = req.user!.userId;

    if (userId === adminId) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
      return;
    }

    const result = await adminService.deleteUserAccount(userId, adminId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

/**
 * GET /api/admin/stats/growth
 * Get user growth statistics
 */
export const getUserGrowthStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await adminService.getUserGrowthStats(days);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch growth statistics',
    });
  }
};

/**
 * GET /api/admin/logs
 * Get activity logs
 */
export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId as string | undefined;

    const result = await adminService.getActivityLogs(page, limit, userId);

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
    });
  }
};

/**
 * POST /api/admin/email/bulk
 * Send bulk email to selected users
 */
export const sendBulkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, subject, message } = req.body;
    const adminId = req.user!.userId;

    if (!role || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'role, subject and message are required',
      });
      return;
    }

    const result = await adminService.sendBulkEmailByRole(role, subject, message, adminId);

    res.json({
      success: true,
      message: result.message,
      data: { sent: result.sent },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk email',
    });
  }
};

/**
 * GET /api/admin/export/users
 * Export users data as CSV
 */
export const exportUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.query.role as string | undefined;
    const result = await adminService.exportUsersData(role);

    const csv = [
      result.headers.join(','),
      ...result.data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export users data',
    });
  }
};