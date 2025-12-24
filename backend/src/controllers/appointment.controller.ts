import { Request, Response } from 'express';
import * as appointmentService from '../services/appointment.service';
import type { CreateAppointmentDTO, UpdateAppointmentDTO, AppointmentFilters } from '../types/appointment.types';

/**
 * Créer un nouveau rendez-vous
 * POST /api/appointments
 */
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateAppointmentDTO = req.body;
    const appointment = await appointmentService.createAppointment(data);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer tous les rendez-vous avec filtres
 * GET /api/appointments
 */
export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: AppointmentFilters = {
      status: req.query.status as any,
      appointment_type: req.query.appointment_type as any,
      lawyer_id: req.query.lawyer_id as string,
      client_id: req.query.client_id as string,
      case_id: req.query.case_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const result = await appointmentService.getAllAppointments(filters);

    res.status(200).json({
      success: true,
      data: result.appointments,
      total: result.total
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer un rendez-vous par ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Mettre à jour un rendez-vous
 * PUT /api/appointments/:id
 */
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateAppointmentDTO = req.body;
    const appointment = await appointmentService.updateAppointment(id, data);

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Supprimer un rendez-vous
 * DELETE /api/appointments/:id
 */
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await appointmentService.deleteAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer les rendez-vous d'un avocat
 * GET /api/appointments/lawyer/:lawyerId
 */
export const getAppointmentsByLawyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const filters: AppointmentFilters = {
      status: req.query.status as any,
      appointment_type: req.query.appointment_type as any,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const appointments = await appointmentService.getAppointmentsByLawyer(lawyerId, filters);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching lawyer appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer les rendez-vous d'un client
 * GET /api/appointments/client/:clientId
 */
export const getAppointmentsByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const filters: AppointmentFilters = {
      status: req.query.status as any,
      appointment_type: req.query.appointment_type as any,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const appointments = await appointmentService.getAppointmentsByClient(clientId, filters);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer les rendez-vous d'un dossier
 * GET /api/appointments/case/:caseId
 */
export const getAppointmentsByCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId } = req.params;
    const appointments = await appointmentService.getAppointmentsByCase(caseId);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching case appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer les rendez-vous à venir
 * GET /api/appointments/upcoming
 */
export const getUpcomingAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.query.lawyer_id as string | undefined;
    const clientId = req.query.client_id as string | undefined;
    const appointments = await appointmentService.getUpcomingAppointments(lawyerId, clientId);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer les rendez-vous du jour
 * GET /api/appointments/today
 */
export const getTodayAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.query.lawyer_id as string | undefined;
    const clientId = req.query.client_id as string | undefined;
    const appointments = await appointmentService.getTodayAppointments(lawyerId, clientId);

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today appointments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Récupérer les statistiques des rendez-vous
 * GET /api/appointments/stats
 */
export const getAppointmentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const lawyerId = req.query.lawyer_id as string | undefined;
    const clientId = req.query.client_id as string | undefined;
    const stats = await appointmentService.getAppointmentStats(lawyerId, clientId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Annuler un rendez-vous
 * POST /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.cancelAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Confirmer un rendez-vous
 * POST /api/appointments/:id/confirm
 */
export const confirmAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.confirmAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Marquer un rendez-vous comme complété
 * POST /api/appointments/:id/complete
 */
export const completeAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.completeAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    if (error instanceof Error && error.message === 'Appointment not found') {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const appointmentController = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByLawyer,
  getAppointmentsByClient,
  getAppointmentsByCase,
  getUpcomingAppointments,
  getTodayAppointments,
  getAppointmentStats,
  cancelAppointment,
  confirmAppointment,
  completeAppointment
};
