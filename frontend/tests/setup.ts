import { vi } from 'vitest';

(globalThis as any).useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
}));

(globalThis as any).navigateTo = vi.fn();

(globalThis as any).$fetch = vi.fn();

(globalThis as any).useAuthStore = vi.fn(() => ({
  accessToken: 'test-token',
  refreshToken: 'test-refresh-token',
  user: null,
  isAuthenticated: false,
  refreshAccessToken: vi.fn(),
  clearAuth: vi.fn(),
  getAuthHeaders: vi.fn(() => ({
    'Authorization': 'Bearer test-token'
  })),
}));

if (typeof global.process === 'undefined') {
  (global as any).process = {};
}
(global as any).process.client = true;

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
globalThis.localStorage = localStorageMock as any;

globalThis.sessionStorage = localStorageMock as any;


