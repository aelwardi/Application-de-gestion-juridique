import { vi } from 'vitest';
import type { User } from '~/types/auth';

export const mockUser = (overrides: Partial<User> = {}): User => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  role: 'client',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
  isActive: true,
  isVerified: false,
  profilePictureUrl: null,
  createdAt: new Date() as any,
  updatedAt: new Date() as any,
  lastLoginAt: null,
  ...overrides,
});

export const mockLawyer = (overrides: Partial<User> = {}): User => mockUser({
  role: 'avocat',
  specialties: ['Droit civil', 'Droit pénal'],
  experienceYears: 5,
  barNumber: 'BAR123456',
  officeAddress: '123 Test Street, Paris',
  description: 'Avocat expérimenté en droit civil et pénal',
  hourlyRate: 150,
  ...overrides,
});

export const mockAdmin = (overrides: Partial<User> = {}): User => mockUser({
  role: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  ...overrides,
});

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

export const mockFetchSuccess = (data: any) => {
  const mockFn = vi.mocked($fetch) as any;
  if (typeof data === 'object' && data !== null) {
    const obj = data as any;
    if ('data' in obj) {
      mockFn.mockResolvedValueOnce(data);
      return;
    }
  }
  mockFn.mockResolvedValueOnce({ data, success: true, message: 'Operation successful' });
};

export const mockFetchError = (status: number, message: string) => {
  const error: any = new Error(message);
  error.statusCode = status;
  error.data = { message, statusCode: status };
  (vi.mocked($fetch) as any).mockRejectedValueOnce(error);
};


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

export const setupLocalStorage = (data: Record<string, string>) => {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

export const mockDate = (isoString: string) => {
  const date = new Date(isoString);
  vi.setSystemTime(date);
  return date;
};

export const resetDate = () => {
  vi.useRealTimers();
};

export const createMockUseApi = (overrides: any = {}) => {
  const mockApiFetch = vi.fn();

  (globalThis as any).useApi = vi.fn(() => ({
    apiFetch: mockApiFetch,
    ...overrides,
  }));

  return { mockApiFetch };
};