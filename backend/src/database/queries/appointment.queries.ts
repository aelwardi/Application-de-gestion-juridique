import { pool } from '../../config/database.config';
import type {
  Appointment,
  AppointmentWithDetails,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentFilters,
  AppointmentStats
} from '../../types/appointment.types';

/**
 * Créer un nouveau rendez-vous
 */
export const createAppointment = async (data: CreateAppointmentDTO): Promise<Appointment> => {
  const query = `
    INSERT INTO appointments (
      case_id, lawyer_id, client_id, appointment_type, title, description,
      start_time, end_time, location_type, location_address, 
      location_latitude, location_longitude, meeting_url, status, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;

  const values = [
    data.case_id || null,
    data.lawyer_id,
    data.client_id,
    data.appointment_type,
    data.title,
    data.description || null,
    data.start_time,
    data.end_time,
    data.location_type || null,
    data.location_address || null,
    data.location_latitude || null,
    data.location_longitude || null,
    data.meeting_url || null,
    data.status || 'scheduled',
    data.notes || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Récupérer tous les rendez-vous avec filtres
 */
export const getAllAppointments = async (filters: AppointmentFilters = {}): Promise<{ appointments: AppointmentWithDetails[], total: number }> => {
  let query = `
    SELECT 
      a.*,
      c.case_number,
      c.title as case_title,
      lu.first_name as lawyer_first_name,
      lu.last_name as lawyer_last_name,
      lu.email as lawyer_email,
      cu.first_name as client_first_name,
      cu.last_name as client_last_name,
      cu.email as client_email
    FROM appointments a
    LEFT JOIN cases c ON a.case_id = c.id
    LEFT JOIN users lu ON a.lawyer_id = lu.id
    LEFT JOIN users cu ON a.client_id = cu.id
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramCount = 1;

  if (filters.status) {
    query += ` AND a.status = $${paramCount++}`;
    values.push(filters.status);
  }

  if (filters.appointment_type) {
    query += ` AND a.appointment_type = $${paramCount++}`;
    values.push(filters.appointment_type);
  }



  if (filters.lawyer_id) {
    query += ` AND a.lawyer_id = $${paramCount++}`;
    values.push(filters.lawyer_id);
  }

  if (filters.client_id) {
    query += ` AND a.client_id = $${paramCount++}`;
    values.push(filters.client_id);
  }

  if (filters.case_id) {
    query += ` AND a.case_id = $${paramCount++}`;
    values.push(filters.case_id);
  }

  if (filters.start_date) {
    query += ` AND a.start_time >= $${paramCount++}`;
    values.push(filters.start_date);
  }

  if (filters.end_date) {
    query += ` AND a.start_time <= $${paramCount++}`;
    values.push(filters.end_date);
  }

  if (filters.search) {
    query += ` AND (a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount} OR a.location_address ILIKE $${paramCount})`;
    values.push(`%${filters.search}%`);
    paramCount++;
  }

  // Compter le total
  const countQuery = query.replace(
    /SELECT.*FROM/s,
    'SELECT COUNT(*) FROM'
  );
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Ajouter l'ordre et la pagination
  query += ` ORDER BY a.start_time ASC`;

  if (filters.limit) {
    query += ` LIMIT $${paramCount++}`;
    values.push(filters.limit);
  }

  if (filters.offset) {
    query += ` OFFSET $${paramCount++}`;
    values.push(filters.offset);
  }

  const result = await pool.query(query, values);
  return { appointments: result.rows, total };
};

/**
 * Récupérer un rendez-vous par ID
 */
export const getAppointmentById = async (id: string): Promise<AppointmentWithDetails | null> => {
  const query = `
    SELECT 
      a.*,
      c.case_number,
      c.title as case_title,
      lu.first_name as lawyer_first_name,
      lu.last_name as lawyer_last_name,
      lu.email as lawyer_email,
      cu.first_name as client_first_name,
      cu.last_name as client_last_name,
      cu.email as client_email
    FROM appointments a
    LEFT JOIN cases c ON a.case_id = c.id
    LEFT JOIN users lu ON a.lawyer_id = lu.id
    LEFT JOIN users cu ON a.client_id = cu.id
    WHERE a.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Mettre à jour un rendez-vous
 */
export const updateAppointment = async (id: string, data: UpdateAppointmentDTO): Promise<Appointment | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.case_id !== undefined) {
    fields.push(`case_id = $${paramCount++}`);
    values.push(data.case_id);
  }

  if (data.appointment_type) {
    fields.push(`appointment_type = $${paramCount++}`);
    values.push(data.appointment_type);
  }

  if (data.title) {
    fields.push(`title = $${paramCount++}`);
    values.push(data.title);
  }

  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }

  if (data.start_time) {
    fields.push(`start_time = $${paramCount++}`);
    values.push(data.start_time);
  }

  if (data.end_time) {
    fields.push(`end_time = $${paramCount++}`);
    values.push(data.end_time);
  }

  if (data.location !== undefined) {
    fields.push(`location = $${paramCount++}`);
    values.push(data.location);
  }

  if (data.location_type !== undefined) {
    fields.push(`location_type = $${paramCount++}`);
    values.push(data.location_type);
  }

  if (data.location_address !== undefined) {
    fields.push(`location_address = $${paramCount++}`);
    values.push(data.location_address);
  }

  if (data.location_latitude !== undefined) {
    fields.push(`location_latitude = $${paramCount++}`);
    values.push(data.location_latitude);
  }

  if (data.location_longitude !== undefined) {
    fields.push(`location_longitude = $${paramCount++}`);
    values.push(data.location_longitude);
  }

  if (data.meeting_url !== undefined) {
    fields.push(`meeting_url = $${paramCount++}`);
    values.push(data.meeting_url);
  }

  if (data.status) {
    fields.push(`status = $${paramCount++}`);
    values.push(data.status);
  }

  if (data.reminder_sent !== undefined) {
    fields.push(`reminder_sent = $${paramCount++}`);
    values.push(data.reminder_sent);
  }

  if (data.notes !== undefined) {
    fields.push(`notes = $${paramCount++}`);
    values.push(data.notes);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE appointments
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Supprimer un rendez-vous
 */
export const deleteAppointment = async (id: string): Promise<boolean> => {
  const query = 'DELETE FROM appointments WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Récupérer les rendez-vous d'un avocat
 */
export const getAppointmentsByLawyer = async (lawyerId: string, filters: AppointmentFilters = {}): Promise<AppointmentWithDetails[]> => {
  const updatedFilters = { ...filters, lawyer_id: lawyerId };
  const { appointments } = await getAllAppointments(updatedFilters);
  return appointments;
};

/**
 * Récupérer les rendez-vous d'un client
 */
export const getAppointmentsByClient = async (clientId: string, filters: AppointmentFilters = {}): Promise<AppointmentWithDetails[]> => {
  const updatedFilters = { ...filters, client_id: clientId };
  const { appointments } = await getAllAppointments(updatedFilters);
  return appointments;
};

/**
 * Récupérer les rendez-vous d'un dossier
 */
export const getAppointmentsByCase = async (caseId: string): Promise<AppointmentWithDetails[]> => {
  const { appointments } = await getAllAppointments({ case_id: caseId });
  return appointments;
};

/**
 * Récupérer les rendez-vous à venir
 */
export const getUpcomingAppointments = async (lawyerId?: string, clientId?: string): Promise<AppointmentWithDetails[]> => {
  const now = new Date().toISOString();
  const filters: AppointmentFilters = {
    start_date: now,
    status: 'scheduled'
  };

  if (lawyerId) filters.lawyer_id = lawyerId;
  if (clientId) filters.client_id = clientId;

  const { appointments } = await getAllAppointments(filters);
  return appointments;
};

/**
 * Récupérer les rendez-vous du jour
 */
export const getTodayAppointments = async (lawyerId?: string, clientId?: string): Promise<AppointmentWithDetails[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filters: AppointmentFilters = {
    start_date: today.toISOString(),
    end_date: tomorrow.toISOString()
  };

  if (lawyerId) filters.lawyer_id = lawyerId;
  if (clientId) filters.client_id = clientId;

  const { appointments } = await getAllAppointments(filters);
  return appointments;
};

/**
 * Récupérer les statistiques des rendez-vous
 */
export const getAppointmentStats = async (lawyerId?: string, clientId?: string): Promise<AppointmentStats> => {
  let query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
      COUNT(*) FILTER (WHERE start_time >= NOW()) as upcoming,
      COUNT(*) FILTER (WHERE DATE(start_time) = CURRENT_DATE) as today,
      COUNT(*) FILTER (WHERE start_time >= DATE_TRUNC('week', NOW()) AND start_time < DATE_TRUNC('week', NOW()) + INTERVAL '1 week') as this_week,
      COUNT(*) FILTER (WHERE start_time >= DATE_TRUNC('month', NOW()) AND start_time < DATE_TRUNC('month', NOW()) + INTERVAL '1 month') as this_month
    FROM appointments
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramCount = 1;

  if (lawyerId) {
    query += ` AND lawyer_id = $${paramCount++}`;
    values.push(lawyerId);
  }

  if (clientId) {
    query += ` AND client_id = $${paramCount++}`;
    values.push(clientId);
  }

  const result = await pool.query(query, values);
  const stats = result.rows[0];

  // Statistiques par type
  const typeQuery = `
    SELECT appointment_type, COUNT(*) as count
    FROM appointments
    WHERE 1=1
    ${lawyerId ? `AND lawyer_id = $1` : ''}
    ${clientId ? `AND client_id = $${lawyerId ? 2 : 1}` : ''}
    GROUP BY appointment_type
  `;

  const typeValues: any[] = [];
  if (lawyerId) typeValues.push(lawyerId);
  if (clientId) typeValues.push(clientId);

  const typeResult = await pool.query(typeQuery, typeValues);
  const by_type: any = {};
  typeResult.rows.forEach((row: any) => {
    by_type[row.appointment_type] = parseInt(row.count);
  });

  return {
    total: parseInt(stats.total),
    scheduled: parseInt(stats.scheduled),
    confirmed: parseInt(stats.confirmed),
    cancelled: parseInt(stats.cancelled),
    completed: parseInt(stats.completed),
    no_show: parseInt(stats.no_show),
    by_type,
    upcoming: parseInt(stats.upcoming),
    today: parseInt(stats.today),
    this_week: parseInt(stats.this_week),
    this_month: parseInt(stats.this_month)
  };
};

/**
 * Marquer le rappel comme envoyé
 */
export const markReminderSent = async (id: string): Promise<boolean> => {
  const query = `
    UPDATE appointments
    SET reminder_sent = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Annuler un rendez-vous
 */
export const cancelAppointment = async (id: string): Promise<Appointment | null> => {
  return updateAppointment(id, { status: 'cancelled' });
};

/**
 * Confirmer un rendez-vous
 */
export const confirmAppointment = async (id: string): Promise<Appointment | null> => {
  return updateAppointment(id, { status: 'confirmed' });
};

/**
 * Marquer un rendez-vous comme complété
 */
export const completeAppointment = async (id: string): Promise<Appointment | null> => {
  return updateAppointment(id, { status: 'completed' });
};
