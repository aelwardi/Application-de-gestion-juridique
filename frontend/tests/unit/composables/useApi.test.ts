import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApi } from '~/composables/useApi';
import { createMockAuthStore } from '~/tests/helpers/test-utils';

const mockFetch = vi.fn() as any;
mockFetch.raw = vi.fn();
mockFetch.create = vi.fn(() => mockFetch);
global.$fetch = mockFetch;

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000/api',
    },
  }),
}));

const mockAuthStoreState = {
  accessToken: 'mock-token',
  isAuthenticated: true,
  user: null,
  refreshToken: null,
  isLoading: false,
  isAdmin: false,
  isLawyer: false,
  isClient: false,
  fullName: '',
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  loadTokensFromStorage: vi.fn(),
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshAccessToken: vi.fn(),
  updateProfile: vi.fn(),
  getAuthHeaders: vi.fn(),
};

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStoreState,
}));

describe('useApi - Tests Unitaires', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockAuthStoreState.accessToken = 'mock-token';
  });

  describe('Configuration et Headers', () => {
    it('devrait fonctionner sans token d\'authentification', async () => {
      mockAuthStoreState.accessToken = '';
      mockFetch.mockResolvedValueOnce({ success: true, data: {} });

      const { apiFetch } = useApi();
      await apiFetch('/test');

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs?.headers?.Authorization).toBeUndefined();
    });

    it('devrait construire l\'URL complète avec le baseURL', async () => {
      mockFetch.mockResolvedValueOnce({ success: true });

      const { apiFetch } = useApi();
      await apiFetch('/clients');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/clients',
        expect.any(Object)
      );
    });

    it('devrait gérer les URLs absolues', async () => {
      mockFetch.mockResolvedValueOnce({ success: true });

      const { apiFetch } = useApi();
      await apiFetch('http://external-api.com/data');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://external-api.com/data',
        expect.any(Object)
      );
    });
  });

  describe('Succès des requêtes', () => {
    it('devrait retourner les données en cas de succès', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockFetch.mockResolvedValueOnce({ success: true, data: mockData });

      const { apiFetch } = useApi();
      const result = await apiFetch('/test');

      expect(result).toEqual({ success: true, data: mockData });
    });

    it('devrait gérer les requêtes GET', async () => {
      mockFetch.mockResolvedValueOnce({ success: true, data: [] });

      const { apiFetch } = useApi();
      await apiFetch('/clients', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('devrait gérer les requêtes POST avec body', async () => {
      const postData = { email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce({ success: true, data: postData });

      const { apiFetch } = useApi();
      await apiFetch('/auth/register', {
        method: 'POST',
        body: postData,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: postData,
        })
      );
    });

    it('devrait gérer les requêtes PUT', async () => {
      const updateData = { name: 'Updated' };
      mockFetch.mockResolvedValueOnce({ success: true, data: updateData });

      const { apiFetch } = useApi();
      await apiFetch('/clients/1', {
        method: 'PUT',
        body: updateData,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('devrait gérer les requêtes DELETE', async () => {
      mockFetch.mockResolvedValueOnce({ success: true });

      const { apiFetch } = useApi();
      await apiFetch('/clients/1', { method: 'DELETE' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait propager les erreurs API', async () => {
      const error = new Error('API Error');
      (error as any).status = 500;
      mockFetch.mockRejectedValueOnce(error);

      const { apiFetch } = useApi();

      await expect(apiFetch('/test')).rejects.toThrow('API Error');
    });

    it('devrait gérer les erreurs 401 (Non autorisé)', async () => {
      const error = new Error('Unauthorized');
      (error as any).status = 401;
      mockFetch.mockRejectedValueOnce(error);

      const { apiFetch } = useApi();

      await expect(apiFetch('/test')).rejects.toThrow('Unauthorized');
    });

    it('devrait gérer les erreurs 403 (Interdit)', async () => {
      const error = new Error('Forbidden');
      (error as any).status = 403;
      mockFetch.mockRejectedValueOnce(error);

      const { apiFetch } = useApi();

      await expect(apiFetch('/test')).rejects.toThrow('Forbidden');
    });

    it('devrait gérer les erreurs 404 (Non trouvé)', async () => {
      const error = new Error('Not Found');
      (error as any).status = 404;
      mockFetch.mockRejectedValueOnce(error);

      const { apiFetch } = useApi();

      await expect(apiFetch('/clients/999')).rejects.toThrow('Not Found');
    });

    it('devrait gérer les erreurs 500 (Erreur serveur)', async () => {
      const error = new Error('Internal Server Error');
      (error as any).status = 500;
      mockFetch.mockRejectedValueOnce(error);

      const { apiFetch } = useApi();

      await expect(apiFetch('/test')).rejects.toThrow('Internal Server Error');
    });

    it('devrait gérer les erreurs réseau', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { apiFetch } = useApi();

      await expect(apiFetch('/test')).rejects.toThrow('Network error');
    });
  });

  describe('Options personnalisées', () => {
    it('devrait fusionner les headers personnalisés', async () => {
      mockFetch.mockResolvedValueOnce({ success: true });

      const { apiFetch } = useApi();
      await apiFetch('/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('devrait permettre de surcharger les options', async () => {
      mockFetch.mockResolvedValueOnce({ success: true });

      const { apiFetch } = useApi();
      await apiFetch('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
    });
  });

  describe('État de chargement (loading state)', () => {
    it('devrait gérer correctement l\'état pendant un appel API', async () => {
      let isLoading = false;

      mockFetch.mockImplementationOnce(() => {
        isLoading = true;
        return Promise.resolve({ success: true }).finally(() => {
          isLoading = false;
        });
      });

      const { apiFetch } = useApi();
      const promise = apiFetch('/test');

      expect(mockFetch).toHaveBeenCalled();

      await promise;

      expect(isLoading).toBe(false);
    });
  });
});