import request from 'supertest';
import express, { Express } from 'express';
import * as conflictService from '../../src/services/conflict.service';
import * as routeOptimizerService from '../../src/services/route-optimizer.service';
import * as recurrenceService from '../../src/services/recurrence.service';
import { authenticate } from '../../src/middleware/auth.middleware';

jest.mock('../../src/services/conflict.service');
jest.mock('../../src/services/route-optimizer.service');
jest.mock('../../src/services/recurrence.service');
jest.mock('../../src/middleware/auth.middleware');

describe('Appointment API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    (authenticate as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'user-123', role: 'avocat' };
      next();
    });

    const appointmentRoutes = require('../../src/routes/appointment.routes').default;
    app.use('/api/appointments', appointmentRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appointments/check-conflicts', () => {
    it('should check for conflicts successfully with no conflicts', async () => {
      (conflictService.checkConflicts as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/appointments/check-conflicts')
        .send({
          lawyer_id: 'lawyer-123',
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T11:00:00Z',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.conflicts).toEqual([]);
      expect(response.body.hasConflict).toBe(false);
    });

    it('should detect conflicts', async () => {
      const conflicts = [
        {
          id: 'apt-1',
          title: 'Existing Appointment',
          start_time: '2024-01-15T10:30:00Z',
          end_time: '2024-01-15T11:30:00Z',
        },
      ];

      (conflictService.checkConflicts as jest.Mock).mockResolvedValue(conflicts);

      const response = await request(app)
        .post('/api/appointments/check-conflicts')
        .send({
          lawyer_id: 'lawyer-123',
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T11:00:00Z',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.conflicts).toEqual(conflicts);
      expect(response.body.hasConflict).toBe(true);
    });

    it('should handle conflict check errors', async () => {
      (conflictService.checkConflicts as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/api/appointments/check-conflicts')
        .send({
          lawyer_id: 'lawyer-123',
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T11:00:00Z',
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('conflits');
    });
  });

  describe('GET /api/appointments/available-slots', () => {
    it('should return available slots successfully', async () => {
      const mockSlots = [
        { start: '09:00', end: '10:00', available: true },
        { start: '14:00', end: '15:00', available: true },
      ];

      (conflictService.findAvailableSlots as jest.Mock).mockResolvedValue(mockSlots);

      const response = await request(app)
        .get('/api/appointments/available-slots')
        .query({
          lawyer_id: 'lawyer-123',
          date: '2024-01-15',
          duration: '60',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.slots).toEqual(mockSlots);
    });

    it('should use default duration when not provided', async () => {
      (conflictService.findAvailableSlots as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/appointments/available-slots')
        .query({
          lawyer_id: 'lawyer-123',
          date: '2024-01-15',
        })
        .expect(200);

      expect(conflictService.findAvailableSlots).toHaveBeenCalledWith(
        'lawyer-123',
        '2024-01-15',
        60
      );
    });

    it('should handle errors when finding available slots', async () => {
      (conflictService.findAvailableSlots as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/appointments/available-slots')
        .query({
          lawyer_id: 'lawyer-123',
          date: '2024-01-15',
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('créneaux');
    });
  });

  describe('GET /api/appointments/optimize-route', () => {
    it('should optimize route successfully', async () => {
      const mockResult = {
        success: true,
        optimizedRoute: [
          { id: 'apt-1', order: 1, address: 'Address 1' },
          { id: 'apt-2', order: 2, address: 'Address 2' },
        ],
        totalDistance: 15.5,
        estimatedDuration: 45,
      };

      (routeOptimizerService.optimizeRoute as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/appointments/optimize-route')
        .query({
          lawyer_id: 'lawyer-123',
          date: '2024-01-15',
        })
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });

    it('should handle route optimization errors', async () => {
      (routeOptimizerService.optimizeRoute as jest.Mock).mockRejectedValue(
        new Error('Optimization failed')
      );

      const response = await request(app)
        .get('/api/appointments/optimize-route')
        .query({
          lawyer_id: 'lawyer-123',
          date: '2024-01-15',
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('optimisation');
    });
  });

  describe('POST /api/appointments/recurring', () => {
    it('should create recurring appointments successfully', async () => {
      const mockResult = {
        success: true,
        seriesId: 'series-123',
        appointments: [
          { id: 'apt-1', start_time: '2024-01-15T10:00:00Z' },
          { id: 'apt-2', start_time: '2024-01-22T10:00:00Z' },
        ],
      };

      (recurrenceService.createRecurringAppointments as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/appointments/recurring')
        .send({
          title: 'Weekly Meeting',
          lawyer_id: 'lawyer-123',
          client_id: 'client-123',
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T11:00:00Z',
          recurrence_pattern: 'weekly',
          recurrence_count: 4,
        })
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });

    it('should handle errors when creating recurring appointments', async () => {
      (recurrenceService.createRecurringAppointments as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      );

      const response = await request(app)
        .post('/api/appointments/recurring')
        .send({
          title: 'Weekly Meeting',
          lawyer_id: 'lawyer-123',
          client_id: 'client-123',
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('récurrents');
    });
  });

  describe('PUT /api/appointments/recurring/:seriesId', () => {
    it('should update recurring series successfully', async () => {
      const mockResult = {
        success: true,
        updated: 4,
        message: 'Series updated successfully',
      };

      (recurrenceService.updateRecurringSeries as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/api/appointments/recurring/series-123')
        .send({
          title: 'Updated Weekly Meeting',
        })
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(recurrenceService.updateRecurringSeries).toHaveBeenCalledWith(
        'series-123',
        expect.objectContaining({ title: 'Updated Weekly Meeting' })
      );
    });

    it('should handle errors when updating recurring series', async () => {
      (recurrenceService.updateRecurringSeries as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const response = await request(app)
        .put('/api/appointments/recurring/series-123')
        .send({ title: 'Updated Title' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('mise à jour');
    });
  });

  describe('DELETE /api/appointments/recurring/:seriesId', () => {
    it('should delete recurring series successfully', async () => {
      const mockResult = {
        success: true,
        deleted: 4,
        message: 'Series deleted successfully',
      };

      (recurrenceService.deleteRecurringSeries as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .delete('/api/appointments/recurring/series-123')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(recurrenceService.deleteRecurringSeries).toHaveBeenCalledWith('series-123');
    });

    it('should handle errors when deleting recurring series', async () => {
      (recurrenceService.deleteRecurringSeries as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      const response = await request(app)
        .delete('/api/appointments/recurring/series-123')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('suppression');
    });
  });

  describe('GET /api/appointments/recurring/:seriesId', () => {
    it('should get series appointments successfully', async () => {
      const mockAppointments = [
        { id: 'apt-1', start_time: '2024-01-15T10:00:00Z' },
        { id: 'apt-2', start_time: '2024-01-22T10:00:00Z' },
      ];

      (recurrenceService.getSeriesAppointments as jest.Mock).mockResolvedValue(
        mockAppointments
      );

      const response = await request(app)
        .get('/api/appointments/recurring/series-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAppointments);
    });

    it('should handle errors when getting series appointments', async () => {
      (recurrenceService.getSeriesAppointments as jest.Mock).mockRejectedValue(
        new Error('Fetch failed')
      );

      const response = await request(app)
        .get('/api/appointments/recurring/series-123')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('récupération');
    });
  });
});

