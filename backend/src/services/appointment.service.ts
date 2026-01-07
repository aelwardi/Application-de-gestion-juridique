import * as appointmentQueries from '../database/queries/appointment.queries';
import type {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentFilters,
  Appointment,
  AppointmentWithDetails,
  AppointmentStats
} from '../types/appointment.types';
import { NotificationService } from './notification.service';
import { sendAppointmentEmail, sendCustomEmail } from './email.service';
import { pool } from '../config/database.config';

const notificationService = new NotificationService();

/**
 * Créer un nouveau rendez-vous avec notifications
 */
export const createAppointment = async (data: CreateAppointmentDTO): Promise<Appointment> => {
  const appointment = await appointmentQueries.createAppointment(data);

  try {
    const clientQuery = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE id = $1',
      [data.client_id]
    );

    const lawyerQuery = await pool.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [data.lawyer_id]
    );

    if (clientQuery.rows.length > 0 && lawyerQuery.rows.length > 0) {
      const client = clientQuery.rows[0];
      const lawyer = lawyerQuery.rows[0];
      const lawyerName = `${lawyer.first_name} ${lawyer.last_name}`;

      await notificationService.createNotification({
        user_id: data.client_id,
        notification_type: 'appointment_created',
        title: 'Nouveau rendez-vous',
        message: `Un rendez-vous a été programmé avec ${lawyerName} le ${new Date(data.start_time).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        data: {
          appointment_id: appointment.id,
          lawyer_id: data.lawyer_id,
          lawyer_name: lawyerName,
          start_time: data.start_time,
          appointment_type: data.appointment_type
        }
      });

      await sendAppointmentEmail({
        email: client.email,
        firstName: client.first_name,
        appointmentDate: new Date(data.start_time),
        lawyerName: lawyerName,
        appointmentType: data.appointment_type
      });

    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }

  return appointment;
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
export const cancelAppointment = async (id: string, suggestion?: { start_time?: string; end_time?: string }): Promise<Appointment> => {
  const updated = await appointmentQueries.cancelAppointment(id);
  if (!updated) {
    throw new Error('Appointment not found');
  }

  try {
    const appointment = await getAppointmentById(id);
    if (appointment && appointment.lawyer_id) {
      const clientName = `${appointment.client_first_name || ''} ${appointment.client_last_name || ''}`.trim();

      await notificationService.createNotification({
        user_id: appointment.lawyer_id,
        notification_type: 'appointment_cancelled',
        title: 'Rendez-vous annulé',
        message: `${clientName} a annulé le rendez-vous prévu le ${new Date(appointment.start_time).toLocaleString('fr-FR')}`,
        data: {
          appointment_id: id,
          client_id: appointment.client_id,
          suggestion: suggestion || null
        }
      });

      let suggestionHtml = '';
      if (suggestion && suggestion.start_time && suggestion.end_time) {
        try {
          suggestionHtml = `<p>Le client propose un créneau alternatif : <strong>${new Date(suggestion.start_time).toLocaleString('fr-FR')}</strong> - <strong>${new Date(suggestion.end_time).toLocaleString('fr-FR')}</strong></p>`;
        } catch (e) {
          suggestionHtml = '';
        }
      }

      const html = `
        <p>Bonjour ${appointment.lawyer_first_name || ''},</p>
        <p>Le client <strong>${clientName}</strong> a annulé le rendez-vous prévu le <strong>${new Date(appointment.start_time).toLocaleString('fr-FR')}</strong>.</p>
        ${suggestionHtml}
        <p>Consultez votre espace pour gérer cette annulation.</p>
        <p>Cordialement,<br/>L'équipe Gestion Juridique</p>
      `;

      if (appointment.lawyer_email) {
        await sendCustomEmail({
          to: appointment.lawyer_email,
          subject: `Rendez-vous annulé par ${clientName}`,
          html
        });
      }
    }
  } catch (notifError) {
    console.error('Erreur lors de la notification après annulation:', notifError);
  }

  return updated;
};

/**
 * Confirmer un rendez-vous
 */
export const confirmAppointment = async (id: string, suggestion?: { start_time?: string; end_time?: string }): Promise<Appointment> => {
  const updated = await appointmentQueries.confirmAppointment(id);
  if (!updated) {
    throw new Error('Appointment not found');
  }

  try {
    const appointment = await getAppointmentById(id);
    if (appointment && appointment.lawyer_id) {
      const clientName = `${appointment.client_first_name || ''} ${appointment.client_last_name || ''}`.trim();

      await notificationService.createNotification({
        user_id: appointment.lawyer_id,
        notification_type: 'appointment_confirmed',
        title: 'Rendez-vous confirmé',
        message: `${clientName} a confirmé le rendez-vous prévu le ${new Date(appointment.start_time).toLocaleString('fr-FR')}`,
        data: {
          appointment_id: id,
          client_id: appointment.client_id,
          suggestion: suggestion || null
        }
      });

      let suggestionHtml = '';
      if (suggestion && suggestion.start_time && suggestion.end_time) {
        try {
          suggestionHtml = `<p>Le client propose un autre créneau : <strong>${new Date(suggestion.start_time).toLocaleString('fr-FR')}</strong> - <strong>${new Date(suggestion.end_time).toLocaleString('fr-FR')}</strong></p>`;
        } catch (e) {
          suggestionHtml = '';
        }
      }

      const html = `
        <p>Bonjour ${appointment.lawyer_first_name || ''},</p>
        <p>Le client <strong>${clientName}</strong> a confirmé le rendez-vous prévu le <strong>${new Date(appointment.start_time).toLocaleString('fr-FR')}</strong>.</p>
        ${suggestionHtml}
        <p>Consultez votre espace pour plus de détails.</p>
        <p>Cordialement,<br/>L'équipe Gestion Juridique</p>
      `;

      if (appointment.lawyer_email) {
        await sendCustomEmail({
          to: appointment.lawyer_email,
          subject: `Rendez-vous confirmé par ${clientName}`,
          html
        });
      }
    }
  } catch (notifError) {
    console.error('Erreur lors de la notification après confirmation:', notifError);
  }

  return updated;
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