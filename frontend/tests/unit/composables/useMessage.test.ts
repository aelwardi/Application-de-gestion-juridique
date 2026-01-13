import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMessage } from '~/composables/useMessage';

const mockApiFetch = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch,
  }),
}));

describe('useMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockReset();
  });

  const mockMessage = {
    id: '1',
    sender_id: 'user-1',
    receiver_id: 'user-2',
    content: 'Test message',
    created_at: new Date().toISOString(),
    is_read: false,
  };

  describe('countUnread', () => {
    it('devrait retourner 0 si aucun message non lu', async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: { count: 0 },
      });

      const { countUnread } = useMessage();
      const result = await countUnread('user-1');

      expect(result).toBe(0);
    });
  });
});