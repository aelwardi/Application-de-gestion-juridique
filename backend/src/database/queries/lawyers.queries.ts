import { pool } from '../../config/database.config';
import { QueryResult } from 'pg';

export interface Lawyer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  is_verified: boolean;
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
  active_cases: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get all lawyers with pagination and filters
 */
export const getAllLawyers = async (
  page: number = 1,
  limit: number = 20,
  verified?: boolean,
  city?: string,
  specialty?: string
): Promise<{ lawyers: Lawyer[]; total: number }> => {
  let query = `
    SELECT 
      id, email, first_name, last_name, phone, profile_picture_url,
      is_active, is_verified,
      bar_number, specialties, experience_years,
      office_address, office_city, office_postal_code,
      latitude, longitude, hourly_rate, description,
      languages, availability_status,
      verified_by_admin, verified_at,
      rating, total_reviews, total_cases, active_cases,
      created_at, updated_at
    FROM users
    WHERE role = 'avocat'
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (verified !== undefined) {
    query += ` AND verified_by_admin = $${paramIndex}`;
    params.push(verified);
    paramIndex++;
  }

  if (city) {
    query += ` AND office_city ILIKE $${paramIndex}`;
    params.push(`%${city}%`);
    paramIndex++;
  }

  if (specialty) {
    query += ` AND $${paramIndex} = ANY(specialties)`;
    params.push(specialty);
    paramIndex++;
  }

  const countQuery = `
    SELECT COUNT(*) 
    FROM users 
    WHERE role = 'avocat'
    ${verified !== undefined ? ` AND verified_by_admin = $1` : ''}
    ${city ? ` AND office_city ILIKE $${verified !== undefined ? 2 : 1}` : ''}
    ${specialty ? ` AND $${(verified !== undefined ? 1 : 0) + (city ? 1 : 0) + 1} = ANY(specialties)` : ''}
  `;
  const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1));
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY rating DESC, total_reviews DESC, created_at DESC 
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result: QueryResult<Lawyer> = await pool.query(query, params);

  console.log(`[Lawyers Query] Found ${result.rows.length} lawyers, total: ${total}`);

  return { lawyers: result.rows, total };
};

/**
 * Get lawyer by ID
 */
export const getLawyerById = async (lawyerId: string): Promise<Lawyer | null> => {
  const query = `
    SELECT * FROM users
    WHERE id = $1 AND role = 'avocat'
  `;
  const result: QueryResult<Lawyer> = await pool.query(query, [lawyerId]);
  return result.rows[0] || null;
};

/**
 * Search lawyers nearby (geolocation)
 */
export const searchLawyersNearby = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  page: number = 1,
  limit: number = 20
): Promise<{ lawyers: Lawyer[]; total: number }> => {
  const query = `
    SELECT *, 
      (6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(latitude))
      )) AS distance
    FROM users
    WHERE role = 'avocat' 
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
      AND verified_by_admin = true
      AND is_active = true
    HAVING distance < $3
    ORDER BY distance ASC
    LIMIT $4 OFFSET $5
  `;

  const params = [latitude, longitude, radiusKm, limit, (page - 1) * limit];
  const result = await pool.query(query, params);

  const countQuery = `
    SELECT COUNT(*) FROM (
      SELECT id,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
      FROM users
      WHERE role = 'avocat' 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND verified_by_admin = true
        AND is_active = true
      HAVING distance < $3
    ) as nearby
  `;
  const countResult = await pool.query(countQuery, [latitude, longitude, radiusKm]);
  const total = parseInt(countResult.rows[0].count);

  return { lawyers: result.rows, total };
};

/**
 * Verify lawyer
 */
export const verifyLawyer = async (lawyerId: string, adminId: string): Promise<void> => {
  const query = `
    UPDATE users
    SET verified_by_admin = TRUE, 
        verified_at = CURRENT_TIMESTAMP, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND role = 'avocat'
  `;
  await pool.query(query, [lawyerId]);
};

/**
 * Unverify lawyer
 */
export const unverifyLawyer = async (lawyerId: string): Promise<void> => {
  const query = `
    UPDATE users
    SET verified_by_admin = FALSE, 
        verified_at = NULL, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND role = 'avocat'
  `;
  await pool.query(query, [lawyerId]);
};

/**
 * Update lawyer availability status
 */
export const updateAvailabilityStatus = async (
  lawyerId: string,
  status: 'available' | 'busy' | 'unavailable'
): Promise<void> => {
  const query = `
    UPDATE users
    SET availability_status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND role = 'avocat'
  `;
  await pool.query(query, [status, lawyerId]);
};

/**
 * Get all cases with pagination and filters
 */
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
    LEFT JOIN users client ON c.client_id = client.id AND client.role = 'client'
    LEFT JOIN users lawyer ON c.lawyer_id = lawyer.id AND lawyer.role = 'avocat'
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

  const countQuery = `SELECT COUNT(*) FROM cases c WHERE 1=1
    ${status ? ` AND c.status = $1` : ''}
    ${priority ? ` AND c.priority = $${status ? 2 : 1}` : ''}`;
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
      COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
      AVG(rating) as average_rating,
      SUM(total_cases) as total_cases,
      SUM(active_cases) as active_cases
    FROM users
    WHERE role = 'avocat'
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
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as scheduled,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN start_date > NOW() THEN 1 END) as upcoming
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
    LEFT JOIN users client ON r.client_id = client.id AND client.role = 'client'
    LEFT JOIN users lawyer ON r.lawyer_id = lawyer.id AND lawyer.role = 'avocat'
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