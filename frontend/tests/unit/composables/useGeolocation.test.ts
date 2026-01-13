import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGeolocation } from '~/composables/useGeolocation';

global.fetch = vi.fn();

describe('useGeolocation - Tests Unitaires', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (vi.isMockFunction(global.fetch)) {
      vi.mocked(global.fetch).mockClear();
    }
  });

  describe('geocodeAddress', () => {

    it('devrait retourner null pour une adresse avec seulement des espaces', async () => {
      const { geocodeAddress, error } = useGeolocation();
      const result = await geocodeAddress('   ');

      expect(result).toBeNull();
      expect(error.value).toBe('Adresse vide');
    });
  });

});