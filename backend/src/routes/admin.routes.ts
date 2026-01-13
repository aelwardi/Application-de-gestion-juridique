import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as lawyersController from '../controllers/lawyers.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

/**
 * Dashboard & Statistics
 */
router.get('/stats', adminController.getDashboardStats);
router.get('/stats/growth', adminController.getUserGrowthStats);
router.get('/stats/comprehensive', lawyersController.getComprehensiveStats);

/**
 * Admin Management
 */
router.post('/create-admin', adminController.createAdmin);

/**
 * User Management
 */
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.patch('/users/:id/verify', adminController.verifyUser);
router.delete('/users/:id', adminController.deleteUser);

/**
 * Lawyers Management
 */
router.get('/lawyers', lawyersController.getLawyers);
router.get('/lawyers/:id', lawyersController.getLawyerDetails);
router.patch('/lawyers/:id/verify', lawyersController.verifyLawyer);
router.get('/specialties', lawyersController.getSpecialties);


/**
 * Reviews Moderation
 */
router.get('/reviews/pending', lawyersController.getPendingReviews);
router.patch('/reviews/:id/approve', lawyersController.approveReview);
router.patch('/reviews/:id/reject', lawyersController.rejectReview);

/**
 * Activity Logs
 */
router.get('/logs', adminController.getActivityLogs);

/**
 * Lawyer Requests
 */
router.get('/lawyer-requests', adminController.getLawyerRequests);

/**
 * Reports
 */
router.get('/reports', adminController.getReports);

/**
 * Activity Logs
 */
router.get('/activity-logs', adminController.getActivityLogs);

/**
 * Bulk Operations
 */
router.post('/email/bulk', adminController.sendBulkEmail);

/**
 * Export
 */
router.get('/export/users', adminController.exportUsers);

export default router;