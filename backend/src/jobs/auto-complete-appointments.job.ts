import { pool } from '../config/database.config';

/**
 * Marquer automatiquement les rendez-vous terminés
 * Vérifie tous les rendez-vous dont la date de fin est dépassée
 * et les marque comme 'completed'
 */
export const autoCompleteAppointments = async (): Promise<number> => {
  const query = `
    UPDATE appointments
    SET status = 'completed', updated_at = CURRENT_TIMESTAMP
    WHERE status IN ('scheduled', 'confirmed')
    AND end_time < NOW()
    RETURNING id
  `;

  try {
    const result = await pool.query(query);
    const count = result.rowCount || 0;

    if (count > 0) {
      console.log(`✅ ${count} rendez-vous marqués automatiquement comme terminés`);
    }

    return count;
  } catch (error) {
    console.error('❌ Erreur lors du marquage automatique des rendez-vous:', error);
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
      a.end_time,
      a.status,
      c.first_name as client_first_name,
      c.last_name as client_last_name,
      l.first_name as lawyer_first_name,
      l.last_name as lawyer_last_name
    FROM appointments a
    LEFT JOIN users c ON a.client_id = c.id
    LEFT JOIN users l ON a.lawyer_id = l.id
    WHERE a.status IN ('scheduled', 'confirmed')
    AND a.end_time < NOW()
    ORDER BY a.end_time ASC
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des rendez-vous à compléter:', error);
    throw error;
  }
};