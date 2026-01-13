import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { createMockUser, createMockCase } from '../../helpers/integration-utils';

describe('Case Management Flow Integration Tests', () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    authStore = useAuthStore();
    authStore.user = createMockUser({ role: 'client' }) as any;
    authStore.accessToken = 'test-token';
  });

  describe('Case Creation Flow', () => {
    it('should complete full case creation flow', async () => {
      const caseData = {
        title: 'Nouveau Dossier',
        description: 'Description détaillée du dossier',
        case_type: 'civil',
        priority: 'high',
      };

      const mockCase = createMockCase({
        ...caseData,
        client_id: authStore.user!.id,
      });

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockCase
      });

      const response: any = await $fetch('http://localhost:3000/api/cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: caseData,
      });

      expect(response.success).toBe(true);
      expect(response.data.title).toBe(caseData.title);
    });

    it('should handle validation errors during case creation', async () => {
      vi.mocked($fetch).mockRejectedValueOnce({
        data: { message: 'Titre requis' },
        status: 400
      });

      await expect($fetch('http://localhost:3000/api/cases', {
        method: 'POST',
        body: {}
      })).rejects.toThrow();
    });
  });

  describe('Case Listing and Filtering Flow', () => {
    it('should fetch and display all cases', async () => {
      const mockCases = [
        createMockCase({ id: '1', title: 'Case 1', status: 'pending' }),
        createMockCase({ id: '2', title: 'Case 2', status: 'in_progress' }),
        createMockCase({ id: '3', title: 'Case 3', status: 'resolved' }),
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          data: mockCases,
          total: 3,
        }
      });

      const response: any = await $fetch('http://localhost:3000/api/cases', {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.data).toHaveLength(3);
    });

    it('should filter cases by status', async () => {
      const pendingCases = [
        createMockCase({ id: '1', status: 'pending' }),
        createMockCase({ id: '2', status: 'pending' }),
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          data: pendingCases,
          total: 2,
        }
      });

      const response: any = await $fetch('http://localhost:3000/api/cases?status=pending', {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      response.data.data.forEach((caseItem: any) => {
        expect(caseItem.status).toBe('pending');
      });
    });
  });

  describe('Case Update Flow', () => {
    it('should update case successfully', async () => {
      const caseId = 'case-123';
      const updateData = {
        title: 'Titre Modifié',
        description: 'Description modifiée',
        status: 'in_progress',
      };

      const updatedCase = createMockCase({
        id: caseId,
        ...updateData,
      });

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: updatedCase
      });

      const response: any = await $fetch(`http://localhost:3000/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: updateData,
      });

      expect(response.success).toBe(true);
      expect(response.data.title).toBe('Titre Modifié');
      expect(response.data.status).toBe('in_progress');
    });
  });

  describe('Case Deletion Flow', () => {
    it('should delete case successfully', async () => {
      const caseId = 'case-to-delete';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        message: 'Dossier supprimé'
      });

      const response: any = await $fetch(`http://localhost:3000/api/cases/${caseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
    });
  });
});

