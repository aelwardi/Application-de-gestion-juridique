import { Request, Response } from 'express';
import * as feedbackService from '../services/feedback.service';

export class FeedbackController {
  // Créer un feedback (utilisateurs authentifiés)
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { rating, category, comment, suggestions, user_email, user_role } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      if (!rating || rating < 1 || rating > 10) {
        return res.status(400).json({
          success: false,
          message: 'La note doit être entre 1 et 10'
        });
      }

      const feedback = await feedbackService.createFeedback({
        user_id: userId,
        rating,
        category,
        comment,
        suggestions,
        user_email,
        user_role
      });

      return res.status(201).json({
        success: true,
        message: 'Feedback enregistré avec succès',
        data: feedback
      });
    } catch (error: any) {
      console.error('Erreur création feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'enregistrement du feedback',
        error: error.message
      });
    }
  }

  // Récupérer tous les feedbacks (admin)
  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
      const category = req.query.category as string;
      const userRole = req.query.userRole as string;

      const result = await feedbackService.getAllFeedback(
        page,
        limit,
        status,
        rating,
        category,
        userRole
      );

      return res.json({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error: any) {
      console.error('Erreur récupération feedbacks:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des feedbacks',
        error: error.message
      });
    }
  }

  // Récupérer un feedback par ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const feedback = await feedbackService.getFeedbackById(id);

      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback non trouvé'
        });
      }

      return res.json({
        success: true,
        data: feedback
      });
    } catch (error: any) {
      console.error('Erreur récupération feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du feedback',
        error: error.message
      });
    }
  }

  // Récupérer les feedbacks de l'utilisateur connecté
  async getMyFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      const feedbacks = await feedbackService.getUserFeedback(userId);

      return res.json({
        success: true,
        data: feedbacks
      });
    } catch (error: any) {
      console.error('Erreur récupération mes feedbacks:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de vos feedbacks',
        error: error.message
      });
    }
  }

  // Mettre à jour le statut (admin)
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'reviewed', 'replied', 'archived'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
      }

      const feedback = await feedbackService.updateFeedbackStatus(id, status);

      return res.json({
        success: true,
        message: 'Statut mis à jour',
        data: feedback
      });
    } catch (error: any) {
      console.error('Erreur mise à jour statut:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut',
        error: error.message
      });
    }
  }

  // Répondre à un feedback (admin)
  async reply(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }

      if (!response || response.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'La réponse ne peut pas être vide'
        });
      }

      const feedback = await feedbackService.replyToFeedback(id, adminId, response);

      return res.json({
        success: true,
        message: 'Réponse envoyée avec succès',
        data: feedback
      });
    } catch (error: any) {
      console.error('Erreur réponse feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de la réponse',
        error: error.message
      });
    }
  }

  // Statistiques (admin)
  async getStats(req: Request, res: Response) {
    try {
      const stats = await feedbackService.getFeedbackStats();

      return res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Erreur statistiques feedbacks:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }
}

