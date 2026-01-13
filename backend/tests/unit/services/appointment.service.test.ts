import * as appointmentService from '../../../src/services/appointment.service';
import * as appointmentQueries from '../../../src/database/queries/appointment.queries';
import { NotificationService } from '../../../src/services/notification.service';
import * as emailService from '../../../src/services/email.service';
import { pool } from '../../../src/config/database.config';
import {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentFilters,
  Appointment,
  AppointmentWithDetails,
} from '../../../src/types/appointment.types';

jest.mock('../../../src/database/queries/appointment.queries');
jest.mock('../../../src/services/email.service');
jest.mock('../../../src/config/database.config');

jest.mock('../../../src/services/notification.service', () => {
  const mockCreateNotification = jest.fn().mockResolvedValue({});
  return {
    NotificationService: jest.fn().mockImplementation(() => ({
      createNotification: mockCreateNotification,
    })),
    mockCreateNotification,
  };
});

const { mockCreateNotification: createNotificationMock } = jest.requireMock('../../../src/services/notification.service');

describe('AppointmentService', () => {
  const mockAppointment: Appointment = {
    id: 'appointment-123',
    case_id: null,
    client_id: 'client-123',
    lawyer_id: 'lawyer-123',
    title: 'Consultation',
    description: 'Première consultation',
    start_time: new Date('2024-06-15T10:00:00'),
    end_time: new Date('2024-06-15T11:00:00'),
    appointment_type: 'consultation',
    status: 'scheduled',
    location: 'Cabinet Paris',
    location_type: 'office',
    location_address: '123 Rue de Paris',
    location_latitude: null,
    location_longitude: null,
    meeting_url: null,
    reminder_sent: false,
    notes: 'Première consultation',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAppointmentWithDetails: AppointmentWithDetails = {
    ...mockAppointment,
    case_number: null,
    case_title: null,
    client_first_name: 'Jean',
    client_last_name: 'Dupont',
    client_email: 'jean@test.com',
    lawyer_first_name: 'Marie',
    lawyer_last_name: 'Martin',
    lawyer_email: 'marie@test.com',
  };

  const mockClient = {
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean@test.com',
  };

  const mockLawyer = {
    first_name: 'Marie',
    last_name: 'Martin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('devrait créer un rendez-vous avec succès', async () => {
      const appointmentData: CreateAppointmentDTO = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation',
        start_time: new Date('2024-06-15T10:00:00'),
        end_time: new Date('2024-06-15T11:00:00'),
        appointment_type: 'consultation',
        status: 'scheduled',
      };

      (appointmentQueries.createAppointment as jest.Mock).mockResolvedValue(mockAppointment);
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [mockLawyer] });

      const mockNotificationService = NotificationService as jest.MockedClass<typeof NotificationService>;
      mockNotificationService.prototype.createNotification = jest.fn().mockResolvedValue({});

      (emailService.sendAppointmentEmail as jest.Mock).mockResolvedValue(true);

      const result = await appointmentService.createAppointment(appointmentData);

      expect(result).toEqual(mockAppointment);
      expect(appointmentQueries.createAppointment).toHaveBeenCalledWith(appointmentData);
    });

    it('devrait envoyer une notification au client', async () => {
      const appointmentData: CreateAppointmentDTO = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation',
        start_time: new Date('2024-06-15T10:00:00'),
        end_time: new Date('2024-06-15T11:00:00'),
        appointment_type: 'consultation',
        status: 'scheduled',
      };

      (appointmentQueries.createAppointment as jest.Mock).mockResolvedValue(mockAppointment);
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [mockLawyer] });

      await appointmentService.createAppointment(appointmentData);


      expect(createNotificationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'client-123',
          notification_type: 'appointment_created',
          title: 'Nouveau rendez-vous',
        })
      );
    });

    it('devrait envoyer un email au client', async () => {
      const appointmentData: CreateAppointmentDTO = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation',
        start_time: new Date('2024-06-15T10:00:00'),
        end_time: new Date('2024-06-15T11:00:00'),
        appointment_type: 'consultation',
        status: 'scheduled',
      };

      (appointmentQueries.createAppointment as jest.Mock).mockResolvedValue(mockAppointment);
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [mockLawyer] });

      const mockNotificationService = NotificationService as jest.MockedClass<typeof NotificationService>;
      mockNotificationService.prototype.createNotification = jest.fn().mockResolvedValue({});
      (emailService.sendAppointmentEmail as jest.Mock).mockResolvedValue(true);

      await appointmentService.createAppointment(appointmentData);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(emailService.sendAppointmentEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'jean@test.com',
          firstName: 'Jean',
          lawyerName: 'Marie Martin',
        })
      );
    });

    it('devrait continuer si les notifications échouent', async () => {
      const appointmentData: CreateAppointmentDTO = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation',
        start_time: new Date('2024-06-15T10:00:00'),
        end_time: new Date('2024-06-15T11:00:00'),
        appointment_type: 'consultation',
        status: 'scheduled',
      };

      (appointmentQueries.createAppointment as jest.Mock).mockResolvedValue(mockAppointment);
      (pool.query as jest.Mock).mockRejectedValue(new Error('Query error'));

      const result = await appointmentService.createAppointment(appointmentData);

      expect(result).toEqual(mockAppointment);
    });
  });

  describe('getAllAppointments', () => {
    it('devrait retourner tous les rendez-vous', async () => {
      const mockResponse = {
        appointments: [mockAppointmentWithDetails],
        total: 1,
      };

      (appointmentQueries.getAllAppointments as jest.Mock).mockResolvedValue(mockResponse);

      const result = await appointmentService.getAllAppointments();

      expect(result).toEqual(mockResponse);
      expect(appointmentQueries.getAllAppointments).toHaveBeenCalledWith({});
    });

    it('devrait filtrer par client_id', async () => {
      const filters: AppointmentFilters = { client_id: 'client-123' };
      const mockResponse = {
        appointments: [mockAppointmentWithDetails],
        total: 1,
      };

      (appointmentQueries.getAllAppointments as jest.Mock).mockResolvedValue(mockResponse);

      await appointmentService.getAllAppointments(filters);

      expect(appointmentQueries.getAllAppointments).toHaveBeenCalledWith(filters);
    });

    it('devrait filtrer par lawyer_id', async () => {
      const filters: AppointmentFilters = { lawyer_id: 'lawyer-123' };
      const mockResponse = {
        appointments: [mockAppointmentWithDetails],
        total: 1,
      };

      (appointmentQueries.getAllAppointments as jest.Mock).mockResolvedValue(mockResponse);

      await appointmentService.getAllAppointments(filters);

      expect(appointmentQueries.getAllAppointments).toHaveBeenCalledWith(filters);
    });

    it('devrait filtrer par status', async () => {
      const filters: AppointmentFilters = { status: 'scheduled' };
      const mockResponse = {
        appointments: [mockAppointmentWithDetails],
        total: 1,
      };

      (appointmentQueries.getAllAppointments as jest.Mock).mockResolvedValue(mockResponse);

      await appointmentService.getAllAppointments(filters);

      expect(appointmentQueries.getAllAppointments).toHaveBeenCalledWith(filters);
    });

    it('devrait retourner un tableau vide si aucun rendez-vous', async () => {
      (appointmentQueries.getAllAppointments as jest.Mock).mockResolvedValue({
        appointments: [],
        total: 0,
      });

      const result = await appointmentService.getAllAppointments();

      expect(result.appointments).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getAppointmentById', () => {
    it('devrait retourner un rendez-vous par ID', async () => {
      (appointmentQueries.getAppointmentById as jest.Mock).mockResolvedValue(mockAppointmentWithDetails);

      const result = await appointmentService.getAppointmentById('appointment-123');

      expect(result).toEqual(mockAppointmentWithDetails);
      expect(appointmentQueries.getAppointmentById).toHaveBeenCalledWith('appointment-123');
    });

    it('devrait lever une erreur si le rendez-vous n\'existe pas', async () => {
      (appointmentQueries.getAppointmentById as jest.Mock).mockResolvedValue(null);

      await expect(appointmentService.getAppointmentById('non-existent-id')).rejects.toThrow('Appointment not found');
    });

    it('devrait gérer les erreurs de base de données', async () => {
      (appointmentQueries.getAppointmentById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(appointmentService.getAppointmentById('appointment-123')).rejects.toThrow('Database error');
    });
  });

  describe('updateAppointment', () => {
    it('devrait mettre à jour un rendez-vous', async () => {
      const updateData: UpdateAppointmentDTO = {
        status: 'completed',
        notes: 'Consultation terminée',
      };

      (appointmentQueries.updateAppointment as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        ...updateData,
      });

      const result = await appointmentService.updateAppointment('appointment-123', updateData);

      expect(result.status).toBe('completed');
      expect(result.notes).toBe('Consultation terminée');
      expect(appointmentQueries.updateAppointment).toHaveBeenCalledWith('appointment-123', updateData);
    });

    it('devrait lever une erreur si le rendez-vous n\'existe pas', async () => {
      (appointmentQueries.updateAppointment as jest.Mock).mockResolvedValue(null);

      await expect(
        appointmentService.updateAppointment('non-existent-id', { status: 'completed' })
      ).rejects.toThrow('Appointment not found');
    });

    it('devrait gérer les erreurs', async () => {
      (appointmentQueries.updateAppointment as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        appointmentService.updateAppointment('appointment-123', { status: 'completed' })
      ).rejects.toThrow('Database error');
    });
  });
});
