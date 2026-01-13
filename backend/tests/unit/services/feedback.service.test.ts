import * as feedbackService from '../../../src/services/feedback.service';
import * as feedbackQueries from '../../../src/database/queries/feedback.queries';
import { sendEmail } from '../../../src/utils/email.util';

jest.mock('../../../src/database/queries/feedback.queries');
jest.mock('../../../src/utils/email.util');

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('should create feedback and send email', async () => {
      const mockInput = {
        user_id: 'user-123',
        rating: 8,
        category: 'service',
        comment: 'Great service!',
        suggestions: 'Keep up the good work',
        user_email: 'test@example.com',
        user_role: 'client',
      };

      const mockFeedback = {
        id: 'feedback-123',
        ...mockInput,
        created_at: new Date(),
      };

      (feedbackQueries.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await feedbackService.createFeedback(mockInput);

      expect(feedbackQueries.createFeedback).toHaveBeenCalledWith(mockInput);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Merci pour votre avis',
        })
      );
      expect(result).toEqual(mockFeedback);
    });

    it('should create feedback without sending email if user_email is not provided', async () => {
      const mockInput = {
        user_id: 'user-123',
        rating: 8,
        category: 'service',
        comment: 'Great service!',
      };

      const mockFeedback = {
        id: 'feedback-123',
        ...mockInput,
        created_at: new Date(),
      };

      (feedbackQueries.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await feedbackService.createFeedback(mockInput);

      expect(feedbackQueries.createFeedback).toHaveBeenCalledWith(mockInput);
      expect(sendEmail).not.toHaveBeenCalled();
      expect(result).toEqual(mockFeedback);
    });

    it('should create feedback even if email sending fails', async () => {
      const mockInput = {
        user_id: 'user-123',
        rating: 8,
        category: 'service',
        user_email: 'test@example.com',
        user_role: 'client',
      };

      const mockFeedback = {
        id: 'feedback-123',
        ...mockInput,
        created_at: new Date(),
      };

      (feedbackQueries.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);
      (sendEmail as jest.Mock).mockRejectedValue(new Error('Email error'));

      const result = await feedbackService.createFeedback(mockInput);

      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getAllFeedback', () => {
    it('should get all feedback with default parameters', async () => {
      const mockResult = {
        data: [],
        total: 0,
      };

      (feedbackQueries.getAllFeedback as jest.Mock).mockResolvedValue(mockResult);

      const result = await feedbackService.getAllFeedback();

      expect(feedbackQueries.getAllFeedback).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(result).toEqual(mockResult);
    });

    it('should get all feedback with filters', async () => {
      const mockResult = {
        data: [],
        total: 0,
      };

      (feedbackQueries.getAllFeedback as jest.Mock).mockResolvedValue(mockResult);

      const result = await feedbackService.getAllFeedback(2, 10, 'pending', 8, 'service', 'client');

      expect(feedbackQueries.getAllFeedback).toHaveBeenCalledWith(
        2,
        10,
        'pending',
        8,
        'service',
        'client'
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getFeedbackById', () => {
    it('should get feedback by id', async () => {
      const mockFeedback = {
        id: 'feedback-123',
        rating: 8,
        comment: 'Great!',
      };

      (feedbackQueries.getFeedbackById as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await feedbackService.getFeedbackById('feedback-123');

      expect(feedbackQueries.getFeedbackById).toHaveBeenCalledWith('feedback-123');
      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getUserFeedback', () => {
    it('should get user feedback', async () => {
      const mockFeedbacks = [
        { id: 'feedback-1', rating: 8 },
        { id: 'feedback-2', rating: 7 },
      ];

      (feedbackQueries.getUserFeedback as jest.Mock).mockResolvedValue(mockFeedbacks);

      const result = await feedbackService.getUserFeedback('user-123');

      expect(feedbackQueries.getUserFeedback).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockFeedbacks);
    });
  });

  describe('updateFeedbackStatus', () => {
    it('should update feedback status', async () => {
      const mockFeedback = {
        id: 'feedback-123',
        status: 'reviewed',
      };

      (feedbackQueries.updateFeedbackStatus as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await feedbackService.updateFeedbackStatus('feedback-123', 'reviewed');

      expect(feedbackQueries.updateFeedbackStatus).toHaveBeenCalledWith('feedback-123', 'reviewed');
      expect(result).toEqual(mockFeedback);
    });
  });

  describe('replyToFeedback', () => {
    it('should reply to feedback and send email', async () => {
      const mockFeedback = {
        id: 'feedback-123',
        rating: 8,
        comment: 'Great service!',
        user_email: 'test@example.com',
        user_first_name: 'John',
        admin_response: 'Thank you for your feedback!',
      };

      (feedbackQueries.replyToFeedback as jest.Mock).mockResolvedValue(mockFeedback);
      (feedbackQueries.getFeedbackById as jest.Mock).mockResolvedValue(mockFeedback);
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await feedbackService.replyToFeedback(
        'feedback-123',
        'admin-123',
        'Thank you for your feedback!'
      );

      expect(feedbackQueries.replyToFeedback).toHaveBeenCalledWith(
        'feedback-123',
        'admin-123',
        'Thank you for your feedback!'
      );
      expect(feedbackQueries.getFeedbackById).toHaveBeenCalledWith('feedback-123');
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Réponse à votre avis',
        })
      );
      expect(result).toEqual(mockFeedback);
    });

    it('should reply to feedback without sending email if user_email is not provided', async () => {
      const mockFeedback = {
        id: 'feedback-123',
        rating: 8,
        comment: 'Great service!',
        admin_response: 'Thank you!',
      };

      (feedbackQueries.replyToFeedback as jest.Mock).mockResolvedValue(mockFeedback);
      (feedbackQueries.getFeedbackById as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await feedbackService.replyToFeedback(
        'feedback-123',
        'admin-123',
        'Thank you!'
      );

      expect(sendEmail).not.toHaveBeenCalled();
      expect(result).toEqual(mockFeedback);
    });

    it('should reply to feedback even if email sending fails', async () => {
      const mockFeedback = {
        id: 'feedback-123',
        rating: 8,
        user_email: 'test@example.com',
        user_first_name: 'John',
        admin_response: 'Thank you!',
      };

      (feedbackQueries.replyToFeedback as jest.Mock).mockResolvedValue(mockFeedback);
      (feedbackQueries.getFeedbackById as jest.Mock).mockResolvedValue(mockFeedback);
      (sendEmail as jest.Mock).mockRejectedValue(new Error('Email error'));

      const result = await feedbackService.replyToFeedback(
        'feedback-123',
        'admin-123',
        'Thank you!'
      );

      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getFeedbackStats', () => {
    it('should get feedback stats', async () => {
      const mockStats = {
        totalFeedback: 100,
        averageRating: 7.5,
      };

      (feedbackQueries.getFeedbackStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await feedbackService.getFeedbackStats();

      expect(feedbackQueries.getFeedbackStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});