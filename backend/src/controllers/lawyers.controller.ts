import { Request, Response } from 'express';
import * as lawyersService from '../services/lawyers.service';
import * as adminQueries from '../database/queries/admin.queries';

/**
 * GET /api/admin/lawyers
 * Get all lawyers
 */
export const getLawyers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const verified = req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined;
    const city = req.query.city as string | undefined;
    const specialty = req.query.specialty as string | undefined;

    const result = await lawyersService.getAllLawyers(page, limit, verified, city, specialty);

    res.json({
      success: true,
      data: result.lawyers,
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
      message: 'Failed to fetch lawyers',
    });
  }
};

/**
 * GET /api/admin/lawyers/:id
 * Get lawyer details
 */
export const getLawyerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.params.id;
    const lawyer = await lawyersService.getLawyerDetails(lawyerId);

    res.json({
      success: true,
      data: lawyer,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Lawyer not found') {
      res.status(404).json({
        success: false,
        message: 'Lawyer not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer details',
    });
  }
};

/**
 * PATCH /api/admin/lawyers/:id/verify
 * Verify lawyer
 */
export const verifyLawyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.params.id;
    const adminId = req.user!.userId;

    await lawyersService.verifyLawyer(lawyerId, adminId);

    try {
      await adminQueries.createActivityLog(
        adminId,
        'LAWYER_VERIFIED',
        'user',
        lawyerId,
        req.ip || req.socket.remoteAddress || null,
        req.get('user-agent') || null,
        { verified_by: adminId, lawyer_id: lawyerId }
      );
    } catch (logError) {
      console.error('Failed to log LAWYER_VERIFIED activity:', logError);
    }

    res.json({
      success: true,
      message: 'Lawyer verified successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Lawyer not found') {
      res.status(404).json({
        success: false,
        message: 'Lawyer not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify lawyer',
    });
  }
};


/**
 * GET /api/admin/stats/comprehensive
 * Get comprehensive statistics
 */
export const getComprehensiveStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await lawyersService.getComprehensiveStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comprehensive statistics',
    });
  }
};

/**
 * GET /api/admin/reviews/pending
 * Get pending reviews for moderation
 */
export const getPendingReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await lawyersService.getPendingReviews(page, limit);

    res.json({
      success: true,
      data: result.reviews,
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
      message: 'Failed to fetch pending reviews',
    });
  }
};

/**
 * PATCH /api/admin/reviews/:id/approve
 * Approve review
 */
export const approveReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.id;
    const adminId = req.user!.userId;

    await lawyersService.approveReview(reviewId, adminId);

    res.json({
      success: true,
      message: 'Review approved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve review',
    });
  }
};

/**
 * PATCH /api/admin/reviews/:id/reject
 * Reject review
 */
export const rejectReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.id;
    const adminId = req.user!.userId;

    await lawyersService.rejectReview(reviewId, adminId);

    res.json({
      success: true,
      message: 'Review rejected successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject review',
    });
  }
};

/**
 * GET /api/admin/specialties
 * Get all specialties
 */
export const getSpecialties = async (req: Request, res: Response): Promise<void> => {
  try {
    const specialties = await lawyersService.getSpecialties();

    res.json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties',
    });
  }
};

/**
 * GET /api/lawyers/:id/availability
 * Get lawyer availability slots
 */
export const getLawyerAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.params.id;
    const availability = await lawyersService.getLawyerAvailability(lawyerId);

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer availability',
    });
  }
};

/**
 * POST /api/lawyers/:id/availability
 * Create availability slot for lawyer
 */
export const createAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.params.id;
    const { dayOfWeek, startTime, endTime } = req.body;

    if (!dayOfWeek || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'dayOfWeek, startTime, and endTime are required',
      });
      return;
    }

    const availability = await lawyersService.createAvailability(lawyerId, dayOfWeek, startTime, endTime);

    res.status(201).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create availability slot',
    });
  }
};

/**
 * GET /api/lawyers/:id/reviews
 * Get lawyer reviews
 */
export const getLawyerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const reviews = await lawyersService.getLawyerReviews(lawyerId, page, limit);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer reviews',
    });
  }
};

/**
 * GET /api/lawyers/:id/cases
 * Get lawyer cases
 */
export const getLawyerCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.params.id;
    const status = req.query.status as string | undefined;

    const cases = await lawyersService.getLawyerCases(lawyerId, status);

    res.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer cases',
    });
  }
};