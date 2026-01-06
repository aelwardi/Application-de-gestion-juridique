import { pool } from '../../config/database.config';

/**
 * QUERIES UNIFIÉES - Table USERS uniquement
 * Plus besoin de tables lawyers/clients séparées
 */

export const getAllLawyers = async (
  page: number = 1,
  limit: number = 10,
  verified?: boolean,
  city?: string,
  specialty?: string
) => {
  let query = `
    SELECT 
      id, email, first_name, last_name, phone,
      bar_number, specialties, experience_years, education,
      languages, hourly_rate, bio, office_address, office_city,
      office_postal_code, website_url, linkedin_url,
      profile_picture_url, is_verified, created_at
    FROM users
    WHERE role = 'lawyer' AND is_active = true
  `;

  const values: any[] = [];
  let paramCount = 1;

  if (verified !== undefined) {
    query += ` AND is_verified = $${paramCount++}`;
    values.push(verified);
  }

  if (city) {
    query += ` AND office_city ILIKE $${paramCount++}`;
    values.push(`%${city}%`);
  }

  if (specialty) {
    query += ` AND $${paramCount++} = ANY(specialties)`;
    values.push(specialty);
  }

  query += ` ORDER BY created_at DESC`;
  query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  values.push(limit, (page - 1) * limit);

  const result = await pool.query(query, values);

  const countQuery = `SELECT COUNT(*) FROM users WHERE role = 'lawyer' AND is_active = true`;
  const countResult = await pool.query(countQuery);

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

export const getLawyerById = async (lawyerId: string) => {
  const query = `
    SELECT 
      id, email, first_name, last_name, phone,
      bar_number, specialties, experience_years, education,
      languages, hourly_rate, bio, office_address, office_city,
      office_postal_code, website_url, linkedin_url,
      profile_picture_url, is_verified, is_active, created_at, updated_at
    FROM users
    WHERE id = $1 AND role = 'lawyer'
  `;

  const result = await pool.query(query, [lawyerId]);
  return result.rows[0] || null;
};

export const updateLawyerProfile = async (lawyerId: string, data: any) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  const allowedFields = [
    'first_name', 'last_name', 'phone', 'bar_number', 'specialties',
    'experience_years', 'education', 'languages', 'hourly_rate', 'bio',
    'office_address', 'office_city', 'office_postal_code',
    'website_url', 'linkedin_url', 'profile_picture_url'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramCount++}`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(lawyerId);

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND role = 'lawyer'
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const verifyLawyer = async (lawyerId: string) => {
  const query = `
    UPDATE users
    SET is_verified = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND role = 'lawyer'
    RETURNING *
  `;

  const result = await pool.query(query, [lawyerId]);
  return result.rows[0] || null;
};

export const getAllClients = async (page: number = 1, limit: number = 10) => {
  const query = `
    SELECT 
      id, email, first_name, last_name, phone,
      company_name, company_siret, address, city, postal_code,
      date_of_birth, nationality, profile_picture_url,
      is_active, created_at
    FROM users
    WHERE role = 'client' AND is_active = true
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, (page - 1) * limit]);

  const countQuery = `SELECT COUNT(*) FROM users WHERE role = 'client' AND is_active = true`;
  const countResult = await pool.query(countQuery);

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

export const getClientById = async (clientId: string) => {
  const query = `
    SELECT 
      id, email, first_name, last_name, phone,
      company_name, company_siret, address, city, postal_code,
      date_of_birth, nationality, profile_picture_url,
      is_active, is_verified, created_at, updated_at
    FROM users
    WHERE id = $1 AND role = 'client'
  `;

  const result = await pool.query(query, [clientId]);
  return result.rows[0] || null;
};

export const updateClientProfile = async (clientId: string, data: any) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  const allowedFields = [
    'first_name', 'last_name', 'phone', 'company_name', 'company_siret',
    'address', 'city', 'postal_code', 'date_of_birth', 'nationality',
    'profile_picture_url'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramCount++}`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(clientId);

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND role = 'client'
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const getLawyerStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_verified = true) as verified,
      COUNT(*) FILTER (WHERE is_verified = false) as unverified,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
    FROM users
    WHERE role = 'lawyer' AND is_active = true
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

export const getClientStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
    FROM users
    WHERE role = 'client' AND is_active = true
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

export const getCaseStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'closed') as closed,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
    FROM cases
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

export const getAppointmentStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
      COUNT(*) FILTER (WHERE start_time >= NOW() AND status = 'scheduled') as upcoming
    FROM appointments
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

export const getPendingReviews = async (page: number = 1, limit: number = 10) => {
  const query = `
    SELECT 
      r.*,
      u_lawyer.first_name as lawyer_first_name,
      u_lawyer.last_name as lawyer_last_name,
      u_client.first_name as client_first_name,
      u_client.last_name as client_last_name
    FROM reviews r
    INNER JOIN users u_lawyer ON r.lawyer_id = u_lawyer.id
    INNER JOIN users u_client ON r.client_id = u_client.id
    WHERE r.is_approved = false
    ORDER BY r.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, (page - 1) * limit]);

  const countQuery = `SELECT COUNT(*) FROM reviews WHERE is_approved = false`;
  const countResult = await pool.query(countQuery);

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

export const moderateReview = async (reviewId: string, approve: boolean, adminId: string) => {
  const query = `
    UPDATE reviews
    SET is_approved = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [approve, adminId, reviewId]);
  return result.rows[0] || null;
};