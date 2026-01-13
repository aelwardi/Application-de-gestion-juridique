import { Request, Response } from 'express';
import * as dossierController from '../../../src/controllers/dossier.controller';
import { dossierService } from '../../../src/services/dossier.service';
import * as adminQueries from '../../../src/database/queries/admin.queries';
import { CreateCaseDTO, UpdateCaseDTO } from '../../../src/types/case.types';

jest.mock('../../../src/services/dossier.service');
jest.mock('../../../src/database/queries/admin.queries');

describe('DossierController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

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
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      ip: '127.0.0.1',
      socket: {} as any,
      get: jest.fn(),
    } as Partial<Request>;

    // Add user property outside of the Partial<Request> to avoid type errors
    (mockRequest as any).user = { userId: 'user-123', role: 'avocat' };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('createCase', () => {
    it('devrait créer un dossier avec succès', async () => {
      const caseData: CreateCaseDTO = {
        title: 'Nouveau dossier',
        case_type: 'civil',
        client_id: 'client-123',
        description: 'Description',
      };

      mockRequest.body = caseData;
      (dossierService.createCase as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCase,
        message: 'Dossier créé avec succès',
      });
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      await dossierController.dossierController.createCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.createCase).toHaveBeenCalledWith(caseData);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCase,
        })
      );
    });

    it('devrait retourner 400 si les champs requis manquent', async () => {
      mockRequest.body = { description: 'Test' }; // Missing required fields

      await dossierController.dossierController.createCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Les champs title, case_type et client_id sont requis',
      });
      expect(dossierService.createCase).not.toHaveBeenCalled();
    });

    it('devrait créer un log d\'activité après création', async () => {
      const caseData: CreateCaseDTO = {
        title: 'Nouveau dossier',
        case_type: 'civil',
        client_id: 'client-123',
      };

      mockRequest.body = caseData;
      (dossierService.createCase as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCase,
      });
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      await dossierController.dossierController.createCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'user-123',
        'CASE_CREATED',
        'case',
        mockCase.id,
        '127.0.0.1',
        null,
        expect.objectContaining({
          title: caseData.title,
          case_type: caseData.case_type,
          client_id: caseData.client_id,
        })
      );
    });

    it('devrait continuer si le log d\'activité échoue', async () => {
      const caseData: CreateCaseDTO = {
        title: 'Nouveau dossier',
        case_type: 'civil',
        client_id: 'client-123',
      };

      mockRequest.body = caseData;
      (dossierService.createCase as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCase,
      });
      (adminQueries.createActivityLog as jest.Mock).mockRejectedValue(
        new Error('Log error')
      );

      await dossierController.dossierController.createCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.body = {
        title: 'Test',
        case_type: 'civil',
        client_id: 'client-123',
      };
      (dossierService.createCase as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await dossierController.dossierController.createCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Database error',
      });
    });
  });

  describe('getAllCases', () => {
    it('devrait retourner tous les dossiers', async () => {
      const mockCases = [mockCase];
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCases,
        total: 1,
      });

      await dossierController.dossierController.getAllCases(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.getAllCases).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCases,
        })
      );
    });

    it('devrait filtrer par statut', async () => {
      mockRequest.query = { status: 'open' };
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCase],
        total: 1,
      });

      await dossierController.dossierController.getAllCases(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'open' })
      );
    });

    it('devrait filtrer par client_id', async () => {
      mockRequest.query = { client_id: 'client-123' };
      (dossierService.getAllCases as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockCase],
        total: 1,
      });

      await dossierController.dossierController.getAllCases(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.getAllCases).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: 'client-123' })
      );
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      (dossierService.getAllCases as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await dossierController.dossierController.getAllCases(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Database error',
      });
    });
  });

  describe('getCaseById', () => {
    it('devrait retourner un dossier par ID', async () => {
      mockRequest.params = { id: 'case-123' };
      (dossierService.getCaseById as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCase,
      });

      await dossierController.dossierController.getCaseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.getCaseById).toHaveBeenCalledWith('case-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCase,
        })
      );
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      (dossierService.getCaseById as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      await dossierController.dossierController.getCaseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Dossier non trouvé',
      });
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'case-123' };
      (dossierService.getCaseById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await dossierController.dossierController.getCaseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Database error',
      });
    });
  });

  describe('updateCase', () => {
    it('devrait mettre à jour un dossier', async () => {
      const updateData: UpdateCaseDTO = {
        status: 'in_progress',
        priority: 'high',
      };

      mockRequest.params = { id: 'case-123' };
      mockRequest.body = updateData;
      (dossierService.updateCase as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockCase, ...updateData },
        message: 'Dossier mis à jour',
      });

      await dossierController.dossierController.updateCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.updateCase).toHaveBeenCalledWith('case-123', updateData);
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { status: 'closed' };
      (dossierService.updateCase as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      await dossierController.dossierController.updateCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'case-123' };
      mockRequest.body = {};
      (dossierService.updateCase as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await dossierController.dossierController.updateCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteCase', () => {
    it('devrait supprimer un dossier', async () => {
      mockRequest.params = { id: 'case-123' };
      (dossierService.deleteCase as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Dossier supprimé',
      });

      await dossierController.dossierController.deleteCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.deleteCase).toHaveBeenCalledWith('case-123');
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      (dossierService.deleteCase as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      await dossierController.dossierController.deleteCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'case-123' };
      (dossierService.deleteCase as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await dossierController.dossierController.deleteCase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('assignLawyer', () => {
    it('devrait assigner un avocat à un dossier', async () => {
      mockRequest.params = { id: 'case-123' };
      mockRequest.body = { lawyer_id: 'lawyer-123' };
      (dossierService.assignLawyer as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Avocat assigné',
      });

      await dossierController.dossierController.assignLawyer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(dossierService.assignLawyer).toHaveBeenCalledWith('case-123', 'lawyer-123');
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 400 si lawyer_id manque', async () => {
      mockRequest.params = { id: 'case-123' };
      mockRequest.body = {};

      await dossierController.dossierController.assignLawyer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Le champ lawyer_id est requis',
      });
      expect(dossierService.assignLawyer).not.toHaveBeenCalled();
    });

    it('devrait retourner 404 si le dossier n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { lawyer_id: 'lawyer-123' };
      (dossierService.assignLawyer as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Dossier non trouvé',
      });

      await dossierController.dossierController.assignLawyer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'case-123' };
      mockRequest.body = { lawyer_id: 'lawyer-123' };
      (dossierService.assignLawyer as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await dossierController.dossierController.assignLawyer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});

