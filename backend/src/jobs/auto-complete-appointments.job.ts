import { pool } from '../config/database.config';

/**
 * Marquer automatiquement les rendez-vous terminés
 */
export const autoCompleteAppointments = async (): Promise<number> => {
  const query = `
    UPDATE appointments
    SET status = 'completed', updated_at = CURRENT_TIMESTAMP
    WHERE status IN ('pending', 'confirmed')
    AND end_date < NOW()
    RETURNING id
  `;

  try {
    const result = await pool.query(query);
    const count = result.rowCount || 0;

    return count;
  } catch (error) {
    console.error('Erreur lors du marquage automatique des rendez-vous:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques des rendez-vous à compléter automatiquement
 */
export const getAppointmentsToComplete = async (): Promise<any[]> => {
  const query = `
    SELECT 
      a.id,
      a.title,
      a.end_date as end_time,
      a.status,
      c.first_name as client_first_name,
      c.last_name as client_last_name,
      l.first_name as lawyer_first_name,
      l.last_name as lawyer_last_name
    FROM appointments a
    LEFT JOIN users c ON a.client_id = c.id
    LEFT JOIN users l ON a.lawyer_id = l.id
    WHERE a.status IN ('pending', 'confirmed')
    AND a.end_date < NOW()
    ORDER BY a.end_date ASC
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous à compléter:', error);
    throw error;
  }
};