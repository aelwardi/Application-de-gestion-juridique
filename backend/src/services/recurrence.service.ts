import { pool } from '../config/database.config';

interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0 = dimanche, 1 = lundi, etc.
  endDate?: string;
  occurrences?: number;
}

interface CreateRecurringAppointmentDTO {
  title: string;
  appointment_type: string;
  location_type: string;
  location_address?: string;
  meeting_url?: string;
  start_time: string;
  duration: number; // en minutes
  case_id?: string;
  client_id: string;
  lawyer_id: string;
  recurrence: RecurrencePattern;
}

/**
 * Créer une série de rendez-vous récurrents
 */
export const createRecurringAppointments = async (data: CreateRecurringAppointmentDTO) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Créer l'entrée de série
    const seriesResult = await client.query(`
      INSERT INTO appointment_series (frequency, interval, days_of_week, end_date, occurrences, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      data.recurrence.frequency,
      data.recurrence.interval,
      data.recurrence.daysOfWeek || null,
      data.recurrence.endDate || null,
      data.recurrence.occurrences || null,
      data.lawyer_id
    ]);

    const seriesId = seriesResult.rows[0].id;

    // Générer les dates des rendez-vous
    const dates = generateRecurringDates(
      new Date(data.start_time),
      data.recurrence
    );

    const createdAppointments = [];

    // Créer chaque rendez-vous de la série
    for (const date of dates) {
      const endTime = new Date(date.getTime() + data.duration * 60000);

      const result = await client.query(`
        INSERT INTO appointments (
          title, appointment_type, location_type, location_address, meeting_url,
          start_time, end_time, case_id, client_id, lawyer_id, series_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'scheduled')
        RETURNING *
      `, [
        data.title,
        data.appointment_type,
        data.location_type,
        data.location_address,
        data.meeting_url,
        date.toISOString(),
        endTime.toISOString(),
        data.case_id || null,
        data.client_id,
        data.lawyer_id,
        seriesId
      ]);

      createdAppointments.push(result.rows[0]);
    }

    await client.query('COMMIT');

    return {
      success: true,
      seriesId,
      appointments: createdAppointments,
      count: createdAppointments.length
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création de rendez-vous récurrents:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Générer les dates pour une récurrence
 */
function generateRecurringDates(startDate: Date, pattern: RecurrencePattern): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  const maxOccurrences = pattern.occurrences || 52; // Max 1 an par défaut
  const endDate = pattern.endDate ? new Date(pattern.endDate) : null;

  for (let i = 0; i < maxOccurrences; i++) {
    if (endDate && currentDate > endDate) break;

    // Ajouter la date si elle correspond aux critères
    if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
      if (pattern.daysOfWeek.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
    } else {
      dates.push(new Date(currentDate));
    }

    // Calculer la prochaine date
    switch (pattern.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + pattern.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * pattern.interval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + pattern.interval);
        break;
    }
  }

  return dates;
}

/**
 * Mettre à jour toute une série de rendez-vous
 */
export const updateRecurringSeries = async (seriesId: string, updates: any) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Mettre à jour tous les rendez-vous futurs de la série
    const result = await client.query(`
      UPDATE appointments
      SET 
        title = COALESCE($1, title),
        appointment_type = COALESCE($2, appointment_type),
        location_type = COALESCE($3, location_type),
        location_address = COALESCE($4, location_address),
        meeting_url = COALESCE($5, meeting_url)
      WHERE series_id = $6 
        AND start_time >= NOW()
        AND status IN ('scheduled', 'confirmed')
      RETURNING *
    `, [
      updates.title,
      updates.appointment_type,
      updates.location_type,
      updates.location_address,
      updates.meeting_url,
      seriesId
    ]);

    await client.query('COMMIT');

    return {
      success: true,
      updated: result.rowCount,
      appointments: result.rows
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la mise à jour de la série:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Supprimer toute une série de rendez-vous
 */
export const deleteRecurringSeries = async (seriesId: string) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Annuler tous les rendez-vous futurs de la série
    const result = await client.query(`
      UPDATE appointments
      SET status = 'cancelled'
      WHERE series_id = $1 
        AND start_time >= NOW()
        AND status IN ('scheduled', 'confirmed')
      RETURNING id
    `, [seriesId]);

    await client.query('COMMIT');

    return {
      success: true,
      cancelled: result.rowCount
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la suppression de la série:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Obtenir tous les rendez-vous d'une série
 */
export const getSeriesAppointments = async (seriesId: string) => {
  try {
    const result = await pool.query(`
      SELECT a.*, 
        CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM appointments a
      LEFT JOIN users c ON a.client_id = c.id
      WHERE a.series_id = $1
      ORDER BY a.start_time
    `, [seriesId]);

    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération de la série:', error);
    throw error;
  }
};

export default {
  createRecurringAppointments,
  updateRecurringSeries,
  deleteRecurringSeries,
  getSeriesAppointments
};