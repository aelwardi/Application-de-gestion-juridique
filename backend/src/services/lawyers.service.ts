import * as lawyersQueries from '../database/queries/lawyers.queries';
import { sendEmail } from '../utils/email.util';

/**
 * Get all lawyers with filters
 */
export const getAllLawyers = async (
  page: number,
  limit: number,
  verified?: boolean,
  city?: string,
  specialty?: string
) => {
  return await lawyersQueries.getAllLawyers(page, limit, verified, city, specialty);
};

/**
 * Get lawyer details by ID
 */
export const getLawyerDetails = async (lawyerId: string) => {
  const lawyer = await lawyersQueries.getLawyerById(lawyerId);
  if (!lawyer) {
    throw new Error('Lawyer not found');
  }
  return lawyer;
};

/**
 * Verify a lawyer (admin only)
 */
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

/**
 * Get case statistics
 */
export const getCaseStats = async () => {
  return await lawyersQueries.getCaseStats();
};

/**
 * Get lawyer statistics
 */
export const getLawyerStats = async () => {
  return await lawyersQueries.getLawyerStats();
};

/**
 * Get appointment statistics
 */
export const getAppointmentStats = async () => {
  return await lawyersQueries.getAppointmentStats();
};

/**
 * Get pending reviews for moderation
 */
export const getPendingReviews = async (page: number, limit: number) => {
  return await lawyersQueries.getPendingReviews(page, limit);
};

/**
 * Approve a review
 */
export const approveReview = async (reviewId: string, adminId: string) => {
  await lawyersQueries.moderateReview(reviewId, true, adminId);
  return { success: true, message: 'Review approved' };
};

/**
 * Reject a review
 */
export const rejectReview = async (reviewId: string, adminId: string) => {
  await lawyersQueries.moderateReview(reviewId, false, adminId);
  return { success: true, message: 'Review rejected' };
};

/**
 * Get specialties
 */
export const getSpecialties = async () => {
  return await lawyersQueries.getSpecialties();
};

/**
 * Get comprehensive dashboard stats
 */
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