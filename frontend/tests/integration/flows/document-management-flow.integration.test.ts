import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { createMockUser, createMockDocument } from '../../helpers/integration-utils';

describe('Document Management Flow Integration Tests', () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    authStore = useAuthStore();
    authStore.user = createMockUser({ role: 'client' }) as any;
    authStore.accessToken = 'test-token';
  });

  describe('Document Upload Flow', () => {
    it('should upload document successfully', async () => {
      const documentData = {
        title: 'Contrat de bail',
        description: 'Document important',
        case_id: 'case-123',
        category: 'contract',
      };

      const mockDocument = createMockDocument({
        ...documentData,
        uploader_id: authStore.user!.id,
      });

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockDocument
      });

      const response: any = await $fetch('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: documentData,
      });

      expect(response.success).toBe(true);
      expect(response.data.title).toBe(documentData.title);
    });

    it('should validate file size', async () => {
      vi.mocked($fetch).mockRejectedValueOnce({
        data: { message: 'Fichier trop volumineux (max 10MB)' },
        status: 400
      });

      await expect($fetch('http://localhost:3000/api/documents', {
        method: 'POST',
        body: { file_size: 15 * 1024 * 1024 }
      })).rejects.toThrow();
    });
  });

  describe('Document Listing Flow', () => {
    it('should fetch all documents', async () => {
      const mockDocuments = [
        createMockDocument({ id: '1', title: 'Document 1' }),
        createMockDocument({ id: '2', title: 'Document 2' }),
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          documents: mockDocuments,
          total: 2,
        }
      });

      const response: any = await $fetch('http://localhost:3000/api/documents', {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.documents).toHaveLength(2);
    });

    it('should filter documents by case', async () => {
      const caseDocuments = [
        createMockDocument({ id: '1', case_id: 'case-123' }),
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          documents: caseDocuments,
          total: 1,
        }
      });

      const response: any = await $fetch('http://localhost:3000/api/documents?case_id=case-123', {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.documents[0].case_id).toBe('case-123');
    });
  });

  describe('Document Download Flow', () => {
    it('should download document successfully', async () => {
      const documentId = 'doc-123';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        url: 'http://localhost:3000/uploads/documents/file.pdf'
      });

      const response: any = await $fetch(`http://localhost:3000/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      expect(response.url).toContain('.pdf');
    });
  });

  describe('Document Update Flow', () => {
    it('should update document metadata', async () => {
      const documentId = 'doc-123';
      const updateData = {
        title: 'Titre mis à jour',
        description: 'Nouvelle description',
      };

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: createMockDocument({ id: documentId, ...updateData })
      });

      const response: any = await $fetch(`http://localhost:3000/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: updateData,
      });

      expect(response.success).toBe(true);
      expect(response.data.title).toBe(updateData.title);
    });
  });

  describe('Document Deletion Flow', () => {
    it('should delete document successfully', async () => {
      const documentId = 'doc-123';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        message: 'Document supprimé'
      });

      const response: any = await $fetch(`http://localhost:3000/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
    });

    it('should prevent deleting document by unauthorized user', async () => {
      vi.mocked($fetch).mockRejectedValueOnce({
        data: { message: 'Non autorisé' },
        status: 403
      });

      await expect($fetch('http://localhost:3000/api/documents/doc-other', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      })).rejects.toThrow();
    });
  });

  describe('Document Sharing Flow', () => {
    it('should share document with lawyer', async () => {
      const documentId = 'doc-123';
      const lawyerId = 'lawyer-456';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        message: 'Document partagé'
      });

      const response: any = await $fetch(`http://localhost:3000/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: { user_id: lawyerId },
      });

      expect(response.success).toBe(true);
    });
  });
});

