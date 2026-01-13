import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { createMockUser } from '../../helpers/integration-utils';

describe('Auth Flow Integration Tests - Simplified', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  describe('Registration Flow', () => {
    it('should complete registration flow successfully', async () => {
      const authStore = useAuthStore();
      const userData = {
        email: 'newuser@test.com',
        password: 'Test123!@#',
        firstName: 'New',
        lastName: 'User',
        role: 'client' as const,
      };

      const mockUser = createMockUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }
      });

      const result = await authStore.register(userData);

      expect(result.success).toBe(true);

      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.accessToken).toBe('mock-access-token');

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
    });

    it('should handle registration validation errors', async () => {
      const authStore = useAuthStore();

      vi.mocked($fetch).mockRejectedValueOnce({
        data: { message: 'Email déjà utilisé' },
        status: 409
      });

      const result = await authStore.register({
        email: 'existing@test.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
        role: 'client' as const,
      });

      expect(result.success).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });
  });

  describe('Login Flow', () => {
    it('should complete login flow successfully', async () => {
      const authStore = useAuthStore();
      const credentials = {
        email: 'user@test.com',
        password: 'Test123!@#',
      };

      const mockUser = createMockUser({ email: credentials.email });

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          accessToken: 'login-access-token',
          refreshToken: 'login-refresh-token',
        }
      });

      const result = await authStore.login(credentials);

      expect(result.success).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user?.email).toBe(credentials.email);
      expect(authStore.accessToken).toBe('login-access-token');
    });

    it('should handle invalid credentials', async () => {
      const authStore = useAuthStore();

      vi.mocked($fetch).mockRejectedValueOnce({
        data: { message: 'Email ou mot de passe incorrect' },
        status: 401
      });

      const result = await authStore.login({
        email: 'wrong@test.com',
        password: 'WrongPassword',
      });

      expect(result.success).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('Logout Flow', () => {
    it('should complete logout flow successfully', async () => {
      const authStore = useAuthStore();

      authStore.user = createMockUser() as any;
      authStore.accessToken = 'test-token';
      authStore.refreshToken = 'test-refresh-token';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true
      });

      await authStore.logout();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.accessToken).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should clear local state even if API call fails', async () => {
      const authStore = useAuthStore();
      authStore.user = createMockUser() as any;
      authStore.accessToken = 'test-token';

      vi.mocked($fetch).mockRejectedValueOnce(new Error('Network error'));

      await authStore.logout();

      expect(authStore.user).toBeNull();
      expect(authStore.accessToken).toBeNull();
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh token successfully', async () => {
      const authStore = useAuthStore();
      authStore.refreshToken = 'valid-refresh-token';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }
      });

      await authStore.refreshAccessToken();

      expect(authStore.accessToken).toBe('new-access-token');
      expect(authStore.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('State Persistence', () => {
    it('should save auth state to localStorage', async () => {
      const authStore = useAuthStore();
      const mockUser = createMockUser();

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          accessToken: 'token',
          refreshToken: 'refresh',
        }
      });

      await authStore.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh');
    });

    it('should clear localStorage on logout', async () => {
      const authStore = useAuthStore();
      authStore.user = createMockUser() as any;
      authStore.accessToken = 'token';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true
      });

      await authStore.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const authStore = useAuthStore();

      vi.mocked($fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await authStore.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result.success).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('should handle malformed API responses', async () => {
      const authStore = useAuthStore();

      vi.mocked($fetch).mockResolvedValueOnce({
        success: false,
        message: 'Invalid response'
      });

      const result = await authStore.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result.success).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
    });
  });
});

