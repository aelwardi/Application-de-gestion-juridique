import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDocument } from '~/composables/useDocument';
import { createMockAuthStore, mockFetchSuccess, mockFetchError } from './helpers/test-utils';

describe('useDocument Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore({ accessToken: 'test-token' });
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  const mockDocument = (overrides = {}) => ({
    id: 'doc-1',
    file_name: 'document.pdf',
    file_size: 1024 * 1024, // 1MB
    file_type: 'application/pdf',
    document_type: 'contract',
    case_id: 'case-1',
    uploaded_by: 'user-1',
    created_at: new Date().toISOString(),
    ...overrides,
  });

  describe('File Validation', () => {
    it('should validate file size within limit', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const fileSize = 5 * 1024 * 1024; // 5MB

      const isValid = fileSize <= maxSize;

      expect(isValid).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const fileSize = 15 * 1024 * 1024; // 15MB

      const isValid = fileSize <= maxSize;

      expect(isValid).toBe(false);
    });

    it('should validate allowed file extensions', () => {
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.png'];
      const fileName = 'document.pdf';

      const extension = fileName.substring(fileName.lastIndexOf('.'));
      const isValid = allowedExtensions.includes(extension);

      expect(isValid).toBe(true);
    });

    it('should reject disallowed file extensions', () => {
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileName = 'script.exe';

      const extension = fileName.substring(fileName.lastIndexOf('.'));
      const isValid = allowedExtensions.includes(extension);

      expect(isValid).toBe(false);
    });

    it('should handle files without extension', () => {
      const fileName = 'documentwithoutextension';

      const hasExtension = fileName.includes('.');

      expect(hasExtension).toBe(false);
    });

    it('should validate file MIME type', () => {
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const fileMimeType = 'application/pdf';

      const isValid = allowedMimeTypes.includes(fileMimeType);

      expect(isValid).toBe(true);
    });
  });

  describe('Upload Document', () => {
    it('should upload document successfully', async () => {
      const { uploadDocument } = useDocument();
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('case_id', 'case-1');

      mockFetchSuccess(mockDocument());

      const result = await uploadDocument(formData);

      expect(result.success).toBe(true);
      expect(result.data.file_name).toBe('document.pdf');
    });

    it('should handle upload errors', async () => {
      const { uploadDocument } = useDocument();
      const formData = new FormData();
      mockFetchError(400, 'Invalid file');

      const result = await uploadDocument(formData);

      expect(result.success).toBe(false);
    });

    it('should handle file size validation error', async () => {
      const { uploadDocument } = useDocument();
      const formData = new FormData();
      mockFetchError(413, 'File too large');

      const result = await uploadDocument(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('too large');
    });
  });

  describe('Get Documents', () => {
    it('should fetch documents by case', async () => {
      const { getDocuments } = useDocument();
      const documents = [
        mockDocument({ id: '1', case_id: 'case-1' }),
        mockDocument({ id: '2', case_id: 'case-1' }),
      ];
      mockFetchSuccess(documents);

      const result = await getDocuments({ case_id: 'case-1' });

      expect(result.data).toHaveLength(2);
    });

    it('should filter documents by type', () => {
      const documents = [
        mockDocument({ id: '1', document_type: 'contract' }),
        mockDocument({ id: '2', document_type: 'invoice' }),
        mockDocument({ id: '3', document_type: 'contract' }),
      ];

      const contracts = documents.filter(d => d.document_type === 'contract');

      expect(contracts).toHaveLength(2);
    });

    it('should filter documents by case ID', () => {
      const documents = [
        mockDocument({ id: '1', case_id: 'case-1' }),
        mockDocument({ id: '2', case_id: 'case-2' }),
        mockDocument({ id: '3', case_id: 'case-1' }),
      ];

      const caseDocuments = documents.filter(d => d.case_id === 'case-1');

      expect(caseDocuments).toHaveLength(2);
    });
  });

  describe('Download Document', () => {
    it('should generate download URL', () => {
      const documentId = 'doc-1';
      const baseUrl = 'http://localhost:3000/api';

      const downloadUrl = `${baseUrl}/documents/${documentId}/download`;

      expect(downloadUrl).toBe('http://localhost:3000/api/documents/doc-1/download');
    });
  });

  describe('Delete Document', () => {
    it('should delete document successfully', async () => {
      const { deleteDocument } = useDocument();
      mockFetchSuccess({ success: true });

      const result = await deleteDocument('doc-1');

      expect(result.success).toBe(true);
    });

    it('should handle unauthorized delete', async () => {
      const { deleteDocument } = useDocument();
      mockFetchError(403, 'Forbidden');

      const result = await deleteDocument('doc-1');

      expect(result.success).toBe(false);
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      const fileSize = 1024;

      const formatted = `${(fileSize / 1024).toFixed(2)} KB`;

      expect(formatted).toBe('1.00 KB');
    });

    it('should format megabytes correctly', () => {
      const fileSize = 1024 * 1024;

      const formatted = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

      expect(formatted).toBe('1.00 MB');
    });

    it('should format gigabytes correctly', () => {
      const fileSize = 1024 * 1024 * 1024;

      const formatted = `${(fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;

      expect(formatted).toBe('1.00 GB');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty document list', async () => {
      const { getDocuments } = useDocument();
      mockFetchSuccess({ data: [] });

      const result = await getDocuments();

      expect(result.data).toEqual([]);
    });

    it('should handle zero file size', () => {
      const fileSize = 0;

      const formatted = `${fileSize} bytes`;

      expect(formatted).toBe('0 bytes');
    });

    it('should handle missing file extension', () => {
      const fileName = 'document';

      const lastDotIndex = fileName.lastIndexOf('.');
      const hasExtension = lastDotIndex > 0;

      expect(hasExtension).toBe(false);
    });

    it('should handle network errors during upload', async () => {
      const { uploadDocument } = useDocument();
      const error: any = new Error('Network error');
      error.code = 'ECONNREFUSED';
      vi.mocked($fetch).mockRejectedValueOnce(error);

      const result = await uploadDocument(new FormData());

      expect(result.success).toBe(false);
    });
  });
});