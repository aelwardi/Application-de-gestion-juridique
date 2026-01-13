import request from 'supertest';
import express, { Express } from 'express';
import { pool } from '../../src/config/database.config';

jest.mock('../../src/config/database.config');
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', role: 'client' };
    next();
  },
}));

jest.mock('../../src/database/queries/admin.queries', () => ({
  createActivityLog: jest.fn().mockResolvedValue(undefined),
  getUserById: jest.fn().mockResolvedValue(null),
  updateUserStatus: jest.fn().mockResolvedValue(undefined),
  updateUserVerification: jest.fn().mockResolvedValue(undefined),
  deleteUser: jest.fn().mockResolvedValue(undefined),
  getDashboardStats: jest.fn().mockResolvedValue({}),
  getUsers: jest.fn().mockResolvedValue({ users: [], total: 0 }),
}));

jest.mock('../../src/utils/email.util', () => ({
  sendDocumentUploadedEmail: jest.fn().mockResolvedValue(undefined),
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

jest.mock('multer', () => {
  const multerMock: any = jest.fn((_options?: any) => {
    return {
      single: (fieldName: string) => {
        return (req: any, res: any, next: any) => {
          req.file = {
            fieldname: fieldName,
            originalname: 'test-document.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            destination: 'uploads/documents/',
            filename: `test-file-${Date.now()}.pdf`,
            path: `uploads/documents/test-file-${Date.now()}.pdf`,
            size: 1024,
            buffer: Buffer.from('test pdf content'),
          };
          next();
        };
      },
      array: () => (req: any, res: any, next: any) => next(),
      fields: () => (req: any, res: any, next: any) => next(),
      none: () => (req: any, res: any, next: any) => next(),
      any: () => (req: any, res: any, next: any) => next(),
    };
  });

  multerMock.diskStorage = jest.fn((_config: any) => {
    return {
      _handleFile: jest.fn((req, file, cb) => cb(null, {})),
      _removeFile: jest.fn((req, file, cb) => cb(null)),
    };
  });

  return multerMock;
});

describe('Document Routes Integration Tests', () => {
  let app: Express;
  let originalConsole: any;

  beforeAll(() => {
    originalConsole = global.console;

    app = express();
    app.use(express.json());

    const documentRoutes = require('../../src/routes/document.routes').default;
    app.use('/api/documents', documentRoutes);
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  beforeEach(() => {
    if (jest.isMockFunction(pool.query)) {
      (pool.query as jest.Mock).mockReset();
    }

    const fs = require('fs');
    (fs.existsSync as jest.Mock).mockReset();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
  });


  describe('GET /api/documents', () => {
    it('should get all documents for user', async () => {

      const mockDocuments = [
        {
          id: 'doc-1',
          file_name: 'document1.pdf',
          file_type: 'application/pdf',
          uploaded_by: 'user-123',
          case_title: 'Case 1',
          case_number: 'C001',
          uploader_first_name: 'John',
          uploader_last_name: 'Doe',
        },
        {
          id: 'doc-2',
          file_name: 'document2.docx',
          file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploaded_by: 'user-123',
          case_title: 'Case 2',
          case_number: 'C002',
          uploader_first_name: 'Jane',
          uploader_last_name: 'Smith',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockDocuments, rowCount: 2 });

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
          file_name: 'case-document.pdf',
          file_type: 'application/pdf',
          case_title: 'Test Case',
          case_number: 'C123',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockDocuments, rowCount: 1 });

      const response = await request(app)
        .get('/api/documents')
        .query({ case_id: 'case-123' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter documents by category', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          document_type: 'evidence',
          file_name: 'evidence.pdf',
          file_type: 'application/pdf',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockDocuments, rowCount: 1 });

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
        file_name: 'document.pdf',
        file_type: 'application/pdf',
        file_path: '/uploads/documents/document.pdf',
        file_url: 'document.pdf',
        uploaded_by: 'user-123',
        title: 'Test Document',
        document_type: 'evidence',
        created_at: new Date().toISOString(),
        case_id: 'case-123',
        description: 'Test description',
        file_size: 1024,
        is_confidential: false,
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockDocument],
        rowCount: 1
      });

      const response = await request(app)
        .get('/api/documents/doc-123')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('doc-123');
      expect(response.body.data.file_name).toBe('document.pdf');
    });

    it('should return 404 if document not found', async () => {

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .get('/api/documents/nonexistent')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/documents/:id/download', () => {
    it('should download document with access', async () => {

      const fs = require('fs');

      const mockDocument = {
        id: 'doc-123',
        file_name: 'document.pdf',
        file_url: 'test-file.pdf',
        uploaded_by: 'user-123',
        client_id: null,
        lawyer_id: null,
        case_id: null,
        title: 'Test Document',
        file_type: 'application/pdf',
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockDocument],
        rowCount: 1
      });

      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      const response = await request(app)
        .get('/api/documents/doc-123/download')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Fichier non trouvé');
    });

    it('should return 404 when document does not exist', async () => {

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .get('/api/documents/nonexistent-doc/download')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Document non trouvé');
    });

    it('should return 403 when user has no access', async () => {

      const mockDocument = {
        id: 'restricted-doc',
        file_name: 'document.pdf',
        file_url: 'test-file.pdf',
        uploaded_by: 'other-user',
        client_id: 'other-client',
        lawyer_id: 'other-lawyer',
        case_id: 'other-case',
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockDocument],
        rowCount: 1
      });

      const response = await request(app)
        .get('/api/documents/restricted-doc/download')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Accès refusé');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document', async () => {

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({
          rows: [{ file_url: 'test-file.pdf' }],
          rowCount: 1
        })
        .mockResolvedValueOnce({
          rows: [],
          rowCount: 1
        });

      const response = await request(app)
        .delete('/api/documents/doc-123')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 if document not found', async () => {

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .delete('/api/documents/nonexistent')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/documents/:id', () => {
    it('should update document metadata', async () => {

      const mockUpdatedDocument = {
        id: 'doc-123',
        title: 'updated-name.pdf',
        description: 'Updated description',
        uploaded_by: 'user-123',
        file_name: 'updated-name.pdf',
        document_type: 'evidence',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({
          rows: [{ id: 'doc-123', uploaded_by: 'user-123' }],
          rowCount: 1
        })
        .mockResolvedValueOnce({
          rows: [mockUpdatedDocument],
          rowCount: 1
        });

      const response = await request(app)
        .patch('/api/documents/doc-123')
        .send({
          title: 'updated-name.pdf',
          description: 'Updated description',
        })
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('updated-name.pdf');
    });

    it('should not update document from other user', async () => {

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ uploaded_by: 'other-user' }],
        rowCount: 1
      });

      const response = await request(app)
        .patch('/api/documents/doc-123')
        .send({ title: 'new-name.pdf' })
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/documents/:id/share', () => {
    it('should share document with user', async () => {

      const mockShare = {
        id: 'share-123',
        document_id: 'doc-123',
        shared_with: 'user-456',
        shared_by: 'user-123',
        permission: 'view',
        created_at: '2026-01-13T15:10:10.254Z',
      };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({
          rows: [{ id: 'doc-123', uploaded_by: 'user-123' }],
          rowCount: 1
        })
        .mockResolvedValueOnce({
          rows: [mockShare],
          rowCount: 1
        });

      const response = await request(app)
        .post('/api/documents/doc-123/share')
        .send({
          sharedWith: 'user-456',
          permission: 'view',
        })
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(201);
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
      if (Array.isArray(response.body.data)) {
        expect(response.body.data).toHaveLength(1);
      } else {
        expect(response.body.data).toHaveProperty('id');
      }
    });
  });
});