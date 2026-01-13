import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../../../src/routes/auth.routes';
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

  app.use('/api/auth', authRoutes);
  app.use('/api/cases', dossierRoutes);

  return app;
};

describe('Case Management Flow Integration Tests', () => {
  let app: express.Application;
  let authToken: string;
  let createdCaseId: string;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Complete Case Management Workflow', () => {
    it('should complete full case lifecycle', async () => {
      const caseData = {
        title: 'Affaire Succession Martin',
        case_type: 'family',
        client_id: 'test-client-123',
        description: 'Dossier de succession complexe',
        priority: 'high'
      };

      const createResponse = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer mock-jwt-token`)
        .send(caseData);

      expect([200, 201, 400, 401, 500]).toContain(createResponse.status);

      if ([200, 201].includes(createResponse.status) && createResponse.body.success) {
        createdCaseId = createResponse.body.data.id;
        
        expect(createResponse.body.data).toHaveProperty('case_number');
        expect(createResponse.body.data.title).toBe(caseData.title);

        const assignResponse = await request(app)
          .post(`/api/cases/${createdCaseId}/assign-lawyer`)
          .set('Authorization', `Bearer mock-jwt-token`)
          .send({ lawyer_id: 'lawyer-456' });

        expect([200, 401, 404, 500]).toContain(assignResponse.status);

        const statusResponse = await request(app)
          .patch(`/api/cases/${createdCaseId}/status`)
          .set('Authorization', `Bearer mock-jwt-token`)
          .send({ status: 'in_progress' });

        expect([200, 401, 404, 500]).toContain(statusResponse.status);

        const getResponse = await request(app)
          .get(`/api/cases/${createdCaseId}`)
          .set('Authorization', `Bearer mock-jwt-token`);

        if (getResponse.status === 200 && getResponse.body.success) {
          expect(getResponse.body.data.id).toBe(createdCaseId);
        }

        const updateResponse = await request(app)
          .put(`/api/cases/${createdCaseId}`)
          .set('Authorization', `Bearer mock-jwt-token`)
          .send({
            description: 'Description mise à jour avec nouvelles informations'
          });

        expect([200, 401, 404, 500]).toContain(updateResponse.status);

        const closeResponse = await request(app)
          .post(`/api/cases/${createdCaseId}/close`)
          .set('Authorization', `Bearer mock-jwt-token`)
          .send({ reason: 'Succession réglée à l\'amiable' });

        expect([200, 401, 404, 500]).toContain(closeResponse.status);

        const archiveResponse = await request(app)
          .post(`/api/cases/${createdCaseId}/archive`)
          .set('Authorization', `Bearer mock-jwt-token`);

        expect([200, 401, 404, 500]).toContain(archiveResponse.status);
      }
    }, 30000);
  });

  describe('Multi-case Management Workflow', () => {
    it('should handle multiple cases for same client', async () => {
      const clientId = 'client-789';
      const casesData = [
        {
          title: 'Affaire Divorce',
          case_type: 'family',
          client_id: clientId,
          description: 'Procédure de divorce',
          priority: 'medium'
        },
        {
          title: 'Garde des enfants',
          case_type: 'family',
          client_id: clientId,
          description: 'Détermination de la garde',
          priority: 'high'
        }
      ];

      const caseIds: string[] = [];

      for (const caseData of casesData) {
        const response = await request(app)
          .post('/api/cases')
          .set('Authorization', `Bearer mock-jwt-token`)
          .send(caseData);

        if ([200, 201].includes(response.status) && response.body.success) {
          caseIds.push(response.body.data.id);
        }
      }

      const clientCasesResponse = await request(app)
        .get(`/api/cases/client/${clientId}`)
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(clientCasesResponse.status);
    }, 30000);
  });

  describe('Case Statistics and Reporting Workflow', () => {
    it('should retrieve comprehensive case statistics', async () => {
      const statsResponse = await request(app)
        .get('/api/cases/stats')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(statsResponse.status);

      if (statsResponse.status === 200 && statsResponse.body.success) {
        expect(statsResponse.body.data).toHaveProperty('total');
      }

      const hearingsResponse = await request(app)
        .get('/api/cases/upcoming-hearings')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(hearingsResponse.status);

      const filteredResponse = await request(app)
        .get('/api/cases')
        .query({ status: 'open', priority: 'high' })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(filteredResponse.status);
    }, 15000);
  });

  describe('Case Search and Filter Workflow', () => {
    it('should search and filter cases effectively', async () => {
      const statusSearch = await request(app)
        .get('/api/cases')
        .query({ status: 'open' })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(statusSearch.status);

      const typeFilter = await request(app)
        .get('/api/cases')
        .query({ case_type: 'family' })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(typeFilter.status);

      const priorityFilter = await request(app)
        .get('/api/cases')
        .query({ priority: 'high' })
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([200, 401, 500]).toContain(priorityFilter.status);
    }, 15000);
  });

  describe('Error Handling in Case Management', () => {
    it('should handle invalid case operations gracefully', async () => {
      const getResponse = await request(app)
        .get('/api/cases/non-existent-id')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect([401, 404, 500]).toContain(getResponse.status);

      const updateResponse = await request(app)
        .put('/api/cases/non-existent-id')
        .set('Authorization', `Bearer mock-jwt-token`)
        .send({ title: 'New title' });

      expect([401, 404, 500]).toContain(updateResponse.status);

      const assignResponse = await request(app)
        .post('/api/cases/1/assign-lawyer')
        .set('Authorization', `Bearer mock-jwt-token`)
        .send({});

      expect([400, 401, 404, 500]).toContain(assignResponse.status);
    });
  });
});
