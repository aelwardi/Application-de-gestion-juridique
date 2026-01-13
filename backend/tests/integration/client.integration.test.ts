import request from 'supertest';
import express, { Express } from 'express';
import * as clientService from '../../src/services/client.service';
import * as adminQueries from '../../src/database/queries/admin.queries';

jest.mock('../../src/services/client.service');
jest.mock('../../src/database/queries/admin.queries');

jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', role: 'admin', email: 'admin@test.com' };
    next();
  },
}));

describe('Client API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());


    const clientRoutes = require('../../src/routes/client.routes').default;
    app.use('/api/clients', clientRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);
  });

  describe('GET /api/clients/:id', () => {
    it('devrait retourner un client par ID', async () => {
      const mockClient = {
        id: 'client-123',
        user_id: 'user-123',
        email: 'client@test.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        city: 'Paris',
        is_active: true,
      };

      (clientService.getClientById as jest.Mock).mockResolvedValue(mockClient);

      const response = await request(app)
        .get('/api/clients/client-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClient);
      expect(clientService.getClientById).toHaveBeenCalledWith('client-123');
    });

    it('devrait retourner 404 si le client n\'existe pas', async () => {
      (clientService.getClientById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/clients/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('trouvé');
    });

    it('devrait retourner 500 en cas d\'erreur serveur', async () => {
      (clientService.getClientById as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/clients/client-123')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/clients', () => {
    it('devrait retourner tous les clients avec pagination', async () => {
      const mockClients = [
        {
          id: 'client-123',
          email: 'client1@test.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        {
          id: 'client-456',
          email: 'client2@test.com',
          first_name: 'Jane',
          last_name: 'Smith',
        },
      ];

      (clientService.getAllClients as jest.Mock).mockResolvedValue({
        clients: mockClients,
        total: 2,
      });

      const response = await request(app)
        .get('/api/clients')
        .query({ page: 1, limit: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClients);
      expect(response.body.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
    });

    it('devrait gérer la pagination correctement', async () => {
      (clientService.getAllClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 50,
      });

      const response = await request(app)
        .get('/api/clients')
        .query({ page: 3, limit: 10 })
        .expect(200);

      expect(response.body.pagination.totalPages).toBe(5);
      expect(clientService.getAllClients).toHaveBeenCalledWith(3, 10);
    });

    it('devrait utiliser les valeurs par défaut si non spécifiées', async () => {
      (clientService.getAllClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await request(app)
        .get('/api/clients')
        .expect(200);

      expect(clientService.getAllClients).toHaveBeenCalledWith(1, 50);
    });
  });

  describe('GET /api/clients/search', () => {
    it('devrait rechercher des clients par nom', async () => {
      const mockClients = [
        {
          id: 'client-123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@test.com',
        },
      ];

      (clientService.searchClients as jest.Mock).mockResolvedValue({
        clients: mockClients,
        total: 1,
      });

      const response = await request(app)
        .get('/api/clients/search')
        .query({ name: 'Doe' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClients);
      expect(clientService.searchClients).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Doe' })
      );
    });

    it('devrait rechercher des clients par ville', async () => {
      (clientService.searchClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await request(app)
        .get('/api/clients/search')
        .query({ city: 'Paris' })
        .expect(200);

      expect(clientService.searchClients).toHaveBeenCalledWith(
        expect.objectContaining({ city: 'Paris' })
      );
    });

    it('devrait combiner plusieurs filtres', async () => {
      (clientService.searchClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await request(app)
        .get('/api/clients/search')
        .query({
          name: 'Doe',
          city: 'Paris',
          is_active: 'true',
        })
        .expect(200);

      expect(clientService.searchClients).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Doe',
          city: 'Paris',
          is_active: true,
        })
      );
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      (clientService.searchClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/clients/search')
        .query({ name: 'NonExistent' })
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('GET /api/clients/lawyer/:lawyerId', () => {
    it('devrait retourner les clients d\'un avocat', async () => {
      const mockClients = [
        {
          id: 'client-123',
          first_name: 'John',
          last_name: 'Doe',
        },
      ];

      (clientService.getClientsByLawyer as jest.Mock).mockResolvedValue({
        clients: mockClients,
        total: 1,
      });

      const response = await request(app)
        .get('/api/clients/lawyer/lawyer-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClients);
      expect(clientService.getClientsByLawyer).toHaveBeenCalledWith('lawyer-123', 50, 0);
    });

    it('devrait gérer la pagination', async () => {
      (clientService.getClientsByLawyer as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      await request(app)
        .get('/api/clients/lawyer/lawyer-123')
        .query({ limit: 10, offset: 20 })
        .expect(200);

      expect(clientService.getClientsByLawyer).toHaveBeenCalledWith('lawyer-123', 10, 20);
    });

    it('devrait retourner un tableau vide si l\'avocat n\'a pas de clients', async () => {
      (clientService.getClientsByLawyer as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/clients/lawyer/lawyer-123')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('devrait gérer les erreurs inattendues avec un 500', async () => {
      (clientService.getAllClients as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const response = await request(app)
        .get('/api/clients')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('devrait valider les paramètres de requête', async () => {
      (clientService.getAllClients as jest.Mock).mockResolvedValue({
        clients: [],
        total: 0,
      });

      // Should handle invalid pagination params gracefully
      await request(app)
        .get('/api/clients')
        .query({ page: 'invalid', limit: 'invalid' })
        .expect(200);

      // Should default to valid values
      expect(clientService.getAllClients).toHaveBeenCalledWith(1, 50);
    });
  });
});

