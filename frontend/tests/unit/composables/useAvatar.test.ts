import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAvatar } from '~/composables/useAvatar';

const mockApiFetch = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: mockApiFetch,
  }),
}));

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000/api',
    },
  }),
}));

describe('useAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockReset();
  });

  describe('getAvatarUrl', () => {
    it('devrait retourner l\'URL complète', () => {
      const { getAvatarUrl } = useAvatar();
      const result = getAvatarUrl('/uploads/avatars/user.jpg');

      expect(result).toBe('http://localhost:3000/api/uploads/avatars/user.jpg');
    });

    it('devrait retourner l\'avatar par défaut si null', () => {
      const { getAvatarUrl } = useAvatar();
      const result = getAvatarUrl(null);

      expect(result).toContain('default-avatar');
    });

    it('devrait retourner l\'avatar par défaut si undefined', () => {
      const { getAvatarUrl } = useAvatar();
      const result = getAvatarUrl(undefined);

      expect(result).toContain('default-avatar');
    });

    it('devrait retourner l\'avatar par défaut si chaîne vide', () => {
      const { getAvatarUrl } = useAvatar();
      const result = getAvatarUrl('');

      expect(result).toContain('default-avatar');
    });
  });

  describe('getDefaultAvatar', () => {
    it('devrait retourner un avatar par défaut basé sur le nom', () => {
      const { getDefaultAvatar } = useAvatar();
      const result = getDefaultAvatar('John', 'Doe');

      expect(result).toContain('JD');
    });

    it('devrait gérer un prénom vide', () => {
      const { getDefaultAvatar } = useAvatar();
      const result = getDefaultAvatar('', 'Doe');

      expect(result).toContain('D');
    });

    it('devrait gérer un nom vide', () => {
      const { getDefaultAvatar } = useAvatar();
      const result = getDefaultAvatar('John', '');

      expect(result).toContain('J');
    });

    it('devrait gérer des noms vides', () => {
      const { getDefaultAvatar } = useAvatar();
      const result = getDefaultAvatar('', '');

      expect(result).toBeTruthy();
    });
  });
});