import * as lawyersService from '../../../src/services/lawyers.service';
import * as lawyersQueries from '../../../src/database/queries/lawyers.queries';
import * as emailUtil from '../../../src/utils/email.util';

jest.mock('../../../src/database/queries/lawyers.queries');
jest.mock('../../../src/utils/email.util');

describe('LawyersService', () => {
  const mockLawyer = {
    id: 'lawyer-123',
    user_id: 'user-123',
    email: 'lawyer@test.com',
    first_name: 'Marie',
    last_name: 'Dupont',
    phone: '+1234567890',
    bar_number: 'BAR123456',
    specialties: ['Droit civil', 'Droit commercial'],
    experience_years: 10,
    office_address: '456 Law St',
    office_city: 'Paris',
    office_postal_code: '75002',
    hourly_rate: 250,
    description: 'Avocat expérimenté',
    verified_by_admin: true,
    is_active: true,
    rating: 4.5,
    total_reviews: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLawyers', () => {
    it('devrait retourner tous les avocats avec pagination', async () => {
      const mockResponse = {
        lawyers: [mockLawyer],
        total: 1,
      };

      (lawyersQueries.getAllLawyers as jest.Mock).mockResolvedValue(mockResponse);

      const result = await lawyersService.getAllLawyers(1, 50);

      expect(result).toEqual(mockResponse);
      expect(lawyersQueries.getAllLawyers).toHaveBeenCalledWith(1, 50, undefined, undefined, undefined);
    });

    it('devrait filtrer par statut vérifié', async () => {
      const mockResponse = {
        lawyers: [mockLawyer],
        total: 1,
      };

      (lawyersQueries.getAllLawyers as jest.Mock).mockResolvedValue(mockResponse);

      await lawyersService.getAllLawyers(1, 50, true);

      expect(lawyersQueries.getAllLawyers).toHaveBeenCalledWith(1, 50, true, undefined, undefined);
    });

    it('devrait filtrer par ville', async () => {
      const mockResponse = {
        lawyers: [mockLawyer],
        total: 1,
      };

      (lawyersQueries.getAllLawyers as jest.Mock).mockResolvedValue(mockResponse);

      await lawyersService.getAllLawyers(1, 50, undefined, 'Paris');

      expect(lawyersQueries.getAllLawyers).toHaveBeenCalledWith(1, 50, undefined, 'Paris', undefined);
    });

    it('devrait filtrer par spécialité', async () => {
      const mockResponse = {
        lawyers: [mockLawyer],
        total: 1,
      };

      (lawyersQueries.getAllLawyers as jest.Mock).mockResolvedValue(mockResponse);

      await lawyersService.getAllLawyers(1, 50, undefined, undefined, 'Droit civil');

      expect(lawyersQueries.getAllLawyers).toHaveBeenCalledWith(1, 50, undefined, undefined, 'Droit civil');
    });

    it('devrait retourner un tableau vide si aucun avocat', async () => {
      (lawyersQueries.getAllLawyers as jest.Mock).mockResolvedValue({
        lawyers: [],
        total: 0,
      });

      const result = await lawyersService.getAllLawyers(1, 50);

      expect(result.lawyers).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getLawyerDetails', () => {
    it('devrait retourner les détails d\'un avocat', async () => {
      (lawyersQueries.getLawyerById as jest.Mock).mockResolvedValue(mockLawyer);

      const result = await lawyersService.getLawyerDetails('lawyer-123');

      expect(result).toEqual(mockLawyer);
      expect(lawyersQueries.getLawyerById).toHaveBeenCalledWith('lawyer-123');
    });

    it('devrait lever une erreur si l\'avocat n\'existe pas', async () => {
      (lawyersQueries.getLawyerById as jest.Mock).mockResolvedValue(null);

      await expect(lawyersService.getLawyerDetails('non-existent-id')).rejects.toThrow('Lawyer not found');
    });

    it('devrait gérer les erreurs de base de données', async () => {
      (lawyersQueries.getLawyerById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(lawyersService.getLawyerDetails('lawyer-123')).rejects.toThrow('Database error');
    });
  });

  describe('verifyLawyer', () => {
    it('devrait vérifier un avocat et envoyer un email', async () => {
      (lawyersQueries.getLawyerById as jest.Mock).mockResolvedValue(mockLawyer);
      (lawyersQueries.verifyLawyer as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendEmail as jest.Mock).mockResolvedValue(true);

      const result = await lawyersService.verifyLawyer('lawyer-123', 'admin-123');

      expect(result).toEqual({ success: true });
      expect(lawyersQueries.verifyLawyer).toHaveBeenCalledWith('lawyer-123', 'admin-123');

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(emailUtil.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockLawyer.email,
          subject: 'Votre compte avocat a été vérifié',
        })
      );
    });

    it('devrait lever une erreur si l\'avocat n\'existe pas', async () => {
      (lawyersQueries.getLawyerById as jest.Mock).mockResolvedValue(null);

      await expect(lawyersService.verifyLawyer('non-existent-id', 'admin-123')).rejects.toThrow('Lawyer not found');
      expect(lawyersQueries.verifyLawyer).not.toHaveBeenCalled();
    });

    it('devrait continuer même si l\'email échoue', async () => {
      (lawyersQueries.getLawyerById as jest.Mock).mockResolvedValue(mockLawyer);
      (lawyersQueries.verifyLawyer as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendEmail as jest.Mock).mockRejectedValue(new Error('Email error'));

      const result = await lawyersService.verifyLawyer('lawyer-123', 'admin-123');

      expect(result).toEqual({ success: true });
      expect(lawyersQueries.verifyLawyer).toHaveBeenCalled();
    });
  });

  describe('getCaseStats', () => {
    it('devrait retourner les statistiques des dossiers', async () => {
      const mockStats = {
        total_cases: 100,
        active_cases: 50,
        closed_cases: 40,
        pending_cases: 10,
      };

      (lawyersQueries.getCaseStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await lawyersService.getCaseStats();

      expect(result).toEqual(mockStats);
      expect(lawyersQueries.getCaseStats).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs', async () => {
      (lawyersQueries.getCaseStats as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(lawyersService.getCaseStats()).rejects.toThrow('Database error');
    });
  });

  describe('getLawyerStats', () => {
    it('devrait retourner les statistiques des avocats', async () => {
      const mockStats = {
        total_lawyers: 50,
        verified_lawyers: 40,
        unverified_lawyers: 10,
        active_lawyers: 45,
      };

      (lawyersQueries.getLawyerStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await lawyersService.getLawyerStats();

      expect(result).toEqual(mockStats);
      expect(lawyersQueries.getLawyerStats).toHaveBeenCalled();
    });
  });

  describe('getAppointmentStats', () => {
    it('devrait retourner les statistiques des rendez-vous', async () => {
      const mockStats = {
        total_appointments: 200,
        completed_appointments: 150,
        pending_appointments: 30,
        cancelled_appointments: 20,
      };

      (lawyersQueries.getAppointmentStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await lawyersService.getAppointmentStats();

      expect(result).toEqual(mockStats);
      expect(lawyersQueries.getAppointmentStats).toHaveBeenCalled();
    });
  });

  describe('getPendingReviews', () => {
    it('devrait retourner les avis en attente de modération', async () => {
      const mockReviews = {
        reviews: [
          {
            id: 'review-123',
            lawyer_id: 'lawyer-123',
            client_id: 'client-123',
            rating: 5,
            comment: 'Excellent service',
            status: 'pending',
          },
        ],
        total: 1,
      };

      (lawyersQueries.getPendingReviews as jest.Mock).mockResolvedValue(mockReviews);

      const result = await lawyersService.getPendingReviews(1, 50);

      expect(result).toEqual(mockReviews);
      expect(lawyersQueries.getPendingReviews).toHaveBeenCalledWith(1, 50);
    });

    it('devrait retourner un tableau vide si aucun avis en attente', async () => {
      (lawyersQueries.getPendingReviews as jest.Mock).mockResolvedValue({
        reviews: [],
        total: 0,
      });

      const result = await lawyersService.getPendingReviews(1, 50);

      expect(result.reviews).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('approveReview', () => {
    it('devrait approuver un avis', async () => {
      (lawyersQueries.moderateReview as jest.Mock).mockResolvedValue(undefined);

      const result = await lawyersService.approveReview('review-123', 'admin-123');

      expect(result).toEqual({ success: true, message: 'Review approved' });
      expect(lawyersQueries.moderateReview).toHaveBeenCalledWith('review-123', true, 'admin-123');
    });

    it('devrait gérer les erreurs lors de l\'approbation', async () => {
      (lawyersQueries.moderateReview as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(lawyersService.approveReview('review-123', 'admin-123')).rejects.toThrow('Database error');
    });
  });

  describe('rejectReview', () => {
    it('devrait rejeter un avis', async () => {
      (lawyersQueries.moderateReview as jest.Mock).mockResolvedValue(undefined);

      const result = await lawyersService.rejectReview('review-123', 'admin-123');

      expect(result).toEqual({ success: true, message: 'Review rejected' });
      expect(lawyersQueries.moderateReview).toHaveBeenCalledWith('review-123', false, 'admin-123');
    });

    it('devrait gérer les erreurs lors du rejet', async () => {
      (lawyersQueries.moderateReview as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(lawyersService.rejectReview('review-123', 'admin-123')).rejects.toThrow('Database error');
    });
  });
});