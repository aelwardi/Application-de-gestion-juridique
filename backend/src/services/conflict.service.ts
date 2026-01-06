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
        a.location_address,
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
    const workStart = 9;
    const workEnd = 18;
    const slotDuration = duration;

    const [year, month, day] = date.split('-').map(Number);

    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

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

    console.log('📅 Rendez-vous trouvés:', result.rows);

    const bookedSlots = result.rows.map((row: any) => ({
      start: new Date(row.start_time),
      end: new Date(row.end_time)
    }));

    const availableSlots: any[] = [];
    const baseDate = new Date(Date.UTC(year, month - 1, day));

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
        const slotEnd = new Date(slotStart);
        slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + slotDuration);

        const hasConflict = bookedSlots.some((booked: any) => {
          return (
            (slotStart >= booked.start && slotStart < booked.end) ||
            (slotEnd > booked.start && slotEnd <= booked.end) ||
            (slotStart <= booked.start && slotEnd >= booked.end)
          );
        });

        if (!hasConflict && slotEnd.getUTCHours() <= workEnd) {
          availableSlots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label: `${slotStart.getUTCHours()}:${slotStart.getUTCMinutes().toString().padStart(2, '0')} - ${slotEnd.getUTCHours()}:${slotEnd.getUTCMinutes().toString().padStart(2, '0')}`
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