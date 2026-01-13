import { vi } from 'vitest';

export const mockFetch = vi.fn();

export const mockRuntimeConfig = {
  public: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
};

export const mockUseRuntimeConfig = vi.fn(() => mockRuntimeConfig);

export const mockNavigateTo = vi.fn();

export const mockUseRoute = vi.fn(() => ({
  params: {},
  query: {},
  path: '/',
  name: 'index',
}));

export const mockUseRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  go: vi.fn(),
  currentRoute: {
    value: {
      params: {},
      query: {},
      path: '/',
      name: 'index',
    },
  },
}));

export const resetNuxtMocks = () => {
  mockFetch.mockReset();
  mockNavigateTo.mockReset();
  mockUseRoute.mockReset();
  mockUseRouter.mockReset();
};

export const setupNuxtMocks = () => {
  (globalThis as any).$fetch = mockFetch;
  (globalThis as any).useRuntimeConfig = mockUseRuntimeConfig;
  (globalThis as any).navigateTo = mockNavigateTo;
  (globalThis as any).useRoute = mockUseRoute;
  (globalThis as any).useRouter = mockUseRouter;
};