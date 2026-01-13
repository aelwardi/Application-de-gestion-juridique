import * as lawyersQueries from '../database/queries/lawyers.queries';
import { sendEmail } from '../utils/email.util';
import { pool } from '../config/database.config';

export const getAllLawyers = async (
  page: number,
  limit: number,
  verified?: boolean,
  city?: string,
  specialty?: string
) => {
  return await lawyersQueries.getAllLawyers(page, limit, verified, city, specialty);
};

export const getLawyerDetails = async (lawyerId: string) => {
  const lawyer = await lawyersQueries.getLawyerById(lawyerId);
  if (!lawyer) {
    throw new Error('Lawyer not found');
  }
  return lawyer;
};

export const verifyLawyer = async (lawyerId: string, adminId: string) => {
  const lawyer = await lawyersQueries.getLawyerById(lawyerId);
  if (!lawyer) {
    throw new Error('Lawyer not found');
  }

  await lawyersQueries.verifyLawyer(lawyerId, adminId);

  sendEmail({
    to: lawyer.email,
    subject: 'Votre compte avocat a été vérifié',
    html: `
      <h1>Compte Vérifié</h1>
      <p>Bonjour ${lawyer.first_name} ${lawyer.last_name},</p>
      <p>Votre compte avocat a été vérifié par un administrateur.</p>
      <p>Vous avez maintenant accès à toutes les fonctionnalités de la plateforme.</p>
      <p>Cordialement,<br>L'équipe de Gestion Juridique</p>
    `,
  }).catch(err => console.error('Failed to send lawyer verification email:', err));

  return { success: true };
};

export const getCaseStats = async () => {
  return await lawyersQueries.getCaseStats();
};

export const getLawyerStats = async () => {
  return await lawyersQueries.getLawyerStats();
};

export const getAppointmentStats = async () => {
  return await lawyersQueries.getAppointmentStats();
};

export const getPendingReviews = async (page: number, limit: number) => {
  return await lawyersQueries.getPendingReviews(page, limit);
};

export const approveReview = async (reviewId: string, adminId: string) => {
  await lawyersQueries.moderateReview(reviewId, true, adminId);
  return { success: true, message: 'Review approved' };
};

export const rejectReview = async (reviewId: string, adminId: string) => {
  await lawyersQueries.moderateReview(reviewId, false, adminId);
  return { success: true, message: 'Review rejected' };
};

export const getSpecialties = async () => {
  return await lawyersQueries.getSpecialties();
};

export const getComprehensiveStats = async () => {
  const [caseStats, lawyerStats, appointmentStats] = await Promise.all([
    getCaseStats(),
    getLawyerStats(),
    getAppointmentStats(),
  ]);

  return {
    cases: caseStats,
    lawyers: lawyerStats,
    appointments: appointmentStats,
  };
};

/**
 * Get lawyer availability slots
 */
export const getLawyerAvailability = async (lawyerId: string) => {
  const result = await pool.query(
    `SELECT * FROM lawyer_availability 
     WHERE lawyer_id = $1 
     ORDER BY day_of_week, start_time`,
    [lawyerId]
  );
  return result.rows;
};

/**
 * Create availability slot for lawyer
 */
export const createAvailability = async (
  lawyerId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
) => {
  const result = await pool.query(
    `INSERT INTO lawyer_availability (id, lawyer_id, day_of_week, start_time, end_time)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)
     RETURNING *`,
    [lawyerId, dayOfWeek, startTime, endTime]
  );
  return result.rows[0];
};

/**
 * Get lawyer reviews
 */
export const getLawyerReviews = async (lawyerId: string, page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT r.*, u.first_name, u.last_name 
     FROM reviews r
     JOIN users u ON r.client_id = u.id
     WHERE r.lawyer_id = $1 AND r.status = 'approved'
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [lawyerId, limit, offset]
  );
  return result.rows;
};

/**
 * Get lawyer cases
 */
export const getLawyerCases = async (lawyerId: string, status?: string) => {
  let query = `
    SELECT c.*, u.first_name, u.last_name, u.email
    FROM cases c
    JOIN users u ON c.client_id = u.id
    WHERE c.lawyer_id = $1
  `;

  const params: any[] = [lawyerId];

  if (status) {
    query += ` AND c.status = $2`;
    params.push(status);
  }

  query += ` ORDER BY c.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};