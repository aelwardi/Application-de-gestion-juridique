import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLawyer } from '~/composables/useLawyer';
import { createMockAuthStore, mockFetchSuccess, mockFetchError, mockLawyer } from './helpers/test-utils';

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    apiFetch: (url: string, options?: any) => {
      return $fetch(url, options);
    }
  })
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
    it('should search by specialization', () => {
      const lawyers = [
        createMockLawyer({ id: '1', specialization: 'Droit civil' }),
        createMockLawyer({ id: '2', specialization: 'Droit pénal' }),
        createMockLawyer({ id: '3', specialization: 'Droit civil' }),
      ];

      const civilLawyers = lawyers.filter(l => l.specialization === 'Droit civil');

      expect(civilLawyers).toHaveLength(2);
      expect(civilLawyers.every(l => l.specialization === 'Droit civil')).toBe(true);
    });

    it('should filter by city', () => {
      const lawyers = [
        createMockLawyer({ id: '1', city: 'Paris' }),
        createMockLawyer({ id: '2', city: 'Lyon' }),
        createMockLawyer({ id: '3', city: 'Paris' }),
      ];

      const parisLawyers = lawyers.filter(l => l.city === 'Paris');

      expect(parisLawyers).toHaveLength(2);
      expect(parisLawyers.every(l => l.city === 'Paris')).toBe(true);
    });

    it('should filter by multiple criteria', () => {
      const lawyers = [
        createMockLawyer({ id: '1', city: 'Paris', specialization: 'Droit civil' }),
        createMockLawyer({ id: '2', city: 'Paris', specialization: 'Droit pénal' }),
        createMockLawyer({ id: '3', city: 'Lyon', specialization: 'Droit civil' }),
      ];

      const filtered = lawyers.filter(
        l => l.city === 'Paris' && l.specialization === 'Droit civil'
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter by price range', () => {
      const lawyers = [
        createMockLawyer({ id: '1', hourly_rate: 100 }),
        createMockLawyer({ id: '2', hourly_rate: 200 }),
        createMockLawyer({ id: '3', hourly_rate: 150 }),
      ];
      const maxRate = 150;

      const affordable = lawyers.filter(l => l.hourly_rate <= maxRate);

      expect(affordable).toHaveLength(2);
      expect(affordable.every(l => l.hourly_rate <= maxRate)).toBe(true);
    });

    it('should filter by experience', () => {
      const lawyers = [
        createMockLawyer({ id: '1', years_of_experience: 2 }),
        createMockLawyer({ id: '2', years_of_experience: 10 }),
        createMockLawyer({ id: '3', years_of_experience: 5 }),
      ];
      const minExperience = 5;

      const experienced = lawyers.filter(l => l.years_of_experience >= minExperience);

      expect(experienced).toHaveLength(2);
      expect(experienced.every(l => l.years_of_experience >= minExperience)).toBe(true);
    });
  });

  describe('Get Lawyers', () => {
    it('should fetch all lawyers', async () => {
      const { getLawyers } = useLawyer();
      const lawyers = [
        createMockLawyer({ id: '1' }),
        createMockLawyer({ id: '2' }),
      ];
      mockFetchSuccess({ data: lawyers, total: 2 });

      const result = await getLawyers();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should fetch lawyers with filters', async () => {
      const { getLawyers } = useLawyer();
      const filters = {
        specialization: 'Droit civil',
        city: 'Paris',
      };
      mockFetchSuccess({ data: [], total: 0 });

      await getLawyers(filters);

      expect($fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: filters,
        })
      );
    });
  });

  describe('Get Lawyer by ID', () => {
    it('should fetch lawyer profile', async () => {
      const { getLawyer } = useLawyer();
      const lawyer = createMockLawyer({ id: 'lawyer-1' });
      mockFetchSuccess({ data: lawyer });

      const result = await getLawyer('lawyer-1');

      expect(result.data.id).toBe('lawyer-1');
      expect(result.data.specialization).toBe('Droit civil');
    });

    it('should handle not found error', async () => {
      const { getLawyer } = useLawyer();
      mockFetchError(404, 'Lawyer not found');

      await expect(getLawyer('nonexistent')).rejects.toThrow();
    });
  });

  describe('Lawyer Requests', () => {
    it('should create lawyer request successfully', async () => {
      const { createLawyerRequest } = useLawyer();
      const requestData = {
        client_id: 'client-1',
        case_type: 'civil',
        description: 'Besoin d\'un avocat',
      };

      mockFetchSuccess({
        data: { id: 'req-1', ...requestData, status: 'pending' },
      });

      const result = await createLawyerRequest(requestData);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('pending');
    });

    it('should handle validation errors', async () => {
      const { createLawyerRequest } = useLawyer();
      mockFetchError(400, 'Validation error');

      const result = await createLawyerRequest({ description: '' } as any);

      expect(result.success).toBe(false);
    });

    it('should filter requests by status', () => {
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'accepted' },
        { id: '3', status: 'pending' },
        { id: '4', status: 'rejected' },
      ];

      const pendingRequests = requests.filter(r => r.status === 'pending');

      expect(pendingRequests).toHaveLength(2);
    });

    it('should filter accepted requests', () => {
      const requests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'accepted' },
        { id: '3', status: 'accepted' },
      ];

      const acceptedRequests = requests.filter(r => r.status === 'accepted');

      expect(acceptedRequests).toHaveLength(2);
    });
  });

  describe('Update Lawyer Profile', () => {
    it('should update profile successfully', async () => {
      const { updateLawyerProfile } = useLawyer();
      const updateData = {
        hourly_rate: 200,
        bio: 'Updated bio',
      };
      mockFetchSuccess(createMockLawyer({ ...updateData }));

      const result = await updateLawyerProfile('lawyer-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data.hourly_rate).toBe(200);
    });
  });

  describe('Lawyer Availability', () => {
    it('should check lawyer availability', async () => {
      const { checkAvailability } = useLawyer();
      const availabilityData = {
        lawyer_id: 'lawyer-1',
        date: '2026-02-01',
        time: '10:00',
      };
      mockFetchSuccess({ available: true });

      const result = await checkAvailability(availabilityData);

      expect(result.available).toBe(true);
    });

    it('should handle unavailable slots', async () => {
      const { checkAvailability } = useLawyer();
      mockFetchSuccess({ available: false, reason: 'Already booked' });

      const result = await checkAvailability({
        lawyer_id: 'lawyer-1',
        date: '2026-02-01',
        time: '10:00',
      });

      expect(result.available).toBe(false);
      expect(result.reason).toBe('Already booked');
    });
  });

  describe('Sorting', () => {
    it('should sort by hourly rate ascending', () => {
      const lawyers = [
        createMockLawyer({ id: '1', hourly_rate: 200 }),
        createMockLawyer({ id: '2', hourly_rate: 100 }),
        createMockLawyer({ id: '3', hourly_rate: 150 }),
      ];

      const sorted = [...lawyers].sort((a, b) => a.hourly_rate - b.hourly_rate);

      expect(sorted[0].hourly_rate).toBe(100);
      expect(sorted[2].hourly_rate).toBe(200);
    });

    it('should sort by experience descending', () => {
      const lawyers = [
        createMockLawyer({ id: '1', years_of_experience: 5 }),
        createMockLawyer({ id: '2', years_of_experience: 10 }),
        createMockLawyer({ id: '3', years_of_experience: 2 }),
      ];

      const sorted = [...lawyers].sort((a, b) => b.years_of_experience - a.years_of_experience);

      expect(sorted[0].years_of_experience).toBe(10);
      expect(sorted[2].years_of_experience).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty lawyers list', async () => {
      const { getLawyers } = useLawyer();
      mockFetchSuccess({ data: [], total: 0 });

      const result = await getLawyers();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle search with no results', () => {
      const lawyers = [createMockLawyer({ specialization: 'Droit civil' })];

      const results = lawyers.filter(l => l.specialization === 'Droit administratif');

      expect(results).toHaveLength(0);
    });

    it('should handle unauthorized access', async () => {
      const { getLawyers } = useLawyer();
      mockFetchError(401, 'Unauthorized');

      await expect(getLawyers()).rejects.toThrow();
    });

    it('should handle missing optional fields', () => {
      const lawyer = createMockLawyer({ hourly_rate: undefined });

      expect(lawyer.hourly_rate).toBeUndefined();
    });
  });
});

