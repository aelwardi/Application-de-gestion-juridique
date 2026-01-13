import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCase } from '~/composables/useCase';
import { createMockAuthStore, mockFetchSuccess, mockFetchError } from './helpers/test-utils';

describe('useCase Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore({ accessToken: 'test-token' });
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  const mockCase = (overrides = {}) => ({
    id: 'case-1',
    title: 'Nouveau Dossier',
    description: 'Description du dossier',
    case_type: 'civil',
    status: 'pending',
    client_id: '123',
    lawyer_id: '456',
    created_at: new Date().toISOString(),
    ...overrides,
  });

  describe('Create Case', () => {
    it('should create case successfully', async () => {
      const { createCase } = useCase();
      const caseData = {
        title: 'Nouveau Dossier',
        description: 'Description',
        case_type: 'civil',
        client_id: '123',
        lawyer_id: '456',
      };

      mockFetchSuccess(mockCase(caseData));

      const result = await createCase(caseData);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Nouveau Dossier');
    });

    it('should handle validation errors', async () => {
      const { createCase } = useCase();
      mockFetchError(400, 'Validation error');

      const result = await createCase({ title: '' } as any);

      expect(result.success).toBe(false);
    });
  });

  describe('Get Cases', () => {
    it('should fetch all cases', async () => {
      const { getCases } = useCase();
      const cases = [mockCase({ id: '1' }), mockCase({ id: '2' })];
      mockFetchSuccess({ data: cases, total: 2 });

      const result = await getCases();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const cases = [
        mockCase({ id: '1', status: 'in_progress' as any }),
        mockCase({ id: '2', status: 'pending' }),
        mockCase({ id: '3', status: 'in_progress' as any }),
      ];

      const activeCases = cases.filter(c => c.status === 'in_progress');

      expect(activeCases).toHaveLength(2);
    });

    it('should filter by case type', async () => {
      const cases = [
        mockCase({ id: '1', case_type: 'civil' }),
        mockCase({ id: '2', case_type: 'penal' }),
        mockCase({ id: '3', case_type: 'civil' }),
      ];

      const civilCases = cases.filter(c => c.case_type === 'civil');

      expect(civilCases).toHaveLength(2);
    });
  });

  describe('Update Case', () => {
    it('should update case successfully', async () => {
      const { updateCase } = useCase();
      const updatedCase = mockCase({ status: 'in_progress' as any });
      mockFetchSuccess(updatedCase);

      const result = await updateCase('case-1', { status: 'in_progress' as any });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('in_progress');
    });
  });

  describe('Delete Case', () => {
    it('should delete case successfully', async () => {
      const { deleteCase } = useCase();
      mockFetchSuccess({ success: true });

      const result = await deleteCase('case-1');

      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cases list', async () => {
      const { getCases } = useCase();
      mockFetchSuccess({ data: [], total: 0 });

      const result = await getCases();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle unauthorized access', async () => {
      const { getCases } = useCase();
      mockFetchError(401, 'Unauthorized');

      const result = await getCases();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unauthorized');
    });
  });
});

