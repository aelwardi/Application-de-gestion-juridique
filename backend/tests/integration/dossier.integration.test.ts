import request from 'supertest';
import express, { Express } from 'express';
import { dossierService } from '../../src/services/dossier.service';
import { CreateCaseDTO, UpdateCaseDTO } from '../../src/types/case.types';

jest.mock('../../src/services/dossier.service');
jest.mock('../../src/database/queries/admin.queries');

// Mock the authenticate middleware
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', role: 'avocat', email: 'lawyer@test.com' };
    next();
  },
}));

describe('Dossier API Integration Tests', () => {
  let app: Express;

  const mockCase = {
    id: 'case-123',
    title: 'Litige commercial',
    description: 'Description du dossier',
    status: 'open',
    priority: 'high',
    case_type: 'commercial',
    client_id: 'client-123',
    lawyer_id: 'lawyer-123',
    opening_date: new Date('2024-01-01').toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const dossierRoutes = require('../../src/routes/dossier.routes').default;
    app.use('/api/cases', dossierRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/cases', () => {
    it('devrait créer un nouveau dossier', async () => {
      const caseData: CreateCaseDTO = {
        title: 'Nouveau dossier',
        case_type: 'civil',
        client_id: 'client-123',
        description: 'Description',
      };

      (dossierService.createCase as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCase,
        message: 'Dossier créé avec succès',
      });

      const response = await request(app)
        .post('/api/cases')
        .send(caseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCase);
      expect(dossierService.createCase).toHaveBeenCalledWith(caseData);
    });

    it('devrait retourner 400 si les champs requis manquent', async () => {
      const invalidData = {
        description: 'Test',
      };

      const response = await request(app)
        .post('/api/cases')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requis');
      expect(dossierService.createCase).not.toHaveBeenCalled();
    });

    it('devrait retourner 500 en cas d\'erreur serveur', async () => {
      const caseData: CreateCaseDTO = {
        title: 'Test',
        case_type: 'civil',
        client_id: 'client-123',
      };

      (dossierService.createCase as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/api/cases')
        .send(caseData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('devrait créer un dossier avec tous les champs optionnels', async () => {
      const completeData: CreateCaseDTO = {
        title: 'Dossier complet',
        case_type: 'commercial',
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        description: 'Description complète',
        priority: 'high',
        court_name: 'Tribunal de Commerce',
        judge_name: 'Juge Dupont',
        estimated_duration_months: 12,
      };

      (dossierService.createCase as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockCase, ...completeData },
        message: 'Dossier créé avec succès',
      });

      const response = await request(app)
        .post('/api/cases')
        .send(completeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(dossierService.createCase).toHaveBeenCalledWith(completeData);
    });
  });

  describe('GET /api/cases', () => {
    it('devrait retourner tous les dossiers', async () => {
      const mockCases = [mockCase];

      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCases,
        total: 1,
      });

      const response = await request(app)
        .get('/api/cases')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCases);
    });

    it('devrait filtrer par statut', async () => {
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCase],
        total: 1,
      });

      await request(app)
        .get('/api/cases')
        .query({ status: 'open' })
        .expect(200);

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'open' })
      );
    });

    it('devrait filtrer par client_id', async () => {
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCase],
        total: 1,
      });

      await request(app)
        .get('/api/cases')
        .query({ client_id: 'client-123' })
        .expect(200);

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: 'client-123' })
      );
    });

    it('devrait filtrer par lawyer_id', async () => {
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCase],
        total: 1,
      });

      await request(app)
        .get('/api/cases')
        .query({ lawyer_id: 'lawyer-123' })
        .expect(200);

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({ lawyer_id: 'lawyer-123' })
      );
    });

    it('devrait filtrer par priorité', async () => {
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCase],
        total: 1,
      });

      await request(app)
        .get('/api/cases')
        .query({ priority: 'high' })
        .expect(200);

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'high' })
      );
    });

    it('devrait combiner plusieurs filtres', async () => {
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
        total: 0,
      });

      await request(app)
        .get('/api/cases')
        .query({
          status: 'open',
          priority: 'high',
          lawyer_id: 'lawyer-123',
        })
        .expect(200);

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'open',
          priority: 'high',
          lawyer_id: 'lawyer-123',
        })
      );
    });

    it('devrait gérer la pagination', async () => {
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
        total: 0,
      });

      await request(app)
        .get('/api/cases')
        .query({ limit: 10, offset: 20 })
        .expect(200);

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 20,
        })
      );
    });

    it('devrait retourner un tableau vide si aucun dossier', async () => {
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/cases')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/cases/:id', () => {
    it('devrait retourner un dossier par ID', async () => {
      (dossierService.getCaseById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCase,
      });

      const response = await request(app)
        .get('/api/cases/case-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCase);
      expect(dossierService.getCaseById).toHaveBeenCalledWith('case-123');
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      (dossierService.getCaseById as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      const response = await request(app)
        .get('/api/cases/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 500 en cas d\'erreur serveur', async () => {
      (dossierService.getCaseById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/cases/case-123')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/cases/:id', () => {
    it('devrait mettre à jour un dossier', async () => {
      const updateData: UpdateCaseDTO = {
        status: 'in_progress',
        priority: 'high',
      };

      (dossierService.updateCase as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockCase, ...updateData },
        message: 'Dossier mis à jour',
      });

      const response = await request(app)
        .put('/api/cases/case-123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(dossierService.updateCase).toHaveBeenCalledWith('case-123', updateData);
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      (dossierService.updateCase as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      const response = await request(app)
        .put('/api/cases/non-existent-id')
        .send({ status: 'closed' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('devrait permettre la mise à jour partielle', async () => {
      const updateData: UpdateCaseDTO = {
        description: 'Description mise à jour',
      };

      (dossierService.updateCase as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockCase, ...updateData },
      });

      await request(app)
        .put('/api/cases/case-123')
        .send(updateData)
        .expect(200);

      expect(dossierService.updateCase).toHaveBeenCalledWith('case-123', updateData);
    });

    it('devrait gérer la fermeture d\'un dossier', async () => {
      const updateData: UpdateCaseDTO = {
        status: 'closed',
      };

      (dossierService.updateCase as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          ...mockCase,
          status: 'closed',
          closing_date: new Date(),
        },
      });

      const response = await request(app)
        .put('/api/cases/case-123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('closed');
    });
  });

  describe('DELETE /api/cases/:id', () => {
    it('devrait supprimer un dossier', async () => {
      (dossierService.deleteCase as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Dossier supprimé',
      });

      const response = await request(app)
        .delete('/api/cases/case-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(dossierService.deleteCase).toHaveBeenCalledWith('case-123');
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      (dossierService.deleteCase as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      const response = await request(app)
        .delete('/api/cases/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      (dossierService.deleteCase as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .delete('/api/cases/case-123')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/cases/:id/assign', () => {
    it('devrait assigner un avocat à un dossier', async () => {
      (dossierService.assignLawyer as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Avocat assigné',
      });

      const response = await request(app)
        .put('/api/cases/case-123/assign')
        .send({ lawyer_id: 'lawyer-123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(dossierService.assignLawyer).toHaveBeenCalledWith('case-123', 'lawyer-123');
    });

    it('devrait retourner 400 si lawyer_id manque', async () => {
      const response = await request(app)
        .put('/api/cases/case-123/assign')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requis');
      expect(dossierService.assignLawyer).not.toHaveBeenCalled();
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      (dossierService.assignLawyer as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      const response = await request(app)
        .put('/api/cases/non-existent-id/assign')
        .send({ lawyer_id: 'lawyer-123' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('devrait gérer les erreurs inattendues gracieusement', async () => {
      (dossierService.getAllCases as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const response = await request(app)
        .get('/api/cases')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('devrait valider les données d\'entrée', async () => {
      const response = await request(app)
        .post('/api/cases')
        .send({
          description: 'Test',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

