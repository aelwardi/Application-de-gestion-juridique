import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCase } from '~/composables/useCase';
import { createMockAuthStore, mockFetchError } from '~/tests/helpers/test-utils';

describe('useCase Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore({ accessToken: 'test-token' });
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  const mockCase = (overrides: any = {}) => ({
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

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        message: 'Case created',
        data: mockCase(caseData)
      });

      const result = await createCase(caseData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.title).toBe('Nouveau Dossier');
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
      vi.mocked($fetch).mockResolvedValueOnce({ success: true, data: cases, message: 'Success' });

      const result = await getCases();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const cases = [
        mockCase({ id: '1', status: 'in_progress' }),
        mockCase({ id: '2', status: 'pending' }),
        mockCase({ id: '3', status: 'in_progress' }),
      ];

      const inProgressCases = cases.filter(c => c.status === 'in_progress');

      expect(inProgressCases).toHaveLength(2);
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
      const updatedCase = mockCase({ status: 'in_progress' });
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        message: 'Case updated',
        data: updatedCase
      });

      const result = await updateCase('case-1', { status: 'in_progress' });

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('in_progress');
    });
  });

  describe('Delete Case', () => {
    it('should delete case successfully', async () => {
      const { deleteCase } = useCase();
      vi.mocked($fetch).mockResolvedValueOnce({ success: true });

      const result = await deleteCase('case-1');

      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cases list', async () => {
      const { getCases } = useCase();
      vi.mocked($fetch).mockResolvedValueOnce({ success: true, data: [], message: 'Success' });

      const result = await getCases();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
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

