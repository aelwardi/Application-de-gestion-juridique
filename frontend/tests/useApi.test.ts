import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApi } from '~/composables/useApi';
import { createMockAuthStore, mockFetchSuccess, mockFetchError, mockSuccessResponse } from './helpers/test-utils';

describe('useApi Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore();
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  describe('Request Headers', () => {
    it('should include authorization header when token is available', async () => {
      const { apiFetch } = useApi();
      mockAuthStore.accessToken = 'test-access-token';
      mockFetchSuccess({ data: 'test' });

      await apiFetch('/test-endpoint');

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-access-token',
          }),
        })
      );
    });

    it('should include Content-Type header by default', async () => {
      const { apiFetch } = useApi();
      mockFetchSuccess({ data: 'test' });

      await apiFetch('/test-endpoint');

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should not include authorization header when token is missing', async () => {
      const { apiFetch } = useApi();
      mockAuthStore.accessToken = '';
      mockFetchSuccess({ data: 'test' });

      await apiFetch('/test-endpoint');

      const callArgs = (vi.mocked($fetch) as any).mock.calls[0]?.[1];
      expect(callArgs?.headers).not.toHaveProperty('Authorization');
    });

    it('should merge custom headers with default headers', async () => {
      const { apiFetch } = useApi();
      mockAuthStore.accessToken = 'token';
      mockFetchSuccess({ data: 'test' });

      await apiFetch('/test-endpoint', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('URL Construction', () => {
    it('should prepend base URL to relative paths', async () => {
      const { apiFetch } = useApi();
      mockFetchSuccess({ data: 'test' });

      await apiFetch('/users');

      expect($fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users',
        expect.any(Object)
      );
    });

    it('should handle paths without leading slash', async () => {
      const { apiFetch } = useApi();
      mockFetchSuccess({ data: 'test' });

      await apiFetch('users/123');

      expect($fetch).toHaveBeenCalledWith(
        'http://localhost:3000/apiusers/123',
        expect.any(Object)
      );
    });
  });

  describe('HTTP Methods', () => {
    it('should support GET requests', async () => {
      const { apiFetch } = useApi();
      const mockData = { users: ['user1', 'user2'] };
      mockFetchSuccess(mockData);

      const result = await apiFetch('/users', { method: 'GET' });

      expect(result).toEqual(mockSuccessResponse(mockData));
      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should support POST requests', async () => {
      const { apiFetch } = useApi();
      const postData = { name: 'Test User' };
      const responseData = { id: '123', ...postData };
      mockFetchSuccess(responseData);

      const result = await apiFetch('/users', {
        method: 'POST',
        body: postData,
      });

      expect(result.data).toHaveProperty('id');
      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: postData,
        })
      );
    });

    it('should support PUT requests', async () => {
      const { apiFetch } = useApi();
      const updateData = { name: 'Updated Name' };
      mockFetchSuccess({ id: '123', ...updateData });

      await apiFetch('/users/123', {
        method: 'PUT',
        body: updateData,
      });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('should support DELETE requests', async () => {
      const { apiFetch } = useApi();
      mockFetchSuccess({ success: true });

      await apiFetch('/users/123', { method: 'DELETE' });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 errors with TOKEN_EXPIRED code', async () => {
      const { apiFetch } = useApi();
      mockAuthStore.refreshAccessToken = vi.fn().mockResolvedValueOnce(true);
      mockAuthStore.accessToken = 'new-token';

      const error: any = new Error('Token expired');
      error.status = 401;
      error.data = { code: 'TOKEN_EXPIRED' };

      (vi.mocked($fetch) as any)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ data: 'success' });

      const result = await apiFetch('/protected-endpoint');

      expect(mockAuthStore.refreshAccessToken).toHaveBeenCalled();
      expect($fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: 'success' });
    });

    it('should clear auth and redirect on 401 without refresh', async () => {
      const { apiFetch } = useApi();
      mockAuthStore.refreshAccessToken = vi.fn().mockResolvedValueOnce(false);

      const error: any = new Error('Unauthorized');
      error.status = 401;
      error.data = { code: 'TOKEN_EXPIRED' };

      (vi.mocked($fetch) as any).mockRejectedValueOnce(error);
      const navigateTo = vi.fn();
      (globalThis as any).navigateTo = navigateTo;

      await expect(apiFetch('/protected-endpoint')).rejects.toThrow();
      expect(mockAuthStore.clearAuth).toHaveBeenCalled();
      expect(navigateTo).toHaveBeenCalledWith('/auth/login');
    });

    it('should clear auth and redirect on 401 without TOKEN_EXPIRED code', async () => {
      const { apiFetch } = useApi();
      const error: any = new Error('Unauthorized');
      error.status = 401;
      error.data = { code: 'UNAUTHORIZED' };

      (vi.mocked($fetch) as any).mockRejectedValueOnce(error);
      const navigateTo = vi.fn();
      (globalThis as any).navigateTo = navigateTo;

      await expect(apiFetch('/protected-endpoint')).rejects.toThrow();
      expect(mockAuthStore.clearAuth).toHaveBeenCalled();
      expect(navigateTo).toHaveBeenCalledWith('/auth/login');
    });

    it('should handle 403 Forbidden errors', async () => {
      const { apiFetch } = useApi();
      mockFetchError(403, 'Forbidden');

      await expect(apiFetch('/admin-endpoint')).rejects.toThrow();
    });

    it('should handle 404 Not Found errors', async () => {
      const { apiFetch } = useApi();
      mockFetchError(404, 'Not Found');

      await expect(apiFetch('/nonexistent')).rejects.toThrow();
    });

    it('should handle 500 Server errors', async () => {
      const { apiFetch } = useApi();
      mockFetchError(500, 'Internal Server Error');

      await expect(apiFetch('/endpoint')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const { apiFetch } = useApi();
      const networkError = new Error('Network error');
      (vi.mocked($fetch) as any).mockRejectedValueOnce(networkError);

      await expect(apiFetch('/endpoint')).rejects.toThrow('Network error');
    });
  });

  describe('Request Options', () => {
    it('should pass through custom options', async () => {
      const { apiFetch } = useApi();
      mockFetchSuccess({ data: 'test' });

      await apiFetch('/endpoint', {
        method: 'POST',
        body: { test: 'data' },
        credentials: 'include',
      });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: { test: 'data' },
          credentials: 'include',
        })
      );
    });

    it('should handle query parameters', async () => {
      const { apiFetch } = useApi();
      mockFetchSuccess({ data: 'test' });

      await apiFetch('/users', {
        query: { page: 1, limit: 10 },
      });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: { page: 1, limit: 10 },
        })
      );
    });
  });

  describe('Type Safety', () => {
    it('should return typed response', async () => {
      interface UserResponse {
        id: string;
        name: string;
      }
      const { apiFetch } = useApi();
      const mockUser: UserResponse = { id: '123', name: 'Test User' };
      mockFetchSuccess(mockUser);

      const result = await apiFetch<any>('/users/123');

      expect(result.data.id).toBe('123');
      expect(result.data.name).toBe('Test User');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response', async () => {
      const { apiFetch } = useApi();
      (vi.mocked($fetch) as any).mockResolvedValueOnce(null);

      const result = await apiFetch('/endpoint');

      expect(result).toBeNull();
    });

    it('should handle concurrent requests', async () => {
      const { apiFetch } = useApi();
      mockFetchSuccess({ data: '1' });
      mockFetchSuccess({ data: '2' });

      const results = await Promise.all([
        apiFetch('/endpoint1'),
        apiFetch('/endpoint2'),
      ]);

      expect(results).toHaveLength(2);
      expect($fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle token refresh failure during retry', async () => {
      const { apiFetch } = useApi();
      mockAuthStore.refreshAccessToken = vi.fn().mockResolvedValueOnce(true);

      const error: any = new Error('Token expired');
      error.status = 401;
      error.data = { code: 'TOKEN_EXPIRED' };

      (vi.mocked($fetch) as any)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      await expect(apiFetch('/protected-endpoint')).rejects.toThrow();
    });
  });
});