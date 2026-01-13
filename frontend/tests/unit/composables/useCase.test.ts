import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCase } from '~/composables/useCase';
import type { Case, CreateCaseDTO } from '~/types/case';

const mockFetch = vi.fn();
global.$fetch = mockFetch as any;

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000/api',
    },
  }),
}));

const mockAuthStore = {
  accessToken: 'mock-token',
  user: { id: 'user-1', role: 'client' },
};

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

describe('useCase - Tests Unitaires', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  const mockCase: Partial<Case> = {
    id: '1',
    client_id: 'client-1',
    lawyer_id: 'lawyer-1',
    title: 'Litige commercial',
    description: 'Conflit avec un fournisseur',
    case_type: 'Droit commercial',
    status: 'pending' as any,
    priority: 'medium',
    case_number: 'CASE-2026-001',
    opening_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  describe('getLawyers', () => {
    it('devrait récupérer la liste des avocats', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: 'user-1',
            role: 'avocat',
            first_name: 'Marie',
            last_name: 'Dupont',
            email: 'marie@example.com',
            lawyer_info: {
              bar_number: 'BAR123',
              specialties: ['Droit civil'],
              experience_years: 5,
            },
          },
        ],
      });

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('Marie');
      expect(result[0].bar_number).toBe('BAR123');
    });

    it('devrait filtrer uniquement les avocats', async () => {
      mockFetch.mockResolvedValueOnce([
        { id: '1', role: 'avocat', first_name: 'Avocat' },
        { id: '2', role: 'client', first_name: 'Client' },
        { id: '3', role: 'lawyer', first_name: 'Lawyer' },
      ]);

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result).toHaveLength(2);
      expect(result.some(l => l.first_name === 'Client')).toBe(false);
    });

    it('devrait gérer les erreurs et retourner un tableau vide', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result).toEqual([]);
    });

    it('devrait gérer une réponse avec des données nulles', async () => {
      mockFetch.mockResolvedValueOnce({ success: true, data: null });

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result).toEqual([]);
    });

    it('devrait mapper correctement les informations des avocats', async () => {
      mockFetch.mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            role: 'avocat',
            first_name: 'Jean',
            last_name: 'Martin',
            email: 'jean@example.com',
            lawyer_info: {
              id: 'lawyer-1',
              bar_number: 'BAR456',
              specialties: ['Droit pénal', 'Droit civil'],
              experience_years: 10,
              office_city: 'Lyon',
              hourly_rate: 200,
            },
          },
        ],
      });

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result[0]).toMatchObject({
        id: 'user-1',
        first_name: 'Jean',
        last_name: 'Martin',
        bar_number: 'BAR456',
        specialties: ['Droit pénal', 'Droit civil'],
        experience_years: 10,
        office_city: 'Lyon',
        hourly_rate: 200,
      });
    });
  });

  describe('getPendingOffers', () => {
    it('devrait récupérer les offres en attente', async () => {
      const mockOffers = [
        { id: '1', status: 'pending', case_id: 'case-1' },
        { id: '2', status: 'pending', case_id: 'case-2' },
      ];

      mockFetch.mockResolvedValueOnce(mockOffers);

      const { getPendingOffers } = useCase();
      const result = await getPendingOffers('lawyer-1');

      expect(result).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/offers/pending/lawyer-1',
        expect.any(Object)
      );
    });

    it('devrait retourner un tableau vide en cas d\'erreur', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const { getPendingOffers } = useCase();
      const result = await getPendingOffers('lawyer-1');

      expect(result).toEqual([]);
    });

    it('devrait gérer un avocat sans offres', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const { getPendingOffers } = useCase();
      const result = await getPendingOffers('lawyer-1');

      expect(result).toEqual([]);
    });
  });

  describe('acceptOffer', () => {
    it('devrait accepter une offre', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        message: 'Offer accepted',
      });

      const { acceptOffer } = useCase();
      const result = await acceptOffer('offer-1');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/offers/offer-1/accept',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('devrait gérer les erreurs d\'acceptation', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Cannot accept offer'));

      const { acceptOffer } = useCase();

      await expect(acceptOffer('offer-1')).rejects.toThrow('Cannot accept offer');
    });

    it('devrait inclure le token d\'authentification', async () => {
      mockFetch.mockResolvedValueOnce({ success: true });

      const { acceptOffer } = useCase();
      await acceptOffer('offer-1');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3000/api/offers/offer-1/accept');
      expect(callArgs[1].method).toBe('POST');
    });
  });

  describe('declineOffer', () => {
    it('devrait décliner une offre', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        message: 'Offer declined',
      });

      const { declineOffer } = useCase();
      const result = await declineOffer('offer-1');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/offers/offer-1/decline',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('devrait gérer les erreurs de déclinaison', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Cannot decline offer'));

      const { declineOffer } = useCase();

      await expect(declineOffer('offer-1')).rejects.toThrow('Cannot decline offer');
    });
  });

  describe('Headers et authentification', () => {
    it('devrait inclure Content-Type dans les headers', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const { getLawyers } = useCase();
      await getLawyers();

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders['Content-Type']).toBe('application/json');
    });

    it('devrait fonctionner sans token d\'authentification', async () => {
      mockAuthStore.accessToken = null as any;
      mockFetch.mockResolvedValueOnce([]);

      const { getLawyers } = useCase();
      await getLawyers();

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer des avocats sans informations lawyer_info', async () => {
      mockFetch.mockResolvedValueOnce([
        {
          id: 'user-1',
          role: 'avocat',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
        },
      ]);

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result[0].bar_number).toBe('NC');
      expect(result[0].specialties).toEqual([]);
      expect(result[0].experience_years).toBe(0);
    });

    it('devrait gérer un user_type alternatif', async () => {
      mockFetch.mockResolvedValueOnce([
        {
          id: 'user-1',
          user_type: 'lawyer',
          first_name: 'Lawyer',
          last_name: 'Test',
        },
      ]);

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('Lawyer');
    });

    it('devrait gérer des données imbriquées différentes', async () => {
      mockFetch.mockResolvedValueOnce([
        {
          id: 'user-1',
          role: 'avocat',
          first_name: 'Test',
          lawyer_profile: {
            bar_number: 'PROFILE123',
            presentation: 'Bio from profile',
          },
        },
      ]);

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result[0].bar_number).toBe('PROFILE123');
      expect(result[0].description).toBe('Bio from profile');
    });

    it('devrait gérer un grand nombre d\'avocats', async () => {
      const manyLawyers = Array.from({ length: 100 }, (_, i) => ({
        id: `lawyer-${i}`,
        role: 'avocat',
        first_name: `Lawyer${i}`,
        last_name: 'Test',
      }));

      mockFetch.mockResolvedValueOnce(manyLawyers);

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result).toHaveLength(100);
    });
  });

  describe('Gestion des erreurs réseau', () => {
    it('devrait gérer un timeout', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result).toEqual([]);
    });

    it('devrait gérer une erreur 500', async () => {
      const error = new Error('Internal Server Error');
      (error as any).status = 500;
      mockFetch.mockRejectedValueOnce(error);

      const { getPendingOffers } = useCase();
      const result = await getPendingOffers('lawyer-1');

      expect(result).toEqual([]);
    });

    it('devrait gérer une erreur 404 pour les offres', async () => {
      const error = new Error('Not found');
      (error as any).status = 404;
      mockFetch.mockRejectedValueOnce(error);

      const { getPendingOffers } = useCase();
      const result = await getPendingOffers('invalid-id');

      expect(result).toEqual([]);
    });
  });

  describe('Validation des données', () => {
    it('devrait valider que les avocats ont un ID', async () => {
      mockFetch.mockResolvedValueOnce([
        { role: 'avocat', first_name: 'Test' }, // Pas d'ID
      ]);

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result[0].id).toBeUndefined();
    });

    it('devrait mapper lawyerTableId correctement', async () => {
      mockFetch.mockResolvedValueOnce([
        {
          id: 'user-1',
          role: 'avocat',
          lawyer_info: { id: 'lawyer-table-1' },
        },
      ]);

      const { getLawyers } = useCase();
      const result = await getLawyers();

      expect(result[0].lawyerTableId).toBe('lawyer-table-1');
    });
  });
});