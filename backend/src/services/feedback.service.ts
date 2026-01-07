import * as feedbackQueries from '../database/queries/feedback.queries';
import { sendEmail } from '../utils/email.util';

export async function createFeedback(data: feedbackQueries.CreateFeedbackInput) {
  const feedback = await feedbackQueries.createFeedback(data);

  if (data.user_email) {
    await sendEmail({
      to: data.user_email,
      subject: 'Merci pour votre avis',
      html: `
        <h2>Merci pour votre retour !</h2>
        <p>Bonjour,</p>
        <p>Nous avons bien reçu votre avis avec une note de <strong>${data.rating}/10</strong>.</p>
        ${data.comment ? `<p><strong>Votre commentaire :</strong><br>${data.comment}</p>` : ''}
        <p>Votre opinion est précieuse et nous aide à améliorer nos services.</p>
        <p>Nous vous répondrons dans les plus brefs délais si nécessaire.</p>
        <p>Cordialement,<br>L'équipe de support</p>
      `
    }).catch(err => console.error('Erreur envoi email:', err));
  }

  return feedback;
}

export async function getAllFeedback(
  page: number = 1,
  limit: number = 20,
  status?: string,
  rating?: number,
  category?: string,
  userRole?: string
) {
  return await feedbackQueries.getAllFeedback(page, limit, status, rating, category, userRole);
}

export async function getFeedbackById(id: string) {
  return await feedbackQueries.getFeedbackById(id);
}

export async function getUserFeedback(userId: string) {
  return await feedbackQueries.getUserFeedback(userId);
}

export async function updateFeedbackStatus(id: string, status: string) {
  return await feedbackQueries.updateFeedbackStatus(id, status);
}

export async function replyToFeedback(id: string, adminId: string, response: string) {
  const feedback = await feedbackQueries.replyToFeedback(id, adminId, response);

  const fullFeedback = await feedbackQueries.getFeedbackById(id);

  if (fullFeedback && fullFeedback.user_email) {
    await sendEmail({
      to: fullFeedback.user_email,
      subject: 'Réponse à votre avis',
      html: `
        <h2>Réponse de l'administrateur</h2>
        <p>Bonjour ${fullFeedback.user_first_name || ''},</p>
        <p>Un administrateur a répondu à votre avis :</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Votre avis (${fullFeedback.rating}/10) :</strong></p>
          ${fullFeedback.comment ? `<p>${fullFeedback.comment}</p>` : '<p><em>Aucun commentaire</em></p>'}
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p><strong>Réponse de l'administrateur :</strong></p>
          <p>${response}</p>
        </div>

        <p>Merci de votre confiance !</p>
        <p>Cordialement,<br>L'équipe de support</p>
      `
    }).catch(err => console.error('Erreur envoi email:', err));
  }

  return feedback;
}

export async function getFeedbackStats() {
  return await feedbackQueries.getFeedbackStats();
}

