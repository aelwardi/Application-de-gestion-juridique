import { sendEmail, sendAppointmentNotification } from '../utils/email.util';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AppointmentEmailInput {
  email: string;
  firstName: string;
  appointmentDate: Date;
  lawyerName: string;
  appointmentType: string;
}

/**
 * Service pour envoyer un email personnalisé
 */
export const sendCustomEmail = async (data: SendEmailInput): Promise<boolean> => {
  return sendEmail(data);
};

/**
 * Service pour envoyer une notification de rendez-vous
 */
export const sendAppointmentEmail = async (data: AppointmentEmailInput): Promise<boolean> => {
  return sendAppointmentNotification(
    data.email,
    data.firstName,
    data.appointmentDate,
    data.lawyerName,
    data.appointmentType
  );
};