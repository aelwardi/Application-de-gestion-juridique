import { describe, it, expect, vi, beforeEach } from 'vitest';
const mockApiFetch = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch,
  }),
}));

describe('[NomDuComposable] - Tests Unitaires', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockReset();
  });

  const mockData = {
    id: '1',
    name: 'Test',
  };

  describe('Fonctionnalité principale', () => {
    it('devrait [comportement attendu]', async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockData,
      });

    });

    it('devrait gérer les erreurs', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Erreur API'));

    });
  });

  describe('État de chargement', () => {
    it('devrait gérer l\'état de chargement', async () => {
      let isLoading = false;

      mockApiFetch.mockImplementationOnce(() => {
        isLoading = true;
        return new Promise((resolve) => {
          setTimeout(() => {
            isLoading = false;
            resolve({ success: true, data: mockData });
          }, 100);
        });
      });

    });
  });

  describe('Cas limites', () => {
    it('devrait gérer des données vides', async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: null,
      });

    });

    it('devrait gérer une erreur 404', async () => {
      const error = new Error('Not found');
      (error as any).status = 404;
      mockApiFetch.mockRejectedValueOnce(error);
    });
  });
});