import { Request, Response } from 'express';
import * as lawyersService from '../services/lawyers.service';

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
    console.error('Get lawyers error:', error);
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

    console.error('Get lawyer details error:', error);
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

    console.error('Verify lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify lawyer',
    });
  }
};

/**
 * GET /api/admin/cases
 * Get all cases
 */
export const getCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;

    const result = await lawyersService.getAllCases(page, limit, status, priority);

    res.json({
      success: true,
      data: result.cases,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cases',
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
    console.error('Get comprehensive stats error:', error);
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
    console.error('Get pending reviews error:', error);
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
    console.error('Approve review error:', error);
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
    console.error('Reject review error:', error);
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
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties',
    });
  }
};