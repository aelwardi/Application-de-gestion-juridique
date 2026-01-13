import { Request, Response } from 'express';
import { ClientController } from '../../../src/controllers/client.controller';
import * as clientService from '../../../src/services/client.service';
import * as adminQueries from '../../../src/database/queries/admin.queries';

jest.mock('../../../src/services/client.service');
jest.mock('../../../src/database/queries/admin.queries');

describe('ClientController', () => {
  let clientController: ClientController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockClient = {
    id: 'client-123',
    email: 'client@test.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'Paris',
    postal_code: '75001',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    clientController = new ClientController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    // ...existing code...
    jest.clearAllMocks();
    (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

    mockRequest = {
      body: {},
      params: {},
      query: {},
    } as Partial<Request>;

    (mockRequest as any).user = { userId: 'user-123', role: 'admin' };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('getClientById', () => {
    it('devrait retourner un client par ID', async () => {
      mockRequest.params = { id: 'client-123' };
      (clientService.getClientById as jest.Mock).mockResolvedValue(mockClient);

      await clientController.getClientById(mockRequest as Request, mockResponse as Response);

      expect(clientService.getClientById).toHaveBeenCalledWith('client-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockClient,
      });
    });

    it('devrait retourner 404 si le client n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      (clientService.getClientById as jest.Mock).mockResolvedValue(null);

      await clientController.getClientById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Client non trouvé',
      });
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { id: 'client-123' };
      (clientService.getClientById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await clientController.getClientById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération du client',
        error: 'Database error',
      });
    });
  });

  describe('getAllClients', () => {
    it('devrait retourner tous les clients avec pagination', async () => {
      const mockClients = [mockClient, { ...mockClient, id: 'client-456' }];
      mockRequest.query = { page: '1', limit: '50' };

      (clientService.getAllClients as jest.Mock).mockResolvedValue({
        clients: mockClients,
        total: 2,
      });

      await clientController.getAllClients(mockRequest as Request, mockResponse as Response);

      expect(clientService.getAllClients).toHaveBeenCalledWith(1, 50);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockClients,
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('devrait utiliser les valeurs par défaut', async () => {
      mockRequest.query = {};
      (clientService.getAllClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await clientController.getAllClients(mockRequest as Request, mockResponse as Response);

      expect(clientService.getAllClients).toHaveBeenCalledWith(1, 50);
    });

    it('devrait gérer la pagination correctement', async () => {
      mockRequest.query = { page: '3', limit: '10' };
      (clientService.getAllClients as jest.Mock).mockResolvedValue({
        clients: [mockClient],
        total: 25,
      });

      await clientController.getAllClients(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: {
            page: 3,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
        })
      );
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.query = {};
      (clientService.getAllClients as jest.Mock).mockRejectedValue(new Error('Database error'));

      await clientController.getAllClients(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des clients',
        error: 'Database error',
      });
    });
  });

  describe('searchClients', () => {
    it('devrait rechercher des clients avec des filtres', async () => {
      mockRequest.query = {
        name: 'Doe',
        city: 'Paris',
        is_active: 'true',
        limit: '50',
        offset: '0',
      };

      (clientService.searchClients as jest.Mock).mockResolvedValue({
        clients: [mockClient],
        total: 1,
      });

      await clientController.searchClients(mockRequest as Request, mockResponse as Response);

      expect(clientService.searchClients).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Doe',
          city: 'Paris',
          is_active: true,
        })
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('devrait gérer les filtres optionnels', async () => {
      mockRequest.query = { email: 'client@test.com' };

      (clientService.searchClients as jest.Mock).mockResolvedValue({
        clients: [mockClient],
        total: 1,
      });

      await clientController.searchClients(mockRequest as Request, mockResponse as Response);

      expect(clientService.searchClients).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'client@test.com',
        })
      );
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      mockRequest.query = { name: 'NonExistent' };

      (clientService.searchClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await clientController.searchClients(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
        })
      );
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.query = { name: 'Doe' };
      (clientService.searchClients as jest.Mock).mockRejectedValue(new Error('Database error'));

      await clientController.searchClients(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la recherche des clients',
        error: 'Database error',
      });
    });
  });

  describe('getClientsByLawyer', () => {
    it('devrait retourner les clients d\'un avocat', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };
      mockRequest.query = { limit: '50', offset: '0' };

      (clientService.getClientsByLawyer as jest.Mock).mockResolvedValue({
        clients: [mockClient],
        total: 1,
      });

      await clientController.getClientsByLawyer(mockRequest as Request, mockResponse as Response);

      expect(clientService.getClientsByLawyer).toHaveBeenCalledWith('lawyer-123', 50, 0);
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('devrait utiliser les valeurs par défaut pour la pagination', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };
      mockRequest.query = {};

      (clientService.getClientsByLawyer as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await clientController.getClientsByLawyer(mockRequest as Request, mockResponse as Response);

      expect(clientService.getClientsByLawyer).toHaveBeenCalledWith('lawyer-123', 50, 0);
    });

    it('devrait retourner un tableau vide si l\'avocat n\'a pas de clients', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };
      mockRequest.query = {};

      (clientService.getClientsByLawyer as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await clientController.getClientsByLawyer(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
        })
      );
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.params = { lawyerId: 'lawyer-123' };
      mockRequest.query = {};

      (clientService.getClientsByLawyer as jest.Mock).mockRejectedValue(new Error('Database error'));

      await clientController.getClientsByLawyer(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des clients de l\'avocat',
        error: 'Database error',
      });
    });
  });
});
