import { Request, Response } from 'express';
import * as appointmentController from '../../../src/controllers/appointment.controller';
import * as appointmentService from '../../../src/services/appointment.service';
import * as adminQueries from '../../../src/database/queries/admin.queries';
import { CreateAppointmentDTO, UpdateAppointmentDTO } from '../../../src/types/appointment.types';

jest.mock('../../../src/services/appointment.service');
jest.mock('../../../src/database/queries/admin.queries');

describe('AppointmentController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockAppointment = {
    id: 'appointment-123',
    client_id: 'client-123',
    lawyer_id: 'lawyer-123',
    start_time: new Date('2024-06-15T10:00:00'),
    end_time: new Date('2024-06-15T11:00:00'),
    appointment_type: 'consultation',
    status: 'scheduled',
    location: 'Cabinet Paris',
    notes: 'Première consultation',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAppointmentWithDetails = {
    ...mockAppointment,
    client_first_name: 'Jean',
    client_last_name: 'Dupont',
    client_email: 'jean@test.com',
    lawyer_first_name: 'Marie',
    lawyer_last_name: 'Martin',
    lawyer_email: 'marie@test.com',
  };

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      ip: '127.0.0.1',
      socket: {} as any,
      get: jest.fn(),
    } as Partial<Request>;

    (mockRequest as any).user = { userId: 'user-123', role: 'client' };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

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

      mockRequest.body = appointmentData;
      (appointmentService.createAppointment as jest.Mock).mockResolvedValue(mockAppointment);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      await appointmentController.createAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.createAppointment).toHaveBeenCalledWith(appointmentData);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Appointment created successfully',
        data: mockAppointment,
      });
    });

    it('devrait créer un log d\'activité après création', async () => {
      const appointmentData: CreateAppointmentDTO = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation',
        start_time: new Date('2024-06-15T10:00:00'),
        end_time: new Date('2024-06-15T11:00:00'),
        appointment_type: 'consultation',
        status: 'scheduled',
      };

      mockRequest.body = appointmentData;
      (appointmentService.createAppointment as jest.Mock).mockResolvedValue(mockAppointment);
      (adminQueries.createActivityLog as jest.Mock).mockResolvedValue(undefined);

      await appointmentController.createAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(adminQueries.createActivityLog).toHaveBeenCalledWith(
        'user-123',
        'APPOINTMENT_CREATED',
        'appointment',
        mockAppointment.id,
        '127.0.0.1',
        null,
        expect.objectContaining({
          appointment_type: appointmentData.appointment_type,
          lawyer_id: appointmentData.lawyer_id,
          client_id: appointmentData.client_id,
        })
      );
    });

    it('devrait continuer si le log d\'activité échoue', async () => {
      const appointmentData: CreateAppointmentDTO = {
        client_id: 'client-123',
        lawyer_id: 'lawyer-123',
        title: 'Consultation',
        start_time: new Date('2024-06-15T10:00:00'),
        end_time: new Date('2024-06-15T11:00:00'),
        appointment_type: 'consultation',
        status: 'scheduled',
      };

      mockRequest.body = appointmentData;
      (appointmentService.createAppointment as jest.Mock).mockResolvedValue(mockAppointment);
      (adminQueries.createActivityLog as jest.Mock).mockRejectedValue(
        new Error('Log error')
      );

      await appointmentController.createAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      mockRequest.body = {};
      (appointmentService.createAppointment as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await appointmentController.createAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create appointment',
        error: 'Database error',
      });
    });
  });

  describe('getAllAppointments', () => {
    it('devrait retourner tous les rendez-vous', async () => {
      (appointmentService.getAllAppointments as jest.Mock).mockResolvedValue({
        appointments: [mockAppointmentWithDetails],
        total: 1,
      });

      await appointmentController.getAllAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.getAllAppointments).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [mockAppointmentWithDetails],
        total: 1,
      });
    });

    it('devrait filtrer par client_id', async () => {
      mockRequest.query = { client_id: 'client-123' };
      (appointmentService.getAllAppointments as jest.Mock).mockResolvedValue({
        appointments: [mockAppointmentWithDetails],
        total: 1,
      });

      await appointmentController.getAllAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.getAllAppointments).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: 'client-123' })
      );
    });

    it('devrait filtrer par lawyer_id', async () => {
      mockRequest.query = { lawyer_id: 'lawyer-123' };
      (appointmentService.getAllAppointments as jest.Mock).mockResolvedValue({
        appointments: [mockAppointmentWithDetails],
        total: 1,
      });

      await appointmentController.getAllAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.getAllAppointments).toHaveBeenCalledWith(
        expect.objectContaining({ lawyer_id: 'lawyer-123' })
      );
    });

    it('devrait filtrer par status', async () => {
      mockRequest.query = { status: 'scheduled' };
      (appointmentService.getAllAppointments as jest.Mock).mockResolvedValue({
        appointments: [mockAppointmentWithDetails],
        total: 1,
      });

      await appointmentController.getAllAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.getAllAppointments).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'scheduled' })
      );
    });

    it('devrait filtrer par dates', async () => {
      mockRequest.query = {
        start_date: '2024-06-01',
        end_date: '2024-06-30',
      };
      (appointmentService.getAllAppointments as jest.Mock).mockResolvedValue({
        appointments: [mockAppointmentWithDetails],
        total: 1,
      });

      await appointmentController.getAllAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.getAllAppointments).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: '2024-06-01',
          end_date: '2024-06-30',
        })
      );
    });

    it('devrait gérer la pagination', async () => {
      mockRequest.query = { limit: '10', offset: '20' };
      (appointmentService.getAllAppointments as jest.Mock).mockResolvedValue({
        appointments: [],
        total: 0,
      });

      await appointmentController.getAllAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.getAllAppointments).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 20,
        })
      );
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      (appointmentService.getAllAppointments as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await appointmentController.getAllAppointments(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch appointments',
        error: 'Database error',
      });
    });
  });

  describe('getAppointmentById', () => {
    it('devrait retourner un rendez-vous par ID', async () => {
      mockRequest.params = { id: 'appointment-123' };
      (appointmentService.getAppointmentById as jest.Mock).mockResolvedValue(
        mockAppointmentWithDetails
      );

      await appointmentController.getAppointmentById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.getAppointmentById).toHaveBeenCalledWith('appointment-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockAppointmentWithDetails,
      });
    });

    it('devrait retourner 404 si le rendez-vous n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      (appointmentService.getAppointmentById as jest.Mock).mockRejectedValue(
        new Error('Appointment not found')
      );

      await appointmentController.getAppointmentById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Appointment not found',
      });
    });

    it('devrait retourner 500 en cas d\'autre erreur', async () => {
      mockRequest.params = { id: 'appointment-123' };
      (appointmentService.getAppointmentById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await appointmentController.getAppointmentById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch appointment',
        error: 'Database error',
      });
    });
  });

  describe('updateAppointment', () => {
    it('devrait mettre à jour un rendez-vous', async () => {
      const updateData: UpdateAppointmentDTO = {
        status: 'completed',
        notes: 'Consultation terminée',
      };

      mockRequest.params = { id: 'appointment-123' };
      mockRequest.body = updateData;
      (appointmentService.updateAppointment as jest.Mock).mockResolvedValue({
        ...mockAppointment,
        ...updateData,
      });

      await appointmentController.updateAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.updateAppointment).toHaveBeenCalledWith(
        'appointment-123',
        updateData
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 404 si le rendez-vous n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { status: 'completed' };
      (appointmentService.updateAppointment as jest.Mock).mockRejectedValue(
        new Error('Appointment not found')
      );

      await appointmentController.updateAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 en cas d\'autre erreur', async () => {
      mockRequest.params = { id: 'appointment-123' };
      mockRequest.body = {};
      (appointmentService.updateAppointment as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await appointmentController.updateAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteAppointment', () => {
    it('devrait supprimer un rendez-vous', async () => {
      mockRequest.params = { id: 'appointment-123' };
      (appointmentService.deleteAppointment as jest.Mock).mockResolvedValue(true);

      await appointmentController.deleteAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(appointmentService.deleteAppointment).toHaveBeenCalledWith('appointment-123');
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 404 si le rendez-vous n\'existe pas', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      (appointmentService.deleteAppointment as jest.Mock).mockRejectedValue(
        new Error('Appointment not found')
      );

      await appointmentController.deleteAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 en cas d\'autre erreur', async () => {
      mockRequest.params = { id: 'appointment-123' };
      (appointmentService.deleteAppointment as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await appointmentController.deleteAppointment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});

