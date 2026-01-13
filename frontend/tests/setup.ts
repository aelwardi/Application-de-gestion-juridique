import { vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { config } from '@vue/test-utils';
import { server } from './mocks/msw-server';
import { setupThirdPartyMocks, cleanupThirdPartyMocks } from './mocks/third-party.mock';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
  setupThirdPartyMocks();
});

afterEach(() => {
  server.resetHandlers();
  cleanupThirdPartyMocks();
});

afterAll(() => {
  server.close();
});

config.global.mocks = {
  $fetch: vi.fn(),
};

(globalThis as any).useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
}));

(globalThis as any).navigateTo = vi.fn();

(globalThis as any).$fetch = vi.fn();

(globalThis as any).useAuthStore = vi.fn(() => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  refreshAccessToken: vi.fn(),
  clearAuth: vi.fn(),
  setAuth: vi.fn(),
  getAuthHeaders: vi.fn(() => ({})),
}));

(globalThis as any).useApi = vi.fn(() => ({
  apiFetch: vi.fn(),
}));

(globalThis as any).useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: { path: '/', query: {}, params: {} } },
}));

(globalThis as any).useRoute = vi.fn(() => ({
  path: '/',
  query: {},
  params: {},
}));

if (typeof global.process === 'undefined') {
  (global as any).process = {};
}
(global as any).process.client = true;

const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    __getStore: () => store,
    __setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

globalThis.localStorage = localStorageMock as any;
globalThis.sessionStorage = sessionStorageMock as any;

beforeEach(() => {
  vi.clearAllMocks();
  (localStorageMock as any).__setStore({});
  (sessionStorageMock as any).__setStore({});
});