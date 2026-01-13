import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { mockUser, mockAuthResponse, mockRegisterData, mockLoginData } from '../../fixtures/user.fixture';

const mockFetch = vi.fn() as any;
mockFetch.raw = vi.fn();
mockFetch.create = vi.fn(() => mockFetch);
global.$fetch = mockFetch;

(global as any).useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
global.localStorage = localStorageMock as Storage;

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('state initial', () => {
    it('devrait avoir un état initial correct', () => {
      const authStore = useAuthStore();

      expect(authStore.user).toBeNull();
      expect(authStore.accessToken).toBeNull();
      expect(authStore.refreshToken).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('getters', () => {
    it('isAdmin devrait retourner true si le rôle est admin', () => {
      const authStore = useAuthStore();
      authStore.user = { ...mockUser, role: 'admin' };

      expect(authStore.isAdmin).toBe(true);
      expect(authStore.isLawyer).toBe(false);
      expect(authStore.isClient).toBe(false);
    });

    it('isLawyer devrait retourner true si le rôle est avocat', () => {
      const authStore = useAuthStore();
      authStore.user = { ...mockUser, role: 'avocat' };

      expect(authStore.isLawyer).toBe(true);
      expect(authStore.isAdmin).toBe(false);
      expect(authStore.isClient).toBe(false);
    });

    it('isClient devrait retourner true si le rôle est client', () => {
      const authStore = useAuthStore();
      authStore.user = { ...mockUser, role: 'client' };

      expect(authStore.isClient).toBe(true);
      expect(authStore.isAdmin).toBe(false);
      expect(authStore.isLawyer).toBe(false);
    });

    it('fullName devrait retourner le nom complet', () => {
      const authStore = useAuthStore();
      authStore.user = mockUser;

      expect(authStore.fullName).toBe('John Doe');
    });

    it('fullName devrait retourner une chaîne vide si pas d\'utilisateur', () => {
      const authStore = useAuthStore();

      expect(authStore.fullName).toBe('');
    });
  });

  describe('setAuth', () => {
    it('devrait définir l\'authentification et stocker les tokens', () => {
      const authStore = useAuthStore();

      authStore.setAuth(mockUser, 'access-token', 'refresh-token');

      expect(authStore.user).toEqual(mockUser);
      expect(authStore.accessToken).toBe('access-token');
      expect(authStore.refreshToken).toBe('refresh-token');
      expect(authStore.isAuthenticated).toBe(true);
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });
  });

  describe('clearAuth', () => {
    it('devrait effacer l\'authentification et les tokens', () => {
      const authStore = useAuthStore();
      authStore.setAuth(mockUser, 'access-token', 'refresh-token');

      authStore.clearAuth();

      expect(authStore.user).toBeNull();
      expect(authStore.accessToken).toBeNull();
      expect(authStore.refreshToken).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('loadTokensFromStorage', () => {
    it('devrait charger les tokens depuis le localStorage', () => {
      localStorage.setItem('accessToken', 'stored-access-token');
      localStorage.setItem('refreshToken', 'stored-refresh-token');

      const authStore = useAuthStore();
      authStore.loadTokensFromStorage();

      expect(authStore.accessToken).toBe('stored-access-token');
      expect(authStore.refreshToken).toBe('stored-refresh-token');
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('ne devrait rien faire si pas de tokens dans le localStorage', () => {
      const authStore = useAuthStore();
      authStore.loadTokensFromStorage();

      expect(authStore.accessToken).toBeNull();
      expect(authStore.refreshToken).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('devrait enregistrer un utilisateur avec succès', async () => {
      const authStore = useAuthStore();
      (global.$fetch as any).mockResolvedValue(mockAuthResponse);

      const result = await authStore.register(mockRegisterData);

      expect(result.success).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.accessToken).toBe('mock-access-token-123');
      expect(authStore.refreshToken).toBe('mock-refresh-token-456');
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('devrait gérer une erreur d\'enregistrement', async () => {
      const authStore = useAuthStore();
      const errorResponse = {
        data: { message: 'Email already exists' },
        status: 409,
      };
      (global.$fetch as any).mockRejectedValue(errorResponse);

      const result = await authStore.register(mockRegisterData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists');
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('devrait définir isLoading pendant l\'enregistrement', async () => {
      const authStore = useAuthStore();
      (global.$fetch as any).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockAuthResponse), 100))
      );

      const registerPromise = authStore.register(mockRegisterData);
      expect(authStore.isLoading).toBe(true);

      await registerPromise;
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      const authStore = useAuthStore();
      (global.$fetch as any).mockResolvedValue(mockAuthResponse);

      const result = await authStore.login(mockLoginData);

      expect(result.success).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('devrait gérer une erreur de connexion', async () => {
      const authStore = useAuthStore();
      const errorResponse = {
        data: { message: 'Invalid credentials' },
        status: 401,
      };
      (global.$fetch as any).mockRejectedValue(errorResponse);

      const result = await authStore.login(mockLoginData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('devrait gérer la 2FA requise', async () => {
      const authStore = useAuthStore();
      const twoFactorResponse = {
        success: true,
        message: '2FA required',
        data: {
          requiresTwoFactor: true,
          tempToken: 'temp-token',
          user: mockUser,
        },
      };
      (global.$fetch as any).mockResolvedValue(twoFactorResponse);

      const result = await authStore.login(mockLoginData);

      expect(result.success).toBe(true);
      expect(result.data.requiresTwoFactor).toBe(true);
      expect(authStore.isAuthenticated).toBe(false); // Pas encore authentifié
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur', async () => {
      const authStore = useAuthStore();
      authStore.setAuth(mockUser, 'access-token', 'refresh-token');
      (global.$fetch as any).mockResolvedValue({ success: true });

      await authStore.logout();

      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });
});
