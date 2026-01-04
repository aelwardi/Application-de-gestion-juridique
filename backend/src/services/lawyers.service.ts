import * as lawyersQueries from '../database/queries/lawyers.queries';
import { sendEmail } from '../utils/email.util';

/**
 * Get all lawyers
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
 * Get lawyer details
 */
export const getLawyerDetails = async (lawyerId: string) => {
  const lawyer = await lawyersQueries.getLawyerById(lawyerId);
  if (!lawyer) {
    throw new Error('Lawyer not found');
  }
  return lawyer;
};

/**
 * Verify lawyer account
 */
export const verifyLawyer = async (lawyerId: string, adminId: string) => {
  const lawyer = await lawyersQueries.getLawyerById(lawyerId);
  if (!lawyer) {
    throw new Error('Lawyer not found');
  }

  await lawyersQueries.verifyLawyer(lawyerId, adminId);

  sendEmail({
    to: lawyer.email!,
    subject: 'Votre compte avocat a été vérifié',
    html: `
      <h1>Compte Vérifié</h1>
      <p>Bonjour ${lawyer.first_name} ${lawyer.last_name},</p>
      <p>Votre compte avocat a été vérifié par un administrateur.</p>
      <p>Vous avez maintenant accès à toutes les fonctionnalités de la plateforme et votre profil est visible par les clients.</p>
      <p><strong>Vos informations :</strong></p>
      <ul>
        <li>Numéro au barreau : ${lawyer.bar_number}</li>
        <li>Spécialités : ${lawyer.specialties.join(', ')}</li>
      </ul>
      <p>Cordialement,<br>L'équipe de Gestion Juridique</p>
    `,
  }).catch(err => console.error('Failed to send lawyer verification email:', err));

  return { success: true };
};

/**
 * Get case statistics (non-confidential stats only)
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
 * Approve review
 */
export const approveReview = async (reviewId: string, adminId: string) => {
  await lawyersQueries.moderateReview(reviewId, true, adminId);
  return { success: true, message: 'Review approved' };
};

/**
 * Reject review
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
 * Note: Les statistiques des dossiers sont agrégées et anonymisées.
 * L'accès aux dossiers individuels est strictement limité aux clients et avocats concernés.
 */
export const getComprehensiveStats = async () => {
  const [caseStats, lawyerStats, appointmentStats] = await Promise.all([
    getCaseStats(),
    getLawyerStats(),
    getAppointmentStats(),
  ]);

  return {
    cases: caseStats, // Statistiques agrégées uniquement
    lawyers: lawyerStats,
    appointments: appointmentStats,
  };
};