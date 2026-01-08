import { Request, Response } from 'express';
import * as lawyerRequestService from '../services/lawyer-request.service';

/**
 * POST /api/lawyer-requests
 * Créer une nouvelle demande vers un avocat
 */
export const createLawyerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestData = req.body;

    if (!requestData.client_id || !requestData.lawyer_id || !requestData.title) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: client_id, lawyer_id, title',
      });
      return;
    }

    const lawyerRequest = await lawyerRequestService.createLawyerRequest(requestData);

    res.status(201).json({
      success: true,
      data: lawyerRequest,
      message: 'Lawyer request created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create lawyer request',
      error: error.message,
    });
  }
};

/**
 * GET /api/lawyer-requests/:id
 * Récupérer une demande par ID
 */
export const getLawyerRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lawyerRequest = await lawyerRequestService.getLawyerRequestById(id);

    if (!lawyerRequest) {
      res.status(404).json({
        success: false,
        message: 'Lawyer request not found',
      });
      return;
    }

    res.json({
      success: true,
      data: lawyerRequest,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer request',
      error: error.message,
    });
  }
};

/**
 * GET /api/lawyer-requests/client/:clientId
 * Récupérer les demandes d'un client
 */
export const getClientRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const { status, limit = '20', offset = '0' } = req.query;

    const result = await lawyerRequestService.getClientRequests(
      clientId,
      status as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: result.requests,
      pagination: {
        total: result.total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client requests',
      error: error.message,
    });
  }
};

/**
 * GET /api/lawyer-requests/lawyer/:lawyerId
 * Récupérer les demandes reçues par un avocat
 */
export const getLawyerRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const { status, limit = '20', offset = '0' } = req.query;

    const result = await lawyerRequestService.getLawyerRequests(
      lawyerId,
      status as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: result.requests,
      pagination: {
        total: result.total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer requests',
      error: error.message,
    });
  }
};

/**
 * POST /api/lawyer-requests/:id/accept
 * Accepter une demande (avocat)
 */
export const acceptRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lawyerRequest = await lawyerRequestService.acceptLawyerRequest(id);

    res.json({
      success: true,
      data: lawyerRequest,
      message: 'Request accepted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Request not found') {
      res.status(404).json({
        success: false,
        message: 'Request not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to accept request',
      error: error.message,
    });
  }
};

/**
 * POST /api/lawyer-requests/:id/reject
 * Rejeter une demande (avocat)
 */
export const rejectRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lawyerRequest = await lawyerRequestService.rejectLawyerRequest(id);

    res.json({
      success: true,
      data: lawyerRequest,
      message: 'Request rejected successfully',
    });
  } catch (error: any) {
    if (error.message === 'Request not found') {
      res.status(404).json({
        success: false,
        message: 'Request not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message,
    });
  }
};

/**
 * POST /api/lawyer-requests/:id/cancel
 * Annuler une demande (client)
 */
export const cancelRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = req.user?.userId;

    if (!clientId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const lawyerRequest = await lawyerRequestService.cancelLawyerRequest(id, clientId);

    res.json({
      success: true,
      data: lawyerRequest,
      message: 'Request cancelled successfully',
    });
  } catch (error: any) {
    if (error.message === 'Request not found or cannot be cancelled') {
      res.status(404).json({
        success: false,
        message: 'Request not found or cannot be cancelled',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel request',
      error: error.message,
    });
  }
};

/**
 * GET /api/lawyer-requests/client/:clientId/stats
 * Statistiques des demandes pour un client
 */
export const getClientRequestStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const stats = await lawyerRequestService.getClientRequestStats(clientId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client stats',
      error: error.message,
    });
  }
};

/**
 * GET /api/lawyer-requests/lawyer/:lawyerId/stats
 * Statistiques des demandes pour un avocat
 */
export const getLawyerRequestStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const stats = await lawyerRequestService.getLawyerRequestStats(lawyerId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer stats',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/lawyer-requests/:id
 * Supprimer une demande
 */
export const deleteLawyerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await lawyerRequestService.deleteLawyerRequest(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Request not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete request',
      error: error.message,
    });
  }
};