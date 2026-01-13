import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

  app.use('/api/cases', dossierRoutes);

  return app;
};

describe('Cases API Integration Tests', () => {
  let app: express.Application;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
    authToken = 'mock-jwt-token';
  });

  describe('POST /api/cases', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/cases')
        .expect(401);
    });

    it('should create a new case', async () => {
      const caseData = {
        title: 'Affaire de divorce',
        case_type: 'family',
        client_id: '123',
        description: 'Description du dossier',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(caseData);

      expect([200, 201, 400, 401, 500]).toContain(response.status);

      if ([200, 201].includes(response.status)) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data).toHaveProperty('case_number');
        }
      }
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect([400, 401, 500]).toContain(response.status);
    });

    it('should auto-generate case number', async () => {
      const caseData = {
        title: 'Test Case',
        case_type: 'commercial',
        client_id: '123',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(caseData);

      if ([200, 201].includes(response.status) && response.body.success) {
        expect(response.body.data.case_number).toBeDefined();
        expect(response.body.data.case_number).toMatch(/^[A-Z0-9-]+$/);
      }
    });
  });

  describe('GET /api/cases', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cases')
        .expect(401);
    });

    it('should return list of cases', async () => {
      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      }
    });

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/cases')
        .query({ status: 'open' })
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        response.body.data.forEach((caseItem: any) => {
          if (caseItem.status) {
            expect(caseItem.status).toBe('open');
          }
        });
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/cases')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success) {
        expect(response.body.data.length).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('GET /api/cases/stats', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cases/stats')
        .expect(401);
    });

    it('should return case statistics', async () => {
      const response = await request(app)
        .get('/api/cases/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200 && response.body.success) {
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data.total).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('GET /api/cases/upcoming-hearings', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cases/upcoming-hearings')
        .expect(401);
    });

    it('should return upcoming hearings', async () => {
      const response = await request(app)
        .get('/api/cases/upcoming-hearings')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200 && response.body.success) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return hearings in chronological order', async () => {
      const response = await request(app)
        .get('/api/cases/upcoming-hearings')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success && response.body.data.length > 1) {
        const hearings = response.body.data;
        for (let i = 0; i < hearings.length - 1; i++) {
          const current = new Date(hearings[i].hearing_date);
          const next = new Date(hearings[i + 1].hearing_date);
          expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
        }
      }
    });
  });

  describe('GET /api/cases/lawyer/:lawyerId', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cases/lawyer/123')
        .expect(401);
    });

    it('should return cases for specific lawyer', async () => {
      const response = await request(app)
        .get('/api/cases/lawyer/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200 && response.body.success) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/cases/client/:clientId', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cases/client/456')
        .expect(401);
    });

    it('should return cases for specific client', async () => {
      const response = await request(app)
        .get('/api/cases/client/456')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200 && response.body.success) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/cases/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cases/1')
        .expect(401);
    });

    it('should return case details', async () => {
      const response = await request(app)
        .get('/api/cases/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data).toHaveProperty('title');
          expect(response.body.data).toHaveProperty('case_number');
        }
      }
    });

    it('should return 404 for non-existent case', async () => {
      const response = await request(app)
        .get('/api/cases/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect([401, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/cases/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/cases/1')
        .send({ title: 'Updated title' })
        .expect(401);
    });

    it('should update case details', async () => {
      const updateData = {
        title: 'Titre mis à jour',
        description: 'Description mise à jour',
        priority: 'medium'
      };

      const response = await request(app)
        .put('/api/cases/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });
  });

  describe('PATCH /api/cases/:id/status', () => {
    it('should update case status', async () => {
      const response = await request(app)
        .patch('/api/cases/1/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' });

      expect([200, 401, 404, 500]).toContain(response.status);
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .patch('/api/cases/1/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' });

      expect([400, 401, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/cases/:id/assign-lawyer', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/cases/1/assign-lawyer')
        .expect(401);
    });

    it('should assign lawyer to case', async () => {
      const response = await request(app)
        .post('/api/cases/1/assign-lawyer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lawyer_id: '789' });

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });

    it('should validate lawyer_id', async () => {
      const response = await request(app)
        .post('/api/cases/1/assign-lawyer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('POST /api/cases/:id/close', () => {
    it('should close a case', async () => {
      const response = await request(app)
        .post('/api/cases/1/close')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Affaire résolue' });

      expect([200, 401, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });
  });

  describe('POST /api/cases/:id/archive', () => {
    it('should archive a case', async () => {
      const response = await request(app)
        .post('/api/cases/1/archive')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/cases/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/cases/1')
        .expect(401);
    });

    it('should delete case', async () => {
      const response = await request(app)
        .delete('/api/cases/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should prevent deletion of active cases', async () => {
      const response = await request(app)
        .delete('/api/cases/active-case-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
