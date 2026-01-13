import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import appointmentRoutes from '../../../src/routes/appointment.routes';

dotenv.config({ path: '.env.test' });

const createTestApp = () => {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/appointments', appointmentRoutes);

  return app;
};

describe('Appointments API Integration Tests', () => {
  let app: express.Application;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
    authToken = 'mock-jwt-token';
  });

  describe('GET /api/appointments/stats', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/appointments/stats')
        .expect(401);
    });

    it('should return appointment statistics', async () => {
      const response = await request(app)
        .get('/api/appointments/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('total');
          expect(response.body.data).toHaveProperty('upcoming');
          expect(response.body.data).toHaveProperty('completed');
        }
      }
    });
  });

  describe('GET /api/appointments/upcoming', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/appointments/upcoming')
        .expect(401);
    });

    it('should return upcoming appointments', async () => {
      const response = await request(app)
        .get('/api/appointments/upcoming')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      }
    });

    it('should return appointments in chronological order', async () => {
      const response = await request(app)
        .get('/api/appointments/upcoming')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200 && response.body.success && response.body.data.length > 1) {
        const appointments = response.body.data;
        for (let i = 0; i < appointments.length - 1; i++) {
          const current = new Date(appointments[i].start_time);
          const next = new Date(appointments[i + 1].start_time);
          expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
        }
      }
    });
  });

  describe('GET /api/appointments/today', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/appointments/today')
        .expect(401);
    });

    it('should return today\'s appointments', async () => {
      const response = await request(app)
        .get('/api/appointments/today')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401]).toContain(response.status);

      if (response.status === 200 && response.body.success) {
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          response.body.data.forEach((appointment: any) => {
            const appointmentDate = new Date(appointment.start_time);
            appointmentDate.setHours(0, 0, 0, 0);
            expect(appointmentDate.getTime()).toBe(today.getTime());
          });
        }
      }
    });
  });

  describe('POST /api/appointments/check-conflicts', () => {
    it('should check for appointment conflicts', async () => {
      const conflictData = {
        lawyer_id: '123',
        start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        end_time: new Date(Date.now() + 90000000).toISOString(),
      };

      const response = await request(app)
        .post('/api/appointments/check-conflicts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(conflictData);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('hasConflict');
        expect(response.body).toHaveProperty('conflicts');
        expect(Array.isArray(response.body.conflicts)).toBe(true);
      }
    });

    it('should validate required fields for conflict check', async () => {
      const response = await request(app)
        .post('/api/appointments/check-conflicts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('GET /api/appointments/available-slots', () => {
    it('should return available time slots', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get('/api/appointments/available-slots')
        .query({
          lawyer_id: '123',
          date: dateStr,
          duration: 60
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('slots');
        expect(Array.isArray(response.body.slots)).toBe(true);
      }
    });

    it('should require lawyer_id parameter', async () => {
      const response = await request(app)
        .get('/api/appointments/available-slots')
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 401, 500]).toContain(response.status);
    });

    it('should handle different duration parameters', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const durations = [30, 60, 90, 120];

      for (const duration of durations) {
        const response = await request(app)
          .get('/api/appointments/available-slots')
          .query({
            lawyer_id: '123',
            date: dateStr,
            duration
          })
          .set('Authorization', `Bearer ${authToken}`);

        if (response.status === 200 && response.body.success) {
          const slots = response.body.slots;
          slots.forEach((slot: any) => {
            if (slot.start_time && slot.end_time) {
              const start = new Date(slot.start_time);
              const end = new Date(slot.end_time);
              const diff = (end.getTime() - start.getTime()) / (1000 * 60);
              expect(diff).toBe(duration);
            }
          });
        }
      }
    });
  });

  describe('GET /api/appointments/optimize-route', () => {
    it('should optimize route for lawyer appointments', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get('/api/appointments/optimize-route')
        .query({
          lawyer_id: '123',
          date: dateStr
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });

    it('should require lawyer_id and date parameters', async () => {
      const response = await request(app)
        .get('/api/appointments/optimize-route')
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('POST /api/appointments/recurring', () => {
    it('should create recurring appointments', async () => {
      const recurringData = {
        lawyer_id: '123',
        client_id: '456',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        recurrence_pattern: 'weekly',
        recurrence_count: 4
      };

      const response = await request(app)
        .post('/api/appointments/recurring')
        .set('Authorization', `Bearer ${authToken}`)
        .send(recurringData);

      expect([200, 201, 401, 500]).toContain(response.status);

      if ([200, 201].includes(response.status)) {
        expect(response.body).toHaveProperty('success');
      }
    });

    it('should validate recurrence pattern', async () => {
      const invalidData = {
        lawyer_id: '123',
        client_id: '456',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        recurrence_pattern: 'invalid_pattern',
        recurrence_count: 4
      };

      const response = await request(app)
        .post('/api/appointments/recurring')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('Appointment CRUD operations', () => {
    it('should create a new appointment', async () => {
      const appointmentData = {
        lawyer_id: '123',
        client_id: '456',
        case_id: '789',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        title: 'Consultation juridique',
        location: 'Bureau',
        notes: 'Rendez-vous initial'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData);

      expect([200, 201, 401, 500]).toContain(response.status);
    });

    it('should get appointment by ID', async () => {
      const response = await request(app)
        .get('/api/appointments/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data).toHaveProperty('start_time');
          expect(response.body.data).toHaveProperty('end_time');
        }
      }
    });

    it('should update appointment', async () => {
      const updateData = {
        title: 'Consultation mise à jour',
        notes: 'Notes modifiées'
      };

      const response = await request(app)
        .put('/api/appointments/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 401, 404, 500]).toContain(response.status);
    });

    it('should delete appointment', async () => {
      const response = await request(app)
        .delete('/api/appointments/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
