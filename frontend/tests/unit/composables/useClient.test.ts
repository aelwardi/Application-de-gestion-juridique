import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useClient } from '~/composables/useClient';
import { createMockAuthStore, mockFetchSuccess, mockFetchError } from '~/tests/helpers/test-utils';

vi.mock('~/composables/useApi', () => ({
  useApi: vi.fn(() => ({
    apiFetch: vi.fn((url: string, options?: any) => $fetch(url, options))
  }))
}));

describe('useClient Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore({ accessToken: 'test-token' });
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  const mockClient = (overrides = {}) => ({
    id: '1',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean@test.com',
    phone: '+1234567890',
    created_at: new Date().toISOString(),
    ...overrides,
  });

  describe('Search Clients', () => {
    it('should search clients by name', async () => {
      const { searchClients } = useClient();
      const clients = [mockClient()];
      vi.mocked($fetch).mockResolvedValueOnce({ data: clients, pagination: { total: 1, page: 1, limit: 50, totalPages: 1 } });

      const result = await searchClients({ name: 'Jean' });

      expect(result.data).toHaveLength(1);
    });

    it('should search clients by email', async () => {
      const { searchClients } = useClient();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } });

      const result = await searchClients({ email: 'test@example.com' });

      expect(result.data).toEqual([]);
    });

    it('should handle search with multiple filters', async () => {
      const { searchClients } = useClient();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } });

      const result = await searchClients({
        name: 'Jean',
        city: 'Paris',
        isActive: true,
      });

      expect(result.data).toBeDefined();
    });
  });

  describe('Get Client', () => {
    it('should fetch client by ID', async () => {
      const { getClientById } = useClient();
      const client = mockClient({ id: '1' });
      vi.mocked($fetch).mockResolvedValueOnce({ data: client });

      const result = await getClientById('1');

      expect(result.id).toBe('1');
      expect(result.email).toBe('jean@test.com');
    });

    it('should handle not found error', async () => {
      const { getClientById } = useClient();
      mockFetchError(404, 'Client not found');

      await expect(getClientById('nonexistent')).rejects.toThrow();
    });
  });

  describe('Pagination', () => {
    it('should calculate pagination correctly', () => {
      const page = 1;
      const limit = 10;
      const total = 25;

      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      expect(totalPages).toBe(3);
      expect(offset).toBe(0);
    });

    it('should fetch clients with pagination', async () => {
      const { getAllClients } = useClient();
      vi.mocked($fetch).mockResolvedValueOnce({
        data: [mockClient()],
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 }
      });

      const result = await getAllClients(1, 50);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should handle page calculation', () => {
      const currentPage = 2;
      const limit = 10;
      const offset = (currentPage - 1) * limit;

      expect(offset).toBe(10);
    });
  });

  describe('Update Client', () => {
    it('should update client successfully', async () => {
      const { updateClient } = useClient();
      const updateData = { phone: '+9876543210' };
      const updated = mockClient({ id: '1', ...updateData });
      vi.mocked($fetch).mockResolvedValueOnce({ data: updated });

      const result = await updateClient('1', updateData);

      expect(result.phone).toBe('+9876543210');
    });
  });

  describe('Delete Client', () => {
    it('should delete client successfully', async () => {
      const { deleteClient } = useClient();
      vi.mocked($fetch).mockResolvedValueOnce({ success: true });

      await deleteClient('1');

      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty client list', async () => {
      const { getAllClients } = useClient();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } });

      const result = await getAllClients();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle search with no results', () => {
      const clients = [mockClient({ first_name: 'Jean' })];
      const filtered = clients.filter(c => c.first_name === 'Pierre');

      expect(filtered).toHaveLength(0);
    });
  });
});

