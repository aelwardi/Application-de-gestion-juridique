import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApi } from '~/composables/useApi';
import { createMockAuthStore, mockFetchError } from '~/tests/helpers/test-utils';

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
      vi.mocked($fetch).mockResolvedValueOnce({ data: 'test' });

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
      vi.mocked($fetch).mockResolvedValueOnce({ data: 'test' });

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
      mockAuthStore.accessToken = null;
      vi.mocked($fetch).mockResolvedValueOnce({ data: 'test' });

      await apiFetch('/test-endpoint');

      const callArgs = vi.mocked($fetch).mock.calls[0];
      if (callArgs) {
        const headers = callArgs[1]?.headers as Record<string, string> | undefined;
        expect(headers?.['Authorization']).toBeUndefined();
      }
    });

    it('should merge custom headers with default headers', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ data: 'test' });

      await apiFetch('/test-endpoint', {
        headers: { 'X-Custom': 'value' }
      });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom': 'value',
          }),
        })
      );
    });
  });

  describe('URL Construction', () => {
    it('should prepend base URL to relative paths', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ data: 'test' });

      await apiFetch('/users');

      expect($fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users',
        expect.anything()
      );
    });

    it('should not prepend base URL to absolute URLs', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ data: 'test' });

      await apiFetch('https://external-api.com/data');

      expect($fetch).toHaveBeenCalledWith(
        'https://external-api.com/data',
        expect.anything()
      );
    });
  });

  describe('HTTP Methods', () => {
    it('should support GET requests', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [] });

      await apiFetch('/users', { method: 'GET' });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should support POST requests', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ data: {} });

      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should support PUT requests', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ data: {} });

      await apiFetch('/users/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' })
      });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('should support DELETE requests', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ success: true });

      await apiFetch('/users/1', { method: 'DELETE' });

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle 403 Forbidden errors', async () => {
      const { apiFetch } = useApi();
      mockFetchError(403, 'Forbidden');

      await expect(apiFetch('/protected')).rejects.toThrow();
    });

    it('should handle 404 Not Found errors', async () => {
      const { apiFetch } = useApi();
      mockFetchError(404, 'Not found');

      await expect(apiFetch('/nonexistent')).rejects.toThrow();
    });

    it('should handle 500 Server errors', async () => {
      const { apiFetch } = useApi();
      mockFetchError(500, 'Server error');

      await expect(apiFetch('/endpoint')).rejects.toThrow();
    });
  });

  describe('Request Options', () => {
    it('should handle query parameters', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [] });

      await apiFetch('/users?page=1&limit=10');

      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.anything()
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      const { apiFetch } = useApi();
      vi.mocked($fetch).mockResolvedValue({ data: 'test' });

      const promises = [
        apiFetch('/endpoint1'),
        apiFetch('/endpoint2'),
        apiFetch('/endpoint3')
      ];

      await Promise.all(promises);

      expect($fetch).toHaveBeenCalledTimes(3);
    });
  });
});

