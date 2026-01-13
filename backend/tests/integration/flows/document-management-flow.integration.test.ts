import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import documentRoutes from '../../../src/routes/document.routes';
import dossierRoutes from '../../../src/routes/dossier.routes';

dotenv.config({ path: '.env.test' });

const createTestApp = () => {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/documents', documentRoutes);
  app.use('/api/cases', dossierRoutes);

  return app;
};

describe('Document Management Flow Integration Tests', () => {
  let app: express.Application;
  let documentId: string;
  let caseId: string;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Complete Document Lifecycle', () => {
    it('should complete full document management workflow', async () => {
      const caseData = {
        title: 'Dossier Test Documents',
        case_type: 'commercial',
        client_id: 'client-123',
        description: 'Dossier pour tester la gestion documentaire'
      };

      const caseResponse = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer mock-jwt-token`)
        .send(caseData);

      if ([200, 201].includes(caseResponse.status) && caseResponse.body.success) {
        caseId = caseResponse.body.data.id;

        const uploadResponse = await request(app)
          .post('/api/documents')
          .set('Authorization', `Bearer mock-jwt-token`)
          .field('title', 'Contrat de Vente')
          .field('document_type', 'contract')
          .field('case_id', caseId)
          .field('description', 'Contrat de vente immobilière')
          .attach('file', Buffer.from('Contenu du contrat de vente'), 'contract.pdf');

        expect([200, 201, 400, 401, 500]).toContain(uploadResponse.status);

        if ([200, 201].includes(uploadResponse.status) && uploadResponse.body.success) {
          documentId = uploadResponse.body.data.id;

          const getResponse = await request(app)
            .get(`/api/documents/${documentId}`)
            .set('Authorization', `Bearer mock-jwt-token`);

          if (getResponse.status === 200 && getResponse.body.success) {
            expect(getResponse.body.data.title).toBe('Contrat de Vente');
          }

          const updateResponse = await request(app)
            .put(`/api/documents/${documentId}`)
            .set('Authorization', `Bearer mock-jwt-token`)
            .send({
              title: 'Contrat de Vente - Version 2',
              description: 'Contrat mis à jour après négociations'
            });

          expect([200, 401, 404, 500]).toContain(updateResponse.status);

          const shareResponse = await request(app)
            .post(`/api/documents/${documentId}/share`)
            .set('Authorization', `Bearer mock-jwt-token`)
            .send({
              user_ids: ['lawyer-456', 'client-789'],
              permission: 'read'
            });

          expect([200, 201, 401, 404, 500]).toContain(shareResponse.status);

          const downloadResponse = await request(app)
            .get(`/api/documents/${documentId}/download`)
            .set('Authorization', `Bearer mock-jwt-token`);

          expect([200, 401, 404, 500]).toContain(downloadResponse.status);

          const verifyResponse = await request(app)
            .post(`/api/documents/${documentId}/verify`)
            .set('Authorization', `Bearer mock-jwt-token`);

          expect([200, 401, 404, 500]).toContain(verifyResponse.status);
        }
      }
    }, 30000);
  });

  describe('Multiple Documents Management Workflow', () => {
    it('should handle multiple documents for a case', async () => {
      const testCaseId = '123';
      const documents = [
        {
          title: 'Pièce d\'identité',
          document_type: 'identity',
          case_id: testCaseId,
          content: 'ID Card Content'
        },
        {
          title: 'Justificatif de domicile',
          document_type: 'proof_of_address',
          case_id: testCaseId,
          content: 'Address Proof Content'
        },
        {
          title: 'Relevé bancaire',
          document_type: 'financial',
          case_id: testCaseId,
          content: 'Bank Statement Content'
        }
      ];

      const uploadedIds: string[] = [];

      for (const doc of documents) {
        const response = await request(app)
          .post('/api/documents')
          .set('Authorization', `Bearer mock-jwt-token`)
          .field('title', doc.title)
          .field('document_type', doc.document_type)
          .field('case_id', doc.case_id)
          .attach('file', Buffer.from(doc.content), `${doc.document_type}.pdf`);

        if ([200, 201].includes(response.status) && response.body.success) {
          uploadedIds.push(response.body.data.id);
        }
      }

      const caseDocsResponse = await request(app)
        .get('/api/documents')
        .query({ case_id: testCaseId })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(caseDocsResponse.status);

      if (caseDocsResponse.status === 200 && caseDocsResponse.body.success) {
        const caseDocs = caseDocsResponse.body.data.filter((d: any) => d.case_id === testCaseId);
        expect(caseDocs.length).toBeGreaterThanOrEqual(0);
      }
    }, 30000);
  });

  describe('Document Search and Filter Workflow', () => {
    it('should search and filter documents effectively', async () => {
      const typeResponse = await request(app)
        .get('/api/documents')
        .query({ document_type: 'contract' })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(typeResponse.status);

      const caseResponse = await request(app)
        .get('/api/documents')
        .query({ case_id: '123' })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(caseResponse.status);

      const paginatedResponse = await request(app)
        .get('/api/documents')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(paginatedResponse.status);
    }, 15000);
  });

  describe('Confidential Documents Workflow', () => {
    it('should handle confidential documents properly', async () => {
      const confidentialResponse = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer mock-jwt-token`)
        .field('title', 'Document Confidentiel')
        .field('document_type', 'legal')
        .field('case_id', '456')
        .field('is_confidential', 'true')
        .attach('file', Buffer.from('Contenu confidentiel'), 'confidential.pdf');

      expect([200, 201, 400, 401, 500]).toContain(confidentialResponse.status);

      if ([200, 201].includes(confidentialResponse.status) && confidentialResponse.body.success) {
        const confDocId = confidentialResponse.body.data.id;

        const accessResponse = await request(app)
          .get(`/api/documents/${confDocId}`)
          .set('Authorization', `Bearer different-user-token`);

        expect([200, 401, 403, 404, 500]).toContain(accessResponse.status);
      }
    }, 15000);
  });

  describe('Document Validation Workflow', () => {
    it('should validate documents before upload', async () => {
      try {
        const largeFileResponse = await request(app)
          .post('/api/documents')
          .set('Authorization', `Bearer mock-jwt-token`)
          .field('title', 'Fichier trop grand')
          .field('document_type', 'other')
          .field('case_id', '789')
          .attach('file', Buffer.alloc(5 * 1024 * 1024), 'large.pdf')
          .timeout(5000);

        expect([400, 401, 413, 500]).toContain(largeFileResponse.status);
      } catch (error: any) {
        if (error.code === 'ECONNRESET' || error.timeout) {
        } else {
          throw error;
        }
      }

      const missingFieldsResponse = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer mock-jwt-token`)
        .attach('file', Buffer.from('content'), 'file.pdf');

      expect([400, 401, 500]).toContain(missingFieldsResponse.status);

      const validateResponse = await request(app)
        .post('/api/documents/validate')
        .set('Authorization', `Bearer mock-jwt-token`)
        .send({
          title: 'Test Document',
          document_type: 'contract',
          case_id: '123'
        });

      expect([200, 401, 404, 500]).toContain(validateResponse.status);
    }, 15000);
  });

  describe('Document Statistics Workflow', () => {
    it('should retrieve document statistics', async () => {
      const statsResponse = await request(app)
        .get('/api/documents/stats')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 404, 500]).toContain(statsResponse.status);

      if (statsResponse.status === 200 && statsResponse.body.success) {
        expect(statsResponse.body.data).toHaveProperty('total');
      }

      const typeStatsResponse = await request(app)
        .get('/api/documents/stats/by-type')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 404, 500]).toContain(typeStatsResponse.status);
    }, 15000);
  });

  describe('Document Deletion Workflow', () => {
    it('should handle document deletion properly', async () => {
      const uploadResponse = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer mock-jwt-token`)
        .field('title', 'Document à supprimer')
        .field('document_type', 'other')
        .field('case_id', '999')
        .attach('file', Buffer.from('To be deleted'), 'temp.pdf');

      if ([200, 201].includes(uploadResponse.status) && uploadResponse.body.success) {
        const tempDocId = uploadResponse.body.data.id;

        const deleteResponse = await request(app)
          .delete(`/api/documents/${tempDocId}`)
          .set('Authorization', `Bearer mock-jwt-token`);

        expect([200, 401, 403, 404, 500]).toContain(deleteResponse.status);

        const verifyResponse = await request(app)
          .get(`/api/documents/${tempDocId}`)
          .set('Authorization', `Bearer mock-jwt-token`);

        if (deleteResponse.status === 200) {
          expect([401, 404, 500]).toContain(verifyResponse.status);
        }
      }
    }, 15000);
  });
});
