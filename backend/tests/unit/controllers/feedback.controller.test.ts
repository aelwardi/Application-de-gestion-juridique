import { Request, Response } from 'express';
import { FeedbackController } from '../../../src/controllers/feedback.controller';
import * as feedbackService from '../../../src/services/feedback.service';

jest.mock('../../../src/services/feedback.service');

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    controller = new FeedbackController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'client',
      },
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create feedback successfully', async () => {
      mockRequest.body = {
        rating: 8,
        category: 'service',
        comment: 'Great service!',
        suggestions: 'Keep up the good work',
        user_email: 'test@example.com',
        user_role: 'client',
      };

      const mockFeedback = {
        id: 'feedback-123',
        user_id: 'user-123',
        rating: 8,
        category: 'service',
        comment: 'Great service!',
        suggestions: 'Keep up the good work',
        user_email: 'test@example.com',
        user_role: 'client',
        created_at: new Date(),
      };

      (feedbackService.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(feedbackService.createFeedback).toHaveBeenCalledWith({
        user_id: 'user-123',
        rating: 8,
        category: 'service',
        comment: 'Great service!',
        suggestions: 'Keep up the good work',
        user_email: 'test@example.com',
        user_role: 'client',
      });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Feedback enregistré avec succès',
        data: mockFeedback,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    });

    it('should return 400 if rating is missing', async () => {
      mockRequest.body = {
        category: 'service',
        comment: 'Great service!',
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'La note doit être entre 1 et 10',
      });
    });

    it('should return 400 if rating is less than 1', async () => {
      mockRequest.body = {
        rating: 0,
        category: 'service',
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'La note doit être entre 1 et 10',
      });
    });

    it('should return 400 if rating is greater than 10', async () => {
      mockRequest.body = {
        rating: 11,
        category: 'service',
      };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'La note doit être entre 1 et 10',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        rating: 8,
        category: 'service',
        comment: 'Great service!',
      };

      (feedbackService.createFeedback as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "Erreur lors de l'enregistrement du feedback",
        error: 'Database error',
      });
    });
  });

  describe('getAll', () => {
    it('should get all feedback with default pagination', async () => {
      const mockResult = {
        data: [
          {
            id: 'feedback-1',
            rating: 8,
            comment: 'Great!',
          },
          {
            id: 'feedback-2',
            rating: 7,
            comment: 'Good',
          },
        ],
        total: 2,
      };

      (feedbackService.getAllFeedback as jest.Mock).mockResolvedValue(mockResult);

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(feedbackService.getAllFeedback).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should get feedback with custom pagination and filters', async () => {
      mockRequest.query = {
        page: '2',
        limit: '10',
        status: 'pending',
        rating: '8',
        category: 'service',
        userRole: 'client',
      };

      const mockResult = {
        data: [],
        total: 0,
      };

      (feedbackService.getAllFeedback as jest.Mock).mockResolvedValue(mockResult);

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(feedbackService.getAllFeedback).toHaveBeenCalledWith(
        2,
        10,
        'pending',
        8,
        'service',
        'client'
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should handle service errors', async () => {
      (feedbackService.getAllFeedback as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des feedbacks',
        error: 'Database error',
      });
    });
  });

  describe('getById', () => {
    it('should get feedback by id', async () => {
      mockRequest.params = { id: 'feedback-123' };

      const mockFeedback = {
        id: 'feedback-123',
        rating: 8,
        comment: 'Great!',
      };

      (feedbackService.getFeedbackById as jest.Mock).mockResolvedValue(mockFeedback);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(feedbackService.getFeedbackById).toHaveBeenCalledWith('feedback-123');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockFeedback,
      });
    });

    it('should return 404 if feedback not found', async () => {
      mockRequest.params = { id: 'feedback-123' };

      (feedbackService.getFeedbackById as jest.Mock).mockResolvedValue(null);

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Feedback non trouvé',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: 'feedback-123' };

      (feedbackService.getFeedbackById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.getById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération du feedback',
        error: 'Database error',
      });
    });
  });

  describe('updateStatus', () => {
    it('should update feedback status', async () => {
      mockRequest.params = { id: 'feedback-123' };
      mockRequest.body = { status: 'reviewed' };

      const mockUpdatedFeedback = {
        id: 'feedback-123',
        status: 'reviewed',
      };

      (feedbackService.updateFeedbackStatus as jest.Mock).mockResolvedValue(mockUpdatedFeedback);

      await controller.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(feedbackService.updateFeedbackStatus).toHaveBeenCalledWith('feedback-123', 'reviewed');
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Statut mis à jour',
        data: mockUpdatedFeedback,
      });
    });

    it('should return 400 if status is missing', async () => {
      mockRequest.params = { id: 'feedback-123' };
      mockRequest.body = {};

      await controller.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Statut invalide',
      });
    });
  });

  describe('reply', () => {
    it('should reply to feedback', async () => {
      mockRequest.params = { id: 'feedback-123' };
      mockRequest.body = { response: 'Thank you for your feedback!' };
      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };

      const mockUpdatedFeedback = {
        id: 'feedback-123',
        admin_response: 'Thank you for your feedback!',
      };

      (feedbackService.replyToFeedback as jest.Mock).mockResolvedValue(mockUpdatedFeedback);

      await controller.reply(mockRequest as Request, mockResponse as Response);

      expect(feedbackService.replyToFeedback).toHaveBeenCalledWith(
        'feedback-123',
        'admin-123',
        'Thank you for your feedback!'
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Réponse envoyée avec succès',
        data: mockUpdatedFeedback,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.params = { id: 'feedback-123' };
      mockRequest.body = { response: 'Thank you!' };
      mockRequest.user = undefined;

      await controller.reply(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    });

    it('should return 400 if response is missing', async () => {
      mockRequest.params = { id: 'feedback-123' };
      mockRequest.body = {};

      await controller.reply(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'La réponse ne peut pas être vide',
      });
    });
  });

  describe('getStats', () => {
    it('should get feedback stats', async () => {
      const mockStats = {
        totalFeedback: 100,
        averageRating: 7.5,
        byCategory: {
          service: 40,
          interface: 30,
          performance: 30,
        },
        byStatus: {
          pending: 20,
          reviewed: 70,
          resolved: 10,
        },
      };

      (feedbackService.getFeedbackStats as jest.Mock).mockResolvedValue(mockStats);

      await controller.getStats(mockRequest as Request, mockResponse as Response);

      expect(feedbackService.getFeedbackStats).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should handle service errors', async () => {
      (feedbackService.getFeedbackStats as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.getStats(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: 'Database error',
      });
    });
  });
});

