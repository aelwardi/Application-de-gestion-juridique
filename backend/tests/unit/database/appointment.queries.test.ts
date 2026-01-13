import { pool } from '../../../src/config/database.config';
import * as appointmentQueries from '../../../src/database/queries/appointment.queries';

jest.mock('../../../src/config/database.config');

describe('Appointment Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create a new appointment', async () => {
      const mockAppointment = {
        id: 'apt-123',
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        case_id: 'case-123',
        appointment_date: new Date(),
        status: 'scheduled',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockAppointment] });

      const result = await appointmentQueries.createAppointment({
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        case_id: 'case-123',
        appointment_type: 'consultation',
        title: 'Initial Consultation',
        start_time: new Date(),
        end_time: new Date(Date.now() + 3600000), // 1 hour later
        location: 'Office',
        notes: 'Initial consultation',
      });

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('getAppointmentById', () => {
    it('should get appointment by id', async () => {
      const mockAppointment = {
        id: 'apt-123',
        client_id: 'client-123',
        status: 'scheduled',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockAppointment] });

      const result = await appointmentQueries.getAppointmentById('apt-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockAppointment);
    });

    it('should return null if appointment not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await appointmentQueries.getAppointmentById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAppointmentsByClient', () => {
    it('should get appointments for a client', async () => {
      const mockAppointments = [
        { id: 'apt-1', client_id: 'client-123' },
        { id: 'apt-2', client_id: 'client-123' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockAppointments });

      const result = await appointmentQueries.getAppointmentsByClient('client-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });
  });

  describe('getAppointmentsByLawyer', () => {
    it('should get appointments for a lawyer', async () => {
      const mockAppointments = [
        { id: 'apt-1', lawyer_id: 'lawyer-123' },
        { id: 'apt-2', lawyer_id: 'lawyer-123' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockAppointments });

      const result = await appointmentQueries.getAppointmentsByLawyer('lawyer-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });

    it('should filter by status', async () => {
      const mockAppointments = [
        { id: 'apt-1', lawyer_id: 'lawyer-123', status: 'scheduled' },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockAppointments });

      const result = await appointmentQueries.getAppointmentsByLawyer('lawyer-123', { status: 'scheduled' as any });

      expect(result).toEqual(mockAppointments);
    });
  });

  describe('updateAppointment', () => {
    it('should update an appointment', async () => {
      const mockAppointment = {
        id: 'apt-123',
        status: 'confirmed',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockAppointment] });

      const result = await appointmentQueries.updateAppointment('apt-123', {
        status: 'confirmed',
      });

      expect(pool.query).toHaveBeenCalled();
      expect(result?.status).toBe('confirmed');
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an appointment', async () => {
      const mockAppointment = {
        id: 'apt-123',
        status: 'cancelled',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockAppointment] });

      const result = await appointmentQueries.cancelAppointment('apt-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result?.status).toBe('cancelled');
    });
  });

  describe('deleteAppointment', () => {
    it('should delete an appointment', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await appointmentQueries.deleteAppointment('apt-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if appointment not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await appointmentQueries.deleteAppointment('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getUpcomingAppointments', () => {
    it('should get upcoming appointments', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          appointment_date: new Date(Date.now() + 86400000), // tomorrow
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockAppointments });

      const result = await appointmentQueries.getUpcomingAppointments();

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });
  });

  describe('markReminderSent', () => {
    it('should mark reminder as sent', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await appointmentQueries.markReminderSent('apt-123');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getTodayAppointments', () => {
    it('should get today appointments', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          appointment_date: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockAppointments });

      const result = await appointmentQueries.getTodayAppointments();

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });
  });
});

