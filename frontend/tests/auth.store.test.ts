import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import {
  mockUser,
  mockLawyer,
  mockSuccessResponse,
  mockFetchSuccess,
  mockFetchError,
  setupLocalStorage,
  clearAllStorage,
} from './helpers/test-utils';

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    clearAllStorage();
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      // Arrange & Act
      const store = useAuthStore();

      // Assert
      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
    });

    it('should maintain state isolation between store instances', () => {
      // Arrange
      const store1 = useAuthStore();
      const user = mockUser();

      // Act
      store1.setAuth(user, 'token1', 'refresh1');

      // Create new pinia instance for isolation
      setActivePinia(createPinia());
      const store2 = useAuthStore();

      // Assert
      expect(store2.user).toBeNull();
      expect(store2.accessToken).toBeNull();
    });
  });

  describe('Getters', () => {
    it('should correctly identify admin role', () => {
      // Arrange
      const store = useAuthStore();
      const adminUser = mockUser({ role: 'admin' });

      // Act
      store.setAuth(adminUser, 'token', 'refresh');

      // Assert
      expect(store.isAdmin).toBe(true);
      expect(store.isLawyer).toBe(false);
      expect(store.isClient).toBe(false);
    });

    it('should correctly identify lawyer role', () => {
      // Arrange
      const store = useAuthStore();
      const lawyer = mockLawyer();

      // Act
      store.setAuth(lawyer, 'token', 'refresh');

      // Assert
      expect(store.isLawyer).toBe(true);
      expect(store.isAdmin).toBe(false);
      expect(store.isClient).toBe(false);
    });

    it('should correctly identify client role', () => {
      // Arrange
      const store = useAuthStore();
      const client = mockUser({ role: 'client' });

      // Act
      store.setAuth(client, 'token', 'refresh');

      // Assert
      expect(store.isClient).toBe(true);
      expect(store.isAdmin).toBe(false);
      expect(store.isLawyer).toBe(false);
    });

    it('should construct full name correctly', () => {
      // Arrange
      const store = useAuthStore();
      const user = mockUser({ firstName: 'John', lastName: 'Doe' });

      // Act
      store.setAuth(user, 'token', 'refresh');

      // Assert
      expect(store.fullName).toBe('John Doe');
    });

    it('should return empty string for full name when no user', () => {
      // Arrange
      const store = useAuthStore();

      // Assert
      expect(store.fullName).toBe('');
    });
  });

  describe('Token Management', () => {
    it('should store tokens in localStorage when setting auth', () => {
      // Arrange
      const store = useAuthStore();
      const user = mockUser();
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      // Act
      store.setAuth(user, accessToken, refreshToken);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', accessToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', refreshToken);
      expect(store.accessToken).toBe(accessToken);
      expect(store.refreshToken).toBe(refreshToken);
      expect(store.user).toEqual(user);
      expect(store.isAuthenticated).toBe(true);
    });

    it('should remove tokens from localStorage when clearing auth', () => {
      // Arrange
      const store = useAuthStore();
      const user = mockUser();
      store.setAuth(user, 'token', 'refresh');

      // Act
      store.clearAuth();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it('should load tokens from localStorage on initialization', () => {
      // Arrange
      setupLocalStorage({
        accessToken: 'stored-access-token',
        refreshToken: 'stored-refresh-token',
      });
      const store = useAuthStore();

      // Act
      store.loadTokensFromStorage();

      // Assert
      expect(store.accessToken).toBe('stored-access-token');
      expect(store.refreshToken).toBe('stored-refresh-token');
      expect(store.isAuthenticated).toBe(true);
    });

    it('should not set authenticated state when tokens are missing', () => {
      // Arrange
      const store = useAuthStore();

      // Act
      store.loadTokensFromStorage();

      // Assert
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('Registration', () => {
    it('should register user successfully', async () => {
      // Arrange
      const store = useAuthStore();
      const registerData = {
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'client' as const,
        phone: '+1234567890',
      };
      const user = mockUser(registerData);
      const authData = {
        user,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockFetchSuccess(authData);

      // Act
      const result = await store.register(registerData);

      // Assert
      expect(result.success).toBe(true);
      expect(store.user).toEqual(user);
      expect(store.accessToken).toBe('new-access-token');
      expect(store.isAuthenticated).toBe(true);
    });

    it('should handle registration validation errors', async () => {
      // Arrange
      const store = useAuthStore();
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        firstName: 'A',
        lastName: 'B',
        role: 'client' as const,
      };

      mockFetchError(400, 'Validation error');

      const result = await store.register(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
      expect(store.isAuthenticated).toBe(false);
    });

    it('should handle duplicate email error', async () => {
      const store = useAuthStore();
      const registerData = {
        email: 'existing@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'client' as const,
      };

      mockFetchError(409, 'User with this email already exists');

      // Act
      const result = await store.register(registerData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('email already exists');
    });

    it('should set loading state during registration', async () => {
      // Arrange
      const store = useAuthStore();
      const registerData = {
        email: 'test@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'client' as const,
      };

      (vi.mocked($fetch) as any).mockImplementation(
        () => new Promise((resolve) => {
          expect(store.isLoading).toBe(true);
          setTimeout(() => resolve(mockSuccessResponse({ user: mockUser(), accessToken: 'token', refreshToken: 'refresh' })), 10);
        })
      );

      await store.register(registerData);

      expect(store.isLoading).toBe(false);
    });
  });

  describe('Login', () => {
    it('should login user successfully', async () => {
      const store = useAuthStore();
      const loginData = {
        email: 'test@test.com',
        password: 'Password123!',
      };
      const user = mockUser({ email: loginData.email });
      const authData = {
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockFetchSuccess(authData);

      const result = await store.login(loginData);

      expect(result.success).toBe(true);
      expect(store.user?.email).toBe(loginData.email);
      expect(store.isAuthenticated).toBe(true);
    });

    it('should handle invalid credentials', async () => {
      const store = useAuthStore();
      const loginData = {
        email: 'wrong@test.com',
        password: 'WrongPassword123!',
      };

      mockFetchError(401, 'Invalid email or password');

      // Act
      const result = await store.login(loginData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
      expect(store.isAuthenticated).toBe(false);
    });

    it('should handle deactivated account', async () => {
      const store = useAuthStore();
      const loginData = {
        email: 'deactivated@test.com',
        password: 'Password123!',
      };

      mockFetchError(403, 'Account is deactivated');

      const result = await store.login(loginData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('deactivated');
    });
  });

  describe('Logout', () => {
    it('should logout user and clear state', async () => {
      const store = useAuthStore();
      const user = mockUser();
      store.setAuth(user, 'token', 'refresh');

      mockFetchSuccess({ message: 'Logout successful' });

      // Act
      await store.logout();

      // Assert
      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      const store = useAuthStore();
      const error: any = new Error('Network error');
      error.status = 0;
      (vi.mocked($fetch) as any).mockRejectedValueOnce(error);

      const result = await store.login({ email: 'test@test.com', password: 'pass' });

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle missing response data', async () => {
      const store = useAuthStore();
      (vi.mocked($fetch) as any).mockResolvedValueOnce({ success: false });

      const result = await store.register({
        email: 'test@test.com',
        password: 'Pass123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'client',
      });

      expect(result.success).toBe(false);
    });
  });
});

