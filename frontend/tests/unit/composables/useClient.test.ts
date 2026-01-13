import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClient } from '~/composables/useClient';
import type { Client } from '~/types/client';

const mockApiFetch = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch,
  }),
}));

describe('useClient - Tests Unitaires', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockReset();
  });

  const mockClient: Partial<Client> = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Test St',
    city: 'Paris',
    postalCode: '75001',
    isActive: true,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  describe('getClientCases', () => {
    it('devrait gérer les erreurs et retourner un tableau vide', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('API Error'));

      const { getClientCases } = useClient();
      const result = await getClientCases('user-1');

      expect(result.data).toEqual([]);
    });
  });

  describe('getClientAppointments', () => {
    it('devrait gérer les erreurs et retourner un tableau vide', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('API Error'));

      const { getClientAppointments } = useClient();
      const result = await getClientAppointments('user-1');

      expect(result.data).toEqual([]);
    });
  });

  describe('getClientDocuments', () => {
    it('devrait gérer les erreurs et retourner un tableau vide', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('API Error'));

      const { getClientDocuments } = useClient();
      const result = await getClientDocuments('user-1');

      expect(result.data).toEqual([]);
    });
  });

});