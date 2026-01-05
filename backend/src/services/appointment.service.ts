import * as appointmentQueries from '../database/queries/appointment.queries';
import type {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentFilters,
  Appointment,
  AppointmentWithDetails,
  AppointmentStats
} from '../types/appointment.types';

/**
 * Créer un nouveau rendez-vous
 */
export const createAppointment = async (data: CreateAppointmentDTO): Promise<Appointment> => {
  return await appointmentQueries.createAppointment(data);
};

/**
 * Récupérer tous les rendez-vous avec filtres
 */
export const getAllAppointments = async (filters: AppointmentFilters = {}): Promise<{ appointments: AppointmentWithDetails[], total: number }> => {
  return await appointmentQueries.getAllAppointments(filters);
};

/**
 * Récupérer un rendez-vous par ID
 */
export const getAppointmentById = async (id: string): Promise<AppointmentWithDetails> => {
  const appointment = await appointmentQueries.getAppointmentById(id);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  return appointment;
};

/**
 * Mettre à jour un rendez-vous
 */
export const updateAppointment = async (id: string, data: UpdateAppointmentDTO): Promise<Appointment> => {
  const appointment = await appointmentQueries.updateAppointment(id, data);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  return appointment;
};

/**
 * Supprimer un rendez-vous
 */
export const deleteAppointment = async (id: string): Promise<void> => {
  const deleted = await appointmentQueries.deleteAppointment(id);
  if (!deleted) {
    throw new Error('Appointment not found');
  }
};

/**
 * Récupérer les rendez-vous d'un avocat
 */
export const getAppointmentsByLawyer = async (lawyerId: string, filters: AppointmentFilters = {}): Promise<AppointmentWithDetails[]> => {
  return await appointmentQueries.getAppointmentsByLawyer(lawyerId, filters);
};

/**
 * Récupérer les rendez-vous d'un client
 */
export const getAppointmentsByClient = async (clientId: string, filters: AppointmentFilters = {}): Promise<AppointmentWithDetails[]> => {
  return await appointmentQueries.getAppointmentsByClient(clientId, filters);
};

/**
 * Récupérer les rendez-vous d'un dossier
 */
export const getAppointmentsByCase = async (caseId: string): Promise<AppointmentWithDetails[]> => {
  return await appointmentQueries.getAppointmentsByCase(caseId);
};

/**
 * Récupérer les rendez-vous à venir
 */
export const getUpcomingAppointments = async (lawyerId?: string, clientId?: string): Promise<AppointmentWithDetails[]> => {
  return await appointmentQueries.getUpcomingAppointments(lawyerId, clientId);
};

/**
 * Récupérer les rendez-vous du jour
 */
export const getTodayAppointments = async (lawyerId?: string, clientId?: string): Promise<AppointmentWithDetails[]> => {
  return await appointmentQueries.getTodayAppointments(lawyerId, clientId);
};

/**
 * Récupérer les statistiques des rendez-vous
 */
export const getAppointmentStats = async (lawyerId?: string, clientId?: string): Promise<AppointmentStats> => {
  return await appointmentQueries.getAppointmentStats(lawyerId, clientId);
};

/**
 * Marquer le rappel comme envoyé
 */
export const markReminderSent = async (id: string): Promise<void> => {
  const marked = await appointmentQueries.markReminderSent(id);
  if (!marked) {
    throw new Error('Appointment not found');
  }
};

/**
 * Annuler un rendez-vous
 */
export const cancelAppointment = async (id: string): Promise<Appointment> => {
  const appointment = await appointmentQueries.cancelAppointment(id);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  return appointment;
};

/**
 * Confirmer un rendez-vous
 */
export const confirmAppointment = async (id: string): Promise<Appointment> => {
  const appointment = await appointmentQueries.confirmAppointment(id);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  return appointment;
};

/**
 * Marquer un rendez-vous comme complété
 */
export const completeAppointment = async (id: string): Promise<Appointment> => {
  const appointment = await appointmentQueries.completeAppointment(id);
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  return appointment;
};
