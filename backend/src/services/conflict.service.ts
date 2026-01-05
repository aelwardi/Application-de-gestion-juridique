import { pool } from '../config/database.config';

/**
 * Vérifier les conflits de rendez-vous pour un avocat
 */
export const checkConflicts = async (
  lawyerId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<any[]> => {
  try {
    let query = `
      SELECT 
        a.id,
        a.title,
        a.start_time,
        a.end_time,
        CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM appointments a
      LEFT JOIN users c ON a.client_id = c.id
      WHERE a.lawyer_id = $1
        AND a.status IN ('scheduled', 'confirmed')
        AND (
          (a.start_time >= $2 AND a.start_time < $3)
          OR (a.end_time > $2 AND a.end_time <= $3)
          OR (a.start_time <= $2 AND a.end_time >= $3)
        )
    `;

    const params: any[] = [lawyerId, startTime, endTime];

    if (excludeAppointmentId) {
      query += ` AND a.id != $4`;
      params.push(excludeAppointmentId);
    }

    query += ` ORDER BY a.start_time`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la vérification des conflits:', error);
    throw error;
  }
};

/**
 * Trouver des créneaux disponibles pour un avocat
 */
export const findAvailableSlots = async (
  lawyerId: string,
  date: string,
  duration: number = 60 // en minutes
): Promise<any[]> => {
  try {
    // Horaires de travail par défaut: 9h-18h
    const workStart = 9;
    const workEnd = 18;
    const slotDuration = duration;

    // Récupérer tous les rendez-vous du jour
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT start_time, end_time
      FROM appointments
      WHERE lawyer_id = $1
        AND start_time >= $2
        AND start_time < $3
        AND status IN ('scheduled', 'confirmed')
      ORDER BY start_time
    `;

    const result = await pool.query(query, [
      lawyerId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    ]);

    const bookedSlots = result.rows.map((row: any) => ({
      start: new Date(row.start_time),
      end: new Date(row.end_time)
    }));

    // Générer les créneaux disponibles
    const availableSlots: any[] = [];
    const baseDate = new Date(date);

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(baseDate);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Vérifier si le créneau ne chevauche pas un rendez-vous existant
        const hasConflict = bookedSlots.some((booked: any) => {
          return (
            (slotStart >= booked.start && slotStart < booked.end) ||
            (slotEnd > booked.start && slotEnd <= booked.end) ||
            (slotStart <= booked.start && slotEnd >= booked.end)
          );
        });

        if (!hasConflict && slotEnd.getHours() <= workEnd) {
          availableSlots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label: `${slotStart.getHours()}:${slotStart.getMinutes().toString().padStart(2, '0')} - ${slotEnd.getHours()}:${slotEnd.getMinutes().toString().padStart(2, '0')}`
          });
        }
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Erreur lors de la recherche de créneaux disponibles:', error);
    throw error;
  }
};

/**
 * Vérifier si un créneau est disponible
 */
export const isSlotAvailable = async (
  lawyerId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> => {
  const conflicts = await checkConflicts(lawyerId, startTime, endTime, excludeAppointmentId);
  return conflicts.length === 0;
};

export default {
  checkConflicts,
  findAvailableSlots,
  isSlotAvailable
};