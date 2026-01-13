import { dossierService } from '../../../src/services/dossier.service';
import { caseQueries } from '../../../src/database/queries/dossier.queries';
import * as emailUtil from '../../../src/utils/email.util';
import { pool } from '../../../src/config/database.config';
import { CreateCaseDTO, UpdateCaseDTO, CaseFilters } from '../../../src/types/case.types';

jest.mock('../../../src/database/queries/dossier.queries');
jest.mock('../../../src/utils/email.util');
jest.mock('../../../src/config/database.config');

describe('DossierService', () => {
  const mockCase = {
    id: 'case-123',
    title: 'Litige commercial',
    description: 'Description du dossier',
    status: 'open',
    priority: 'high',
    case_type: 'commercial',
    client_id: 'client-123',
    lawyer_id: 'lawyer-123',
    opening_date: new Date('2024-01-01'),
    closing_date: null,
    next_hearing_date: new Date('2024-06-15'),
    case_number: 'CASE-2024-001',
    court_name: 'Tribunal de Commerce de Paris',
    opposing_party: 'Société XYZ',
    estimated_value: 50000,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockClient = {
    id: 'client-123',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@test.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCase', () => {
    it('devrait créer un dossier avec succès', async () => {
      const caseData: CreateCaseDTO = {
        title: 'Nouveau dossier',
        description: 'Description',
        priority: 'medium',
        case_type: 'civil',
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
      };

      (caseQueries.createCase as jest.Mock).mockResolvedValue(mockCase);

      const result = await dossierService.createCase(caseData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCase);
      expect(result.message).toBe('Dossier créé avec succès');
      expect(caseQueries.createCase).toHaveBeenCalledWith(caseData);
    });

    it('devrait gérer les erreurs lors de la création', async () => {
      const caseData: CreateCaseDTO = {
        title: 'Nouveau dossier',
        case_type: 'civil',
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
      };

      (caseQueries.createCase as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(dossierService.createCase(caseData)).rejects.toThrow(
        'Erreur lors de la création du dossier: Database error'
      );
    });

    it('devrait valider les données requises', async () => {
      const invalidData = {
        title: 'Test'
      } as CreateCaseDTO;

      (caseQueries.createCase as jest.Mock).mockRejectedValue(new Error('Missing required fields'));

      await expect(dossierService.createCase(invalidData)).rejects.toThrow();
    });
  });

  describe('getAllCases', () => {
    it('devrait retourner tous les dossiers', async () => {
      const filters: CaseFilters = {};
      const mockCases = [mockCase];

      (caseQueries.getAllCases as jest.Mock).mockResolvedValue(mockCases);

      const result = await dossierService.getAllCases(filters);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCases);
      expect(result.total).toBe(1);
      expect(caseQueries.getAllCases).toHaveBeenCalledWith(filters);
    });

    it('devrait filtrer par statut', async () => {
      const filters: CaseFilters = { status: 'pending' };
      const mockCases = [mockCase];

      (caseQueries.getAllCases as jest.Mock).mockResolvedValue(mockCases);

      const result = await dossierService.getAllCases(filters);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCases);
      expect(caseQueries.getAllCases).toHaveBeenCalledWith(filters);
    });

    it('devrait filtrer par client_id', async () => {
      const filters: CaseFilters = { client_id: 'client-123' };
      const mockCases = [mockCase];

      (caseQueries.getAllCases as jest.Mock).mockResolvedValue(mockCases);

      await dossierService.getAllCases(filters);

      expect(caseQueries.getAllCases).toHaveBeenCalledWith(filters);
    });

    it('devrait filtrer par lawyer_id', async () => {
      const filters: CaseFilters = { lawyer_id: 'lawyer-123' };
      const mockCases = [mockCase];

      (caseQueries.getAllCases as jest.Mock).mockResolvedValue(mockCases);

      await dossierService.getAllCases(filters);

      expect(caseQueries.getAllCases).toHaveBeenCalledWith(filters);
    });

    it('devrait retourner un tableau vide si aucun dossier', async () => {
      (caseQueries.getAllCases as jest.Mock).mockResolvedValue([]);

      const result = await dossierService.getAllCases({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('devrait gérer les erreurs', async () => {
      (caseQueries.getAllCases as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(dossierService.getAllCases({})).rejects.toThrow(
        'Erreur lors de la récupération des dossiers: Database error'
      );
    });
  });

  describe('getCaseById', () => {
    it('devrait retourner un dossier par ID', async () => {
      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(mockCase);

      const result = await dossierService.getCaseById('case-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCase);
      expect(caseQueries.getCaseById).toHaveBeenCalledWith('case-123');
    });

    it('devrait retourner success false si le dossier n\'existe pas', async () => {
      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(null);

      const result = await dossierService.getCaseById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Dossier non trouvé');
    });

    it('devrait gérer les erreurs', async () => {
      (caseQueries.getCaseById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(dossierService.getCaseById('case-123')).rejects.toThrow(
        'Erreur lors de la récupération du dossier: Database error'
      );
    });
  });

  describe('updateCase', () => {
    it('devrait mettre à jour un dossier', async () => {
      const updateData: UpdateCaseDTO = {
        status: 'in_progress',
        priority: 'high',
      };

      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(mockCase);
      (caseQueries.updateCase as jest.Mock).mockResolvedValue({
        ...mockCase,
        ...updateData,
      });

      const result = await dossierService.updateCase('case-123', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('in_progress');
      expect(caseQueries.updateCase).toHaveBeenCalledWith('case-123', updateData);
    });

    it('devrait retourner false si le dossier n\'existe pas', async () => {
      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(null);

      const result = await dossierService.updateCase('non-existent-id', { status: 'closed' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Dossier non trouvé');
      expect(caseQueries.updateCase).not.toHaveBeenCalled();
    });

    it('devrait ajouter closing_date lors de la fermeture', async () => {
      const updateData: UpdateCaseDTO = {
        status: 'closed',
      };

      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(mockCase);
      (caseQueries.updateCase as jest.Mock).mockResolvedValue({
        ...mockCase,
        status: 'closed',
        closing_date: expect.any(Date),
      });
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockClient] });
      (emailUtil.sendCaseStatusChangedEmail as jest.Mock).mockResolvedValue(true);

      const result = await dossierService.updateCase('case-123', updateData);

      expect(result.success).toBe(true);
      expect(caseQueries.updateCase).toHaveBeenCalledWith('case-123', {
        status: 'closed',
        closing_date: expect.any(Date),
      });
    });

    it('devrait envoyer un email lors du changement de statut', async () => {
      const updateData: UpdateCaseDTO = {
        status: 'closed',
      };

      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(mockCase);
      (caseQueries.updateCase as jest.Mock).mockResolvedValue({
        ...mockCase,
        status: 'closed',
      });
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockClient] });
      (emailUtil.sendCaseStatusChangedEmail as jest.Mock).mockResolvedValue(true);

      await dossierService.updateCase('case-123', updateData);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [mockCase.client_id]
      );
    });

    it('devrait continuer même si l\'email échoue', async () => {
      const updateData: UpdateCaseDTO = {
        status: 'closed',
      };

      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(mockCase);
      (caseQueries.updateCase as jest.Mock).mockResolvedValue({
        ...mockCase,
        status: 'closed',
      });
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockClient] });
      (emailUtil.sendCaseStatusChangedEmail as jest.Mock).mockRejectedValue(
        new Error('Email error')
      );

      const result = await dossierService.updateCase('case-123', updateData);

      expect(result.success).toBe(true);
    });

    it('devrait retourner false si l\'update échoue', async () => {
      (caseQueries.getCaseById as jest.Mock).mockResolvedValue(mockCase);
      (caseQueries.updateCase as jest.Mock).mockResolvedValue(null);

      const result = await dossierService.updateCase('case-123', { status: 'closed' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erreur lors de la mise à jour du dossier');
    });

    it('devrait gérer les erreurs', async () => {
      (caseQueries.getCaseById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(dossierService.updateCase('case-123', { status: 'closed' })).rejects.toThrow(
        'Erreur lors de la mise à jour du dossier: Database error'
      );
    });
  });
});