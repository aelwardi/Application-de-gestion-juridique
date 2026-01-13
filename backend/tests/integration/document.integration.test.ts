import request from 'supertest';
import express, { Express } from 'express';
import { pool } from '../../src/config/database.config';
import multer from 'multer';

jest.mock('../../src/config/database.config');
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', role: 'client' };
    next();
  },
}));

// Mock multer at module level
jest.mock('multer', () => {
  const mockMulter: any = () => ({
    single: () => (req: any, res: any, next: any) => {
      req.file = {
        filename: 'test-file.pdf',
        originalname: 'test-file.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: 'uploads/documents/test-file.pdf',
      };
      next();
    },
  });
  mockMulter.diskStorage = () => ({});
  return mockMulter;
});

describe('Document Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());


    const documentRoutes = require('../../src/routes/document.routes').default;
    app.use('/api/documents', documentRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/documents/upload', () => {
    it('should upload document successfully', async () => {
      const mockDocument = {
        id: 'doc-123',
        filename: 'test-document.pdf',
        file_type: 'application/pdf',
        file_size: 1024000,
        uploaded_by: 'user-123',
        case_id: 'case-123',
        created_at: new Date(),
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ role: 'client' }] }) // get uploader role
        .mockResolvedValueOnce({ rows: [mockDocument] }) // insert document
        .mockResolvedValueOnce({ rows: [{ client_id: 'user-123', lawyer_id: 'lawyer-1', title: 'Test Case' }] }) // get case
        .mockResolvedValueOnce({ rows: [{ first_name: 'John', last_name: 'Doe' }] }) // get uploader name
        .mockResolvedValueOnce({ rows: [] }) // insert notification
        .mockResolvedValueOnce({ rows: [{ first_name: 'Jane', email: 'lawyer@test.com' }] }); // get lawyer email

      const response = await request(app)
        .post('/api/documents')
        .field('caseId', 'case-123')
        .field('category', 'evidence')
        .field('description', 'Important document')
        .set('Authorization', 'Bearer mock-token')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should validate file type', async () => {
      const response = await request(app)
        .post('/api/documents')
        .field('caseId', 'case-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate file size', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .field('caseId', 'case-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/documents', () => {
    it('should get all documents for user', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          filename: 'document1.pdf',
          file_type: 'application/pdf',
          uploaded_by: 'user-123',
        },
        {
          id: 'doc-2',
          filename: 'document2.docx',
          file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploaded_by: 'user-123',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockDocuments });

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter documents by case', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          case_id: 'case-123',
          filename: 'case-document.pdf',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockDocuments });

      const response = await request(app)
        .get('/api/documents')
        .query({ caseId: 'case-123' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter documents by category', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          category: 'evidence',
          filename: 'evidence.pdf',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockDocuments });

      const response = await request(app)
        .get('/api/documents')
        .query({ category: 'evidence' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should get document by id', async () => {
      const mockDocument = {
        id: 'doc-123',
        filename: 'document.pdf',
        file_type: 'application/pdf',
        file_path: '/uploads/documents/document.pdf',
        uploaded_by: 'user-123',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDocument] });

      const response = await request(app)
        .get('/api/documents/doc-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockDocument);
    });

    it('should return 404 if document not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/documents/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/documents/:id/download', () => {
    it('should download document', async () => {
      const mockDocument = {
        id: 'doc-123',
        filename: 'document.pdf',
        file_path: '/uploads/documents/document.pdf',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockDocument] });

      const response = await request(app)
        .get('/api/documents/doc-123/download')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(pool.query).toHaveBeenCalled();
    });

    it('should verify user has access to document', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/documents/restricted-doc/download')
        .set('Authorization', 'Bearer mock-token')
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ uploaded_by: 'user-123' }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/documents/doc-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should not delete document from other user', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ uploaded_by: 'other-user' }],
      });

      const response = await request(app)
        .delete('/api/documents/doc-123')
        .set('Authorization', 'Bearer mock-token')
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 if document not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .delete('/api/documents/nonexistent')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/documents/:id', () => {
    it('should update document metadata', async () => {
      const mockDocument = {
        id: 'doc-123',
        filename: 'updated-name.pdf',
        description: 'Updated description',
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ uploaded_by: 'user-123' }] })
        .mockResolvedValueOnce({ rows: [mockDocument] });

      const response = await request(app)
        .patch('/api/documents/doc-123')
        .send({
          filename: 'updated-name.pdf',
          description: 'Updated description',
        })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockDocument);
    });

    it('should not update document from other user', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ uploaded_by: 'other-user' }],
      });

      const response = await request(app)
        .patch('/api/documents/doc-123')
        .send({ filename: 'new-name.pdf' })
        .set('Authorization', 'Bearer mock-token')
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/documents/:id/share', () => {
    it('should share document with user', async () => {
      const mockShare = {
        id: 'share-123',
        document_id: 'doc-123',
        shared_with: 'user-456',
        permission: 'view',
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ uploaded_by: 'user-123' }] })
        .mockResolvedValueOnce({ rows: [mockShare] });

      const response = await request(app)
        .post('/api/documents/doc-123/share')
        .send({
          sharedWith: 'user-456',
          permission: 'view',
        })
        .set('Authorization', 'Bearer mock-token')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockShare);
    });

    it('should validate share permissions', async () => {
      const response = await request(app)
        .post('/api/documents/doc-123/share')
        .send({
          sharedWith: 'user-456',
          permission: 'invalid',
        })
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/documents/shared', () => {
    it('should get documents shared with user', async () => {
      const mockSharedDocs = [
        {
          id: 'doc-1',
          filename: 'shared-doc.pdf',
          shared_by: 'user-456',
          permission: 'view',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockSharedDocs });

      const response = await request(app)
        .get('/api/documents/shared')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});

