import * as clientService from '../../../src/services/client.service';
import { pool } from '../../../src/config/database.config';
import { clientQueries } from '../../../src/database/queries/client.queries';
import { Client, ClientSearchFilters } from '../../../src/types/client.types';

jest.mock('../../../src/config/database.config');

describe('ClientService', () => {
  let mockPool: jest.Mocked<typeof pool>;

  const mockClient: Client = {
    id: 'client-123',
    email: 'client@test.com',
    password_hash: 'hashed_password',
    role: 'client',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'Paris',
    postal_code: '75001',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+0987654321',
    notes: 'Test client',
    is_active: true,
    is_verified: false,
    profile_picture_url: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    mockPool = pool as jest.Mocked<typeof pool>;
    jest.clearAllMocks();
  });

  describe('getClientById', () => {
    it('devrait retourner un client par ID', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [mockClient],
      });

      const result = await clientService.getClientById('client-123');

      expect(result).toEqual(mockClient);
      expect(mockPool.query).toHaveBeenCalledWith(clientQueries.getById, ['client-123']);
    });

    it('devrait retourner null si le client n\'existe pas', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const result = await clientService.getClientById('non-existent-id');

      expect(result).toBeNull();
    });

    it('devrait gérer les erreurs de base de données', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(clientService.getClientById('client-123')).rejects.toThrow('Database error');
    });
  });

  describe('getAllClients', () => {
    it('devrait retourner tous les clients avec pagination', async () => {
      const mockClients = [mockClient, { ...mockClient, id: 'client-456' }];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockClients })
        .mockResolvedValueOnce({ rows: [{ count: '2' }] });

      const result = await clientService.getAllClients(1, 50);

      expect(result.clients).toEqual(mockClients);
      expect(result.total).toBe(2);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('devrait gérer la pagination correctement', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [{ count: '10' }] });

      const result = await clientService.getAllClients(2, 5);

      expect(mockPool.query).toHaveBeenCalledWith(clientQueries.getAll, [5, 5]);
      expect(result.total).toBe(10);
    });

    it('devrait retourner un tableau vide si aucun client', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await clientService.getAllClients();

      expect(result.clients).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('searchClients', () => {
    it('devrait rechercher des clients par nom', async () => {
      const filters: ClientSearchFilters = {
        name: 'Doe',
        limit: 50,
        offset: 0,
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await clientService.searchClients(filters);

      expect(result.clients).toEqual([mockClient]);
      expect(result.total).toBe(1);
    });

    it('devrait rechercher des clients par email', async () => {
      const filters: ClientSearchFilters = {
        email: 'client@test.com',
        limit: 50,
        offset: 0,
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await clientService.searchClients(filters);

      expect(result.clients).toEqual([mockClient]);
    });

    it('devrait filtrer par ville', async () => {
      const filters: ClientSearchFilters = {
        city: 'Paris',
        limit: 50,
        offset: 0,
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await clientService.searchClients(filters);

      expect(result.clients).toHaveLength(1);
      expect(result.clients[0].city).toBe('Paris');
    });

    it('devrait filtrer par statut actif', async () => {
      const filters: ClientSearchFilters = {
        is_active: true,
        limit: 50,
        offset: 0,
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await clientService.searchClients(filters);

      expect(result.clients[0].is_active).toBe(true);
    });

    it('devrait combiner plusieurs filtres', async () => {
      const filters: ClientSearchFilters = {
        name: 'Doe',
        city: 'Paris',
        is_active: true,
        limit: 50,
        offset: 0,
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await clientService.searchClients(filters);

      expect(result.clients).toHaveLength(1);
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      const filters: ClientSearchFilters = {
        name: 'NonExistent',
        limit: 50,
        offset: 0,
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await clientService.searchClients(filters);

      expect(result.clients).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getClientsByLawyer', () => {
    it('devrait retourner les clients d\'un avocat', async () => {
      const mockClients = [mockClient];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockClients })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await clientService.getClientsByLawyer('lawyer-123', 50, 0);

      expect(result.clients).toEqual(mockClients);
      expect(result.total).toBe(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        clientQueries.getClientsByLawyer,
        ['lawyer-123', 50, 0]
      );
    });

    it('devrait retourner un tableau vide si l\'avocat n\'a pas de clients', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await clientService.getClientsByLawyer('lawyer-123', 50, 0);

      expect(result.clients).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('devrait gérer la pagination', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [{ count: '5' }] });

      await clientService.getClientsByLawyer('lawyer-123', 2, 4);

      expect(mockPool.query).toHaveBeenCalledWith(
        clientQueries.getClientsByLawyer,
        ['lawyer-123', 2, 4]
      );
    });
  });
});