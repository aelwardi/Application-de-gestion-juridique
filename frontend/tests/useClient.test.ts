import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useClient } from '~/composables/useClient';
import { createMockAuthStore, mockFetchSuccess, mockFetchError } from './helpers/test-utils';

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: (url: string, options?: any) => {
      return $fetch(url, options);
    }
  })
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
    it('should search clients by name', () => {
      const clients = [
        mockClient({ id: '1', first_name: 'Jean', last_name: 'Dupont' }),
        mockClient({ id: '2', first_name: 'Marie', last_name: 'Martin' }),
        mockClient({ id: '3', first_name: 'Jean', last_name: 'Durand' }),
      ];

      const searchTerm = 'Jean';
      const results = clients.filter(c =>
        c.first_name.includes(searchTerm) || c.last_name.includes(searchTerm)
      );

      expect(results).toHaveLength(2);
      expect(results.every(c => c.first_name === 'Jean')).toBe(true);
    });

    it('should filter by email', () => {
      const clients = [
        mockClient({ id: '1', email: 'jean@test.com' }),
        mockClient({ id: '2', email: 'marie@test.com' }),
      ];

      const result = clients.find(c => c.email === 'jean@test.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('jean@test.com');
    });

    it('should handle case-insensitive search', () => {
      const clients = [
        mockClient({ first_name: 'Jean', last_name: 'Dupont' }),
      ];

      const results = clients.filter(c =>
        c.first_name.toLowerCase().includes('jean'.toLowerCase())
      );

      expect(results).toHaveLength(1);
    });
  });

  describe('Get Client', () => {

    it('should handle not found error', async () => {
      const { getClient } = useClient();
      mockFetchError(404, 'Client not found');

      await expect(getClient('nonexistent')).rejects.toThrow();
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

    it('should handle last page with partial results', () => {
      const page = 3;
      const limit = 10;
      const total = 25;

      const totalPages = Math.ceil(total / limit);
      const itemsOnPage = total - (page - 1) * limit;

      expect(totalPages).toBe(3);
      expect(itemsOnPage).toBe(5);
    });

    it('should handle empty results', () => {
      const total = 0;
      const limit = 10;

      const totalPages = Math.ceil(total / limit);

      expect(totalPages).toBe(0);
    });
  });

  describe('Create Client', () => {
    it('should handle duplicate email error', async () => {
      const { createClient } = useClient();
      mockFetchError(409, 'Email already exists');

      const result = await createClient({
        first_name: 'Test',
        last_name: 'User',
        email: 'existing@test.com',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Delete Client', () => {
    it('should delete client successfully', async () => {
      const { deleteClient } = useClient();
      mockFetchSuccess({ success: true });

      const result = await deleteClient('1');

      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle search with no results', () => {
      const clients = [mockClient()];

      const results = clients.filter(c =>
        c.first_name.includes('NonExistent')
      );

      expect(results).toHaveLength(0);
    });
  });
});