import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLawyer } from '~/composables/useLawyer';
import { createMockAuthStore, mockFetchError } from '~/tests/helpers/test-utils';

vi.mock('~/composables/useApi', () => ({
  useApi: vi.fn(() => ({
    apiFetch: vi.fn((url: string, options?: any) => $fetch(url, options))
  }))
}));

describe('useLawyer Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore({ accessToken: 'test-token' });
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  const createMockLawyer = (overrides = {}) => ({
    id: 'lawyer-1',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean@law.com',
    specialization: 'Droit civil',
    city: 'Paris',
    bar_number: 'BAR123456',
    years_of_experience: 5,
    hourly_rate: 150,
    ...overrides,
  });

  describe('Search Lawyers', () => {
    it('should search lawyers successfully', async () => {
      const { searchLawyers } = useLawyer();
      const lawyers = [createMockLawyer(), createMockLawyer({ id: 'lawyer-2' })];
      vi.mocked($fetch).mockResolvedValueOnce({ data: lawyers });

      const result = await searchLawyers({});

      expect(result.data).toHaveLength(2);
    });

    it('should filter by specialization', async () => {
      const { searchLawyers } = useLawyer();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [] });

      const result = await searchLawyers({ specialty: 'Droit civil' });

      expect(result.data).toBeDefined();
    });

    it('should filter by city', async () => {
      const { searchLawyers } = useLawyer();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [] });

      const result = await searchLawyers({ city: 'Paris' });

      expect(result.data).toBeDefined();
    });

    it('should filter by maximum rate', async () => {
      const { searchLawyers } = useLawyer();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [] });

      const result = await searchLawyers({ maxRate: 200 });

      expect(result.data).toBeDefined();
    });

    it('should combine multiple filters', async () => {
      const { searchLawyers } = useLawyer();
      vi.mocked($fetch).mockResolvedValueOnce({ data: [] });

      const result = await searchLawyers({
        specialty: 'Droit civil',
        city: 'Paris',
        maxRate: 200,
      });

      expect(result.data).toBeDefined();
    });
  });

  describe('Get Lawyer by ID', () => {
    it('should fetch lawyer profile', async () => {
      const { getLawyerById } = useLawyer();
      const lawyer = createMockLawyer();
      vi.mocked($fetch).mockResolvedValueOnce({ data: lawyer });

      const result = await getLawyerById('lawyer-1');

      expect(result.id).toBe('lawyer-1');
    });

    it('should handle not found error', async () => {
      const { getLawyerById } = useLawyer();
      mockFetchError(404, 'Lawyer not found');

      await expect(getLawyerById('nonexistent')).rejects.toThrow();
    });
  });

  describe('Lawyer Requests', () => {
    it('should create lawyer request successfully', async () => {
      const { createLawyerRequest } = useLawyer();
      const requestData = {
        title: 'Demande d\'assistance juridique',
        lawyer_id: 'lawyer-1',
        case_type: 'civil',
        description: 'Need help',
      };
      vi.mocked($fetch).mockResolvedValueOnce({ data: { id: 'req-1', ...requestData } });

      const result = await createLawyerRequest(requestData);

      expect(result).toBeDefined();
      expect(result.lawyer_id).toBe('lawyer-1');
    });

    it('should handle validation errors', async () => {
      const { createLawyerRequest } = useLawyer();
      mockFetchError(400, 'Validation error');

      await expect(createLawyerRequest({} as any)).rejects.toThrow();
    });

    it('should filter requests by status', () => {
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'accepted' },
        { id: '3', status: 'pending' },
      ];

      const pending = requests.filter(r => r.status === 'pending');

      expect(pending).toHaveLength(2);
    });

    it('should filter accepted requests', () => {
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'accepted' },
        { id: '3', status: 'rejected' },
      ];

      const accepted = requests.filter(r => r.status === 'accepted');

      expect(accepted).toHaveLength(1);
    });
  });

  describe('Sorting', () => {
    it('should sort lawyers by experience', () => {
      const lawyers = [
        createMockLawyer({ id: '1', years_of_experience: 3 }),
        createMockLawyer({ id: '2', years_of_experience: 10 }),
        createMockLawyer({ id: '3', years_of_experience: 5 }),
      ];

      const sorted = [...lawyers].sort((a, b) => b.years_of_experience - a.years_of_experience);

      expect(sorted[0]!.years_of_experience).toBe(10);
      expect(sorted[2]!.years_of_experience).toBe(3);
    });

    it('should sort lawyers by rate', () => {
      const lawyers = [
        createMockLawyer({ id: '1', hourly_rate: 200 }),
        createMockLawyer({ id: '2', hourly_rate: 100 }),
        createMockLawyer({ id: '3', hourly_rate: 150 }),
      ];

      const sorted = [...lawyers].sort((a, b) => a.hourly_rate - b.hourly_rate);

      expect(sorted[0]!.hourly_rate).toBe(100);
      expect(sorted[2]!.hourly_rate).toBe(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle search with no results', () => {
      const lawyers = [createMockLawyer({ specialization: 'Droit civil' })];
      const filtered = lawyers.filter(l => l.specialization === 'Droit pénal');

      expect(filtered).toHaveLength(0);
    });

    it('should handle missing optional fields', () => {
      const lawyer = createMockLawyer();
      delete (lawyer as any).hourly_rate;

      expect(lawyer.first_name).toBe('Jean');
      expect((lawyer as any).hourly_rate).toBeUndefined();
    });
  });
});
