import { pool } from '../config/database.config';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from './notification.service';
import { sendCustomEmail } from './email.service';


export interface AppointmentSuggestion {
  id: string;
  appointment_id: string | null;
  suggested_by_user_id: string;
  suggested_to_user_id: string;
  suggested_start_time: Date;
  suggested_end_time: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  notes?: string;
  created_at: Date;
  responded_at?: Date;
}

export interface CreateSuggestionInput {
  appointment_id?: string;
  suggested_by_user_id: string;
  suggested_to_user_id: string;
  suggested_start_time: string;
  suggested_end_time: string;
  notes?: string;
}

/**
 * Créer une proposition de créneau
 */
export const createSuggestion = async (data: CreateSuggestionInput): Promise<AppointmentSuggestion> => {
  const query = `
    INSERT INTO appointment_suggestions (
      id, appointment_id, suggested_by, suggested_to,
      suggested_start_date, suggested_end_date, status, message
    ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
    RETURNING *,
      suggested_by as suggested_by_user_id,
      suggested_to as suggested_to_user_id,
      suggested_start_date as suggested_start_time,
      suggested_end_date as suggested_end_time,
      message as notes
  `;

  const values = [
    uuidv4(),
    data.appointment_id || null,
    data.suggested_by_user_id,
    data.suggested_to_user_id,
    data.suggested_start_time,
    data.suggested_end_time,
    data.notes || null
  ];

  const result = await pool.query(query, values);
  const suggestion = result.rows[0];

  try {
    const userQuery = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE id = $1',
      [data.suggested_by_user_id]
    );
    const lawyerQuery = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE id = $1',
      [data.suggested_to_user_id]
    );

    if (userQuery.rows.length > 0 && lawyerQuery.rows.length > 0) {
      const client = userQuery.rows[0];
      const lawyer = lawyerQuery.rows[0];
      const clientName = `${client.first_name} ${client.last_name}`;

      const notificationService = new NotificationService();
      await notificationService.createNotification({
        user_id: data.suggested_to_user_id,
        notification_type: 'appointment_suggestion',
        title: 'Nouvelle proposition de créneau',
        message: `${clientName} propose un rendez-vous le ${new Date(data.suggested_start_time).toLocaleString('fr-FR')}`,
        data: {
          suggestion_id: suggestion.id,
          appointment_id: data.appointment_id,
          suggested_start_time: data.suggested_start_time,
          suggested_end_time: data.suggested_end_time
        }
      });

      const html = `
        <p>Bonjour Me ${lawyer.first_name},</p>
        <p><strong>${clientName}</strong> vous propose un nouveau créneau pour un rendez-vous :</p>
        <div style="background-color: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <p><strong>Date :</strong> ${new Date(data.suggested_start_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p><strong> Heure :</strong> ${new Date(data.suggested_start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(data.suggested_end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          ${data.notes ? `<p><strong>Note :</strong> ${data.notes}</p>` : ''}
        </div>
        <p>Connectez-vous à votre espace pour accepter, refuser ou proposer une alternative.</p>
        <p>Cordialement,<br/>L'équipe Gestion Juridique</p>
      `;

      await sendCustomEmail({
        to: lawyer.email,
        subject: `Nouvelle proposition de créneau de ${clientName}`,
        html
      });
    }
  } catch (error) {
    console.error('Erreur envoi notification suggestion:', error);
  }

  return suggestion;
};

/**
 * Récupérer les suggestions d'un utilisateur
 */
export const getUserSuggestions = async (userId: string, role: 'suggested_by' | 'suggested_to'): Promise<AppointmentSuggestion[]> => {
  const field = role === 'suggested_by' ? 'suggested_by' : 'suggested_to';

  const query = `
    SELECT s.*,
      s.suggested_by as suggested_by_user_id,
      s.suggested_to as suggested_to_user_id,
      s.suggested_start_date as suggested_start_time,
      s.suggested_end_date as suggested_end_time,
      s.message as notes,
      u1.first_name as suggested_by_first_name,
      u1.last_name as suggested_by_last_name,
      u2.first_name as suggested_to_first_name,
      u2.last_name as suggested_to_last_name,
      a.title as appointment_title
    FROM appointment_suggestions s
    LEFT JOIN users u1 ON s.suggested_by = u1.id
    LEFT JOIN users u2 ON s.suggested_to = u2.id
    LEFT JOIN appointments a ON s.appointment_id = a.id
    WHERE s.${field} = $1
    ORDER BY s.created_at DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * Accepter une suggestion
 */
export const acceptSuggestion = async (suggestionId: string, lawyerId: string): Promise<{ suggestion: AppointmentSuggestion; appointment?: any }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateQuery = `
      UPDATE appointment_suggestions
      SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND suggested_to = $2
      RETURNING *,
        suggested_by as suggested_by_user_id,
        suggested_to as suggested_to_user_id,
        suggested_start_date as suggested_start_time,
        suggested_end_date as suggested_end_time,
        message as notes
    `;
    const updateResult = await client.query(updateQuery, [suggestionId, lawyerId]);
    const suggestion = updateResult.rows[0];

    if (!suggestion) {
      throw new Error('Suggestion not found or unauthorized');
    }

    let appointment = null;
    if (suggestion.appointment_id) {
      const updateAptQuery = `
        UPDATE appointments
        SET start_date = $1, end_date = $2, status = 'pending', updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *,
          start_date as start_time,
          end_date as end_time
      `;
      const aptResult = await client.query(updateAptQuery, [
        suggestion.suggested_start_time,
        suggestion.suggested_end_time,
        suggestion.appointment_id
      ]);
      appointment = aptResult.rows[0];
    } else {
      const createAptQuery = `
        INSERT INTO appointments (
          lawyer_id, client_id, title, start_date, end_date, 
          appointment_type, status
        ) VALUES ($1, $2, $3, $4, $5, 'consultation', 'pending')
        RETURNING *,
          start_date as start_time,
          end_date as end_time
      `;
      const aptResult = await client.query(createAptQuery, [
        lawyerId,
        suggestion.suggested_by_user_id,
        'Rendez-vous proposé par le client',
        suggestion.suggested_start_time,
        suggestion.suggested_end_time
      ]);
      appointment = aptResult.rows[0];

      await client.query(
        'UPDATE appointment_suggestions SET appointment_id = $1 WHERE id = $2',
        [appointment.id, suggestionId]
      );
    }

    await client.query('COMMIT');

    try {
      const notificationService = new NotificationService();
      await notificationService.createNotification({
        user_id: suggestion.suggested_by_user_id,
        notification_type: 'suggestion_accepted',
        title: 'Créneau accepté',
        message: `Votre proposition de rendez-vous a été acceptée pour le ${new Date(suggestion.suggested_start_time).toLocaleString('fr-FR')}`,
        data: {
          suggestion_id: suggestionId,
          appointment_id: appointment?.id
        }
      });
    } catch (error) {
      console.error('Erreur notification acceptation:', error);
    }

    return { suggestion, appointment };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Refuser une suggestion
 */
export const rejectSuggestion = async (suggestionId: string, lawyerId: string, reason?: string): Promise<AppointmentSuggestion> => {
  const query = `
    UPDATE appointment_suggestions
    SET status = 'rejected', message = COALESCE($3, message), responded_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND suggested_to = $2
    RETURNING *,
      suggested_by as suggested_by_user_id,
      suggested_to as suggested_to_user_id,
      suggested_start_date as suggested_start_time,
      suggested_end_date as suggested_end_time,
      message as notes
  `;

  const result = await pool.query(query, [suggestionId, lawyerId, reason]);
  const suggestion = result.rows[0];

  if (!suggestion) {
    throw new Error('Suggestion not found or unauthorized');
  }

  try {
    const notificationService = new NotificationService();
    await notificationService.createNotification({
      user_id: suggestion.suggested_by_user_id,
      notification_type: 'suggestion_rejected',
      title: 'Créneau refusé',
      message: `Votre proposition de rendez-vous a été refusée${reason ? `: ${reason}` : ''}`,
      data: {
        suggestion_id: suggestionId,
        reason
      }
    });
  } catch (error) {
    console.error('Erreur notification refus:', error);
  }

  return suggestion;
};

/**
 * Contre-proposer un créneau
 */
export const counterSuggestion = async (
  originalSuggestionId: string,
  lawyerId: string,
  newStartTime: string,
  newEndTime: string,
  notes?: string
): Promise<AppointmentSuggestion> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE appointment_suggestions SET status = $1, responded_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['countered', originalSuggestionId]
    );

    const originalQuery = await client.query(
      'SELECT * FROM appointment_suggestions WHERE id = $1',
      [originalSuggestionId]
    );
    const original = originalQuery.rows[0];

    if (!original) {
      throw new Error('Original suggestion not found');
    }

    const createQuery = `
      INSERT INTO appointment_suggestions (
        id, appointment_id, suggested_by, suggested_to,
        suggested_start_date, suggested_end_date, status, message
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
      RETURNING *,
        suggested_by as suggested_by_user_id,
        suggested_to as suggested_to_user_id,
        suggested_start_date as suggested_start_time,
        suggested_end_date as suggested_end_time,
        message as notes
    `;

    const values = [
      uuidv4(),
      original.appointment_id,
      lawyerId,
      original.suggested_by,
      newStartTime,
      newEndTime,
      notes || 'Contre-proposition de l\'avocat'
    ];

    const result = await client.query(createQuery, values);
    const counterSuggestion = result.rows[0];

    await client.query('COMMIT');

    try {
      const notificationService = new NotificationService();
      await notificationService.createNotification({
        user_id: original.suggested_by_user_id,
        notification_type: 'suggestion_countered',
        title: 'Contre-proposition reçue',
        message: `L'avocat propose un autre créneau : ${new Date(newStartTime).toLocaleString('fr-FR')}`,
        data: {
          suggestion_id: counterSuggestion.id,
          original_suggestion_id: originalSuggestionId
        }
      });
    } catch (error) {
      console.error('Erreur notification contre-proposition:', error);
    }

    return counterSuggestion;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};