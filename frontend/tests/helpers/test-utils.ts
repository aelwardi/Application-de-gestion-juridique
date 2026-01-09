import { vi } from 'vitest';
import type { User } from '~/types/auth';

/**
 * Mock data generators for frontend tests
 */

export const mockUser = (overrides: Partial<User> = {}): User => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  role: 'client',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
  isActive: true,
  emailVerified: false,
  profilePictureUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: null,
  ...overrides,
});

export const mockLawyer = (overrides: Partial<User> = {}): User => mockUser({
  role: 'avocat',
  specializations: ['Droit civil', 'Droit pénal'],
  yearsOfExperience: 5,
  barNumber: 'BAR123456',
  officeAddress: '123 Test Street, Paris',
  bio: 'Avocat expérimenté en droit civil et pénal',
  hourlyRate: 150,
  ...overrides,
});

export const mockAdmin = (overrides: Partial<User> = {}): User => mockUser({
  role: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  ...overrides,
});

/**
 * Mock API response helpers
 */

export const mockSuccessResponse = <T>(data: T) => ({
  success: true,
  data,
  message: 'Operation successful',
});

export const mockErrorResponse = (message: string, errors?: any[]) => ({
  success: false,
  message,
  errors,
});

/**
 * Mock $fetch for specific scenarios
 */

export const mockFetchSuccess = <T>(data: T) => {
  vi.mocked($fetch).mockResolvedValueOnce(mockSuccessResponse(data));
};

export const mockFetchError = (status: number, message: string) => {
  const error: any = new Error(message);
  error.status = status;
  error.statusCode = status;
  error.data = { message };
  vi.mocked($fetch).mockRejectedValueOnce(error);
};

/**
 * Mock useAuthStore with specific state
 */

export const createMockAuthStore = (overrides: any = {}) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
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
  changePassword: vi.fn(),
  ...overrides,
});

/**
 * Setup localStorage with initial data
 */

export const setupLocalStorage = (data: Record<string, string>) => {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

/**
 * Clear all storage
 */

export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Wait for promises to resolve
 */

export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Mock Date for consistent testing
 */

export const mockDate = (isoString: string) => {
  const date = new Date(isoString);
  vi.setSystemTime(date);
  return date;
};

/**
 * Reset mocked Date
 */

export const resetDate = () => {
  vi.useRealTimers();
};