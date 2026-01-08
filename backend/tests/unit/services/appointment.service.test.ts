import * as appointmentService from '../../../src/services/appointment.service';
import * as appointmentQueries from '../../../src/database/queries/appointment.queries';
import { mockAppointment } from '../../helpers/mock-helpers';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/database/queries/appointment.queries');
jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/services/email.service');

describe('AppointmentService', () => {
  const mockQueries = appointmentQueries as jest.Mocked<typeof appointmentQueries>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create appointment successfully', async () => {
      const clientId = uuidv4();
      const lawyerId = uuidv4();

      const appointmentData = {
        client_id: clientId,
        lawyer_id: lawyerId,
        title: 'Consultation juridique',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        appointment_type: 'consultation' as const,
        location: 'Office',
      };

      const newAppointment = mockAppointment(appointmentData);

      mockQueries.createAppointment.mockResolvedValueOnce(newAppointment);

      const result = await appointmentService.createAppointment(appointmentData);

      expect(result).toBeDefined();
      expect(result.client_id).toBe(clientId);
      expect(result.lawyer_id).toBe(lawyerId);
      expect(mockQueries.createAppointment).toHaveBeenCalledWith(appointmentData);
    });
  });

  describe('getAllAppointments', () => {
    it('should return all appointments with filters', async () => {
      const appointments = [
        mockAppointment(),
        mockAppointment(),
      ];

      mockQueries.getAllAppointments.mockResolvedValueOnce({
        appointments: appointments as any,
        total: 2,
      });

      const result = await appointmentService.getAllAppointments();

      expect(result.appointments).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        status: 'scheduled' as const,
        lawyer_id: uuidv4(),
      };

      mockQueries.getAllAppointments.mockResolvedValueOnce({
        appointments: [],
        total: 0,
      });

      await appointmentService.getAllAppointments(filters);

      expect(mockQueries.getAllAppointments).toHaveBeenCalledWith(filters);
    });
  });

  describe('getAppointmentById', () => {
    it('should return appointment by id', async () => {
      const appointmentId = uuidv4();
      const appointment = mockAppointment({ id: appointmentId });

      mockQueries.getAppointmentById.mockResolvedValueOnce(appointment as any);

      const result = await appointmentService.getAppointmentById(appointmentId);

      expect(result).toBeDefined();
      expect(result.id).toBe(appointmentId);
    });

    it('should throw error if appointment not found', async () => {
      const appointmentId = uuidv4();
      mockQueries.getAppointmentById.mockResolvedValueOnce(null);

      await expect(
        appointmentService.getAppointmentById(appointmentId)
      ).rejects.toThrow('Appointment not found');
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment successfully', async () => {
      const appointmentId = uuidv4();
      const updateData = {
        status: 'confirmed' as const,
        notes: 'Updated notes',
      };

      const updatedAppointment = mockAppointment({
        id: appointmentId,
        ...updateData,
      });

      mockQueries.updateAppointment.mockResolvedValueOnce(updatedAppointment);

      const result = await appointmentService.updateAppointment(appointmentId, updateData);

      expect(result).toBeDefined();
      expect(result.status).toBe(updateData.status);
      expect(result.notes).toBe(updateData.notes);
    });

    it('should throw error if appointment not found', async () => {
      const appointmentId = uuidv4();
      mockQueries.updateAppointment.mockResolvedValueOnce(null);

      await expect(
        appointmentService.updateAppointment(appointmentId, { status: 'confirmed' })
      ).rejects.toThrow('Appointment not found');
    });
  });

  describe('deleteAppointment', () => {
    it('should delete appointment successfully', async () => {
      const appointmentId = uuidv4();
      mockQueries.deleteAppointment.mockResolvedValueOnce(true);

      await appointmentService.deleteAppointment(appointmentId);

      expect(mockQueries.deleteAppointment).toHaveBeenCalledWith(appointmentId);
    });

    it('should throw error if appointment not found', async () => {
      const appointmentId = uuidv4();
      mockQueries.deleteAppointment.mockResolvedValueOnce(false);

      await expect(
        appointmentService.deleteAppointment(appointmentId)
      ).rejects.toThrow('Appointment not found');
    });
  });

  describe('getAppointmentsByLawyer', () => {
    it('should return lawyer appointments', async () => {
      const lawyerId = uuidv4();
      const appointments = [
        mockAppointment({ lawyer_id: lawyerId }),
        mockAppointment({ lawyer_id: lawyerId }),
      ];

      mockQueries.getAppointmentsByLawyer.mockResolvedValueOnce(appointments as any);

      const result = await appointmentService.getAppointmentsByLawyer(lawyerId);

      expect(result).toHaveLength(2);
      expect(mockQueries.getAppointmentsByLawyer).toHaveBeenCalledWith(lawyerId, {});
    });
  });

  describe('getAppointmentsByClient', () => {
    it('should return client appointments', async () => {
      const clientId = uuidv4();
      const appointments = [
        mockAppointment({ client_id: clientId }),
      ];

      mockQueries.getAppointmentsByClient.mockResolvedValueOnce(appointments as any);

      const result = await appointmentService.getAppointmentsByClient(clientId);

      expect(result).toHaveLength(1);
      expect(mockQueries.getAppointmentsByClient).toHaveBeenCalledWith(clientId, {});
    });
  });

  describe('getUpcomingAppointments', () => {
    it('should return upcoming appointments', async () => {
      const lawyerId = uuidv4();
      const futureAppointments = [
        mockAppointment({
          lawyer_id: lawyerId,
          start_time: new Date(Date.now() + 86400000),
        }),
      ];

      mockQueries.getUpcomingAppointments.mockResolvedValueOnce(futureAppointments as any);

      const result = await appointmentService.getUpcomingAppointments(lawyerId);

      expect(result).toHaveLength(1);
    });
  });

  describe('getTodayAppointments', () => {
    it('should return today appointments', async () => {
      const lawyerId = uuidv4();
      const todayAppointments = [
        mockAppointment({
          lawyer_id: lawyerId,
          start_time: new Date(),
        }),
      ];

      mockQueries.getTodayAppointments.mockResolvedValueOnce(todayAppointments as any);

      const result = await appointmentService.getTodayAppointments(lawyerId);

      expect(result).toHaveLength(1);
    });
  });

  describe('getAppointmentStats', () => {
    it('should return appointment statistics', async () => {
      const lawyerId = uuidv4();
      const stats = {
        total: 10,
        scheduled: 5,
        confirmed: 3,
        completed: 2,
        cancelled: 0,
      };

      mockQueries.getAppointmentStats.mockResolvedValueOnce(stats as any);

      const result = await appointmentService.getAppointmentStats(lawyerId);

      expect(result).toEqual(stats);
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment successfully', async () => {
      const appointmentId = uuidv4();
      const clientId = uuidv4();
      const lawyerId = uuidv4();

      const appointment = mockAppointment({
        id: appointmentId,
        client_id: clientId,
        lawyer_id: lawyerId,
        status: 'cancelled',
      });

      mockQueries.cancelAppointment.mockResolvedValueOnce(appointment);
      mockQueries.getAppointmentById.mockResolvedValueOnce({
        ...appointment,
        client_first_name: 'Test',
        client_last_name: 'Client',
        lawyer_first_name: 'Test',
        lawyer_last_name: 'Lawyer',
      } as any);

      const result = await appointmentService.cancelAppointment(appointmentId);

      expect(result).toBeDefined();
      expect(result.status).toBe('cancelled');
    });

    it('should throw error if appointment not found', async () => {
      const appointmentId = uuidv4();
      mockQueries.cancelAppointment.mockResolvedValueOnce(null);

      await expect(
        appointmentService.cancelAppointment(appointmentId)
      ).rejects.toThrow('Appointment not found');
    });
  });

  describe('markReminderSent', () => {
    it('should mark reminder as sent', async () => {
      const appointmentId = uuidv4();
      mockQueries.markReminderSent.mockResolvedValueOnce(true);

      await appointmentService.markReminderSent(appointmentId);

      expect(mockQueries.markReminderSent).toHaveBeenCalledWith(appointmentId);
    });

    it('should throw error if appointment not found', async () => {
      const appointmentId = uuidv4();
      mockQueries.markReminderSent.mockResolvedValueOnce(false);

      await expect(
        appointmentService.markReminderSent(appointmentId)
      ).rejects.toThrow('Appointment not found');
    });
  });
});