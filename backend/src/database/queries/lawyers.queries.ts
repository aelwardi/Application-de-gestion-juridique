import { pool } from '../../config/database.config';
import { QueryResult } from 'pg';

export interface Lawyer {
  id: string; // Ce sera l'ID utilisateur (u.id)
  user_id: string;
  bar_number: string;
  specialties: string[];
  experience_years: number;
  office_address: string | null;
  office_city: string | null;
  office_postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  hourly_rate: number | null;
  description: string | null;
  languages: string[];
  availability_status: string;
  verified_by_admin: boolean;
  verified_at: Date | null;
  rating: number;
  total_reviews: number;
  total_cases: number;
  created_at: Date;
  updated_at: Date;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
}

export const getAllLawyers = async (
  page: number = 1,
  limit: number = 20,
  verified?: boolean,
  city?: string,
  specialty?: string
): Promise<{ lawyers: Lawyer[]; total: number }> => {
  let query = `
    SELECT 
      u.id, 
      l.user_id,
      l.bar_number,
      l.specialties,
      l.experience_years,
      l.office_address,
      l.office_city,
      l.office_postal_code,
      l.hourly_rate,
      l.description,
      l.languages,
      l.availability_status,
      l.verified_by_admin,
      l.verified_at,
      l.rating,
      l.total_reviews,
      l.total_cases,
      u.email,
      u.first_name,
      u.last_name,
      u.phone,
      u.is_active,
      u.profile_picture_url,
      l.created_at,
      l.updated_at
    FROM lawyers l
    INNER JOIN users u ON l.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  let whereClause = '';

  if (verified !== undefined) {
    whereClause += ` AND l.verified_by_admin = $${paramIndex}`;
    params.push(verified);
    paramIndex++;
  }

  if (city) {
    whereClause += ` AND l.office_city ILIKE $${paramIndex}`;
    params.push(`%${city}%`);
    paramIndex++;
  }

  if (specialty) {
    whereClause += ` AND $${paramIndex} = ANY(l.specialties)`;
    params.push(specialty);
    paramIndex++;
  }

  const countQuery = `
    SELECT COUNT(*) 
    FROM lawyers l 
    INNER JOIN users u ON l.user_id = u.id 
    WHERE 1=1 ${whereClause}
  `;
  const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1));
  const total = parseInt(countResult.rows[0].count);

  query += whereClause;
  query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result: QueryResult<Lawyer> = await pool.query(query, params);

  console.log(`[Lawyers Query] Found ${result.rows.length} lawyers, total: ${total}`);

  return { lawyers: result.rows, total };
};

export const getLawyerById = async (lawyerId: string): Promise<Lawyer | null> => {
  const query = `
    SELECT u.id, l.*, u.email, u.first_name, u.last_name FROM lawyers l
    INNER JOIN users u ON l.user_id = u.id
    WHERE u.id = $1
  `;
  const result: QueryResult<Lawyer> = await pool.query(query, [lawyerId]);
  return result.rows[0] || null;
};

/**
 * Verify lawyer
 */
export const verifyLawyer = async (lawyerId: string, adminId: string): Promise<void> => {
  const query = `
    UPDATE lawyers
    SET verified_by_admin = TRUE, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;
  await pool.query(query, [lawyerId]);
};

/**
 * Get all cases with pagination and filters
 */
// Define the Case interface if not already imported
export interface Case {
  id: string;
  client_id: string;
  lawyer_id: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: Date;
  updated_at: Date;
  client_name?: string;
  lawyer_name?: string;
}

export const getAllCases = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  priority?: string
): Promise<{ cases: Case[]; total: number }> => {
  let query = `
    SELECT 
      c.*,
      CONCAT(client.first_name, ' ', client.last_name) as client_name,
      CONCAT(lawyer.first_name, ' ', lawyer.last_name) as lawyer_name
    FROM cases c
    LEFT JOIN users client ON c.client_id = client.id
    LEFT JOIN users lawyer ON c.lawyer_id = lawyer.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (status) {
    query += ` AND c.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (priority) {
    query += ` AND c.priority = $${paramIndex}`;
    params.push(priority);
    paramIndex++;
  }

  const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').replace(/LEFT JOIN.*lawyer_name/, '');
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result: QueryResult<Case> = await pool.query(query, params);

  return { cases: result.rows, total };
};

/**
 * Get case statistics
 */
export const getCaseStats = async (): Promise<any> => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
      COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
    FROM cases
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Get lawyer statistics
 */
export const getLawyerStats = async (): Promise<any> => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN verified_by_admin = TRUE THEN 1 END) as verified,
      COUNT(CASE WHEN verified_by_admin = FALSE THEN 1 END) as pending_verification,
      AVG(rating) as average_rating
    FROM lawyers
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Get appointments statistics
 */
export const getAppointmentStats = async (): Promise<any> => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN start_time > NOW() THEN 1 END) as upcoming
    FROM appointments
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Get pending reviews for moderation
 */
export const getPendingReviews = async (
  page: number = 1,
  limit: number = 20
): Promise<{ reviews: any[]; total: number }> => {
  const query = `
    SELECT 
      r.*,
      CONCAT(client.first_name, ' ', client.last_name) as client_name,
      CONCAT(lawyer.first_name, ' ', lawyer.last_name) as lawyer_name
    FROM reviews r
    LEFT JOIN users client ON r.client_id = client.id
    LEFT JOIN users lawyer ON r.lawyer_id = lawyer.id
    WHERE r.is_published = FALSE
    ORDER BY r.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) FROM reviews WHERE is_published = FALSE`;
  const countResult = await pool.query(countQuery);
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(query, [limit, (page - 1) * limit]);

  return { reviews: result.rows, total };
};

/**
 * Moderate review (approve/reject)
 */
export const moderateReview = async (
  reviewId: string,
  isPublished: boolean,
  adminId: string
): Promise<void> => {
  const query = `
    UPDATE reviews
    SET is_published = $1, moderated_by = $2, moderated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `;
  await pool.query(query, [isPublished, adminId, reviewId]);
};

/**
 * Get specialties
 */
export const getSpecialties = async (): Promise<any[]> => {
  const query = `SELECT * FROM lawyer_specialties ORDER BY name`;
  const result = await pool.query(query);
  return result.rows;
};