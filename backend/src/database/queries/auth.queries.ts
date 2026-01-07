import { pool } from '../../config/database.config';
import { QueryResult } from 'pg';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  bar_number?: string | null;
  specialties?: string[];
  experience_years?: number | null;
  office_address?: string | null;
  office_city?: string | null;
  office_postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hourly_rate?: number | null;
  description?: string | null;
  languages?: string[];
  availability_status?: string | null;
  verified_by_admin?: boolean;
  verified_at?: Date | null;
  rating?: number;
  total_reviews?: number;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  total_cases?: number;
  active_cases?: number;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePictureUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  barNumber?: string | null;
  specialties?: string[];
  experienceYears?: number;
  officeAddress?: string | null;
  officeCity?: string | null;
  officePostalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hourlyRate?: number | null;
  description?: string | null;
  languages?: string[];
  availabilityStatus?: string;
  verifiedByAdmin?: boolean;
  verifiedAt?: Date | null;
  rating?: number;
  totalReviews?: number;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
  totalCases?: number;
  activeCases?: number;
}

export interface LawyerData {
  barNumber: string;
  specialties?: string[];
  officeAddress?: string;
  officeCity?: string;
  officePostalCode?: string;
  latitude?: number;
  longitude?: number;
  yearsOfExperience?: number;
  bio?: string;
  languages?: string[];
  hourlyRate?: number;
}

export interface ClientData {
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

/**
 * Create a new user (avec données spécifiques selon le rôle)
 */
export const createUser = async (
  email: string,
  passwordHash: string,
  role: string,
  firstName: string,
  lastName: string,
  phone?: string,
  lawyerData?: LawyerData,
  clientData?: ClientData
): Promise<User> => {
  console.log('createUser - Role:', role);
  console.log('createUser - LawyerData:', JSON.stringify(lawyerData, null, 2));
  console.log('createUser - ClientData:', JSON.stringify(clientData, null, 2));

  let query = '';
  let values: any[] = [];

  if (role === 'avocat' && lawyerData) {
    query = `
      INSERT INTO users (
        email, password_hash, role, first_name, last_name, phone,
        bar_number, specialties, experience_years, office_address, 
        office_city, office_postal_code, latitude, longitude,
        hourly_rate, description, languages
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    values = [
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      phone || null,
      lawyerData.barNumber,
      lawyerData.specialties || [],
      lawyerData.yearsOfExperience || 0,
      lawyerData.officeAddress || null,
      lawyerData.officeCity || null,
      lawyerData.officePostalCode || null,
      lawyerData.latitude || null,
      lawyerData.longitude || null,
      lawyerData.hourlyRate || null,
      lawyerData.bio || null,
      lawyerData.languages || []
    ];
  } else if (role === 'client' && clientData) {
    query = `
      INSERT INTO users (
        email, password_hash, role, first_name, last_name, phone,
        address, city, postal_code, emergency_contact_name, emergency_contact_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    values = [
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      phone || null,
      clientData.address || null,
      clientData.city || null,
      clientData.postalCode || null,
      clientData.emergencyContactName || null,
      clientData.emergencyContactPhone || null
    ];
  } else {
    query = `
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    values = [email, passwordHash, role, firstName, lastName, phone || null];
  }

  const result: QueryResult<User> = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result: QueryResult<User> = await pool.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result: QueryResult<User> = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Update user last login
 */
export const updateLastLogin = async (id: string): Promise<void> => {
  const query = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1';
  await pool.query(query, [id]);
};

/**
 * Update user password
 */
export const updateUserPassword = async (id: string, passwordHash: string): Promise<void> => {
  const query = `
    UPDATE users 
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2
  `;
  await pool.query(query, [passwordHash, id]);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  id: string,
  updates: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    profilePictureUrl: string;
  }>
): Promise<User> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.firstName !== undefined) {
    fields.push(`first_name = $${paramCount++}`);
    values.push(updates.firstName);
  }
  if (updates.lastName !== undefined) {
    fields.push(`last_name = $${paramCount++}`);
    values.push(updates.lastName);
  }
  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramCount++}`);
    values.push(updates.phone);
  }
  if (updates.profilePictureUrl !== undefined) {
    fields.push(`profile_picture_url = $${paramCount++}`);
    values.push(updates.profilePictureUrl);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result: QueryResult<User> = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete user (soft delete - set is_active to false)
 */
export const deactivateUser = async (id: string): Promise<void> => {
  const query = `
    UPDATE users 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `;
  await pool.query(query, [id]);
};

/**
 * Convert database user to response format
 */
export const userToResponse = (user: User): UserResponse => {
  const response: UserResponse = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    profilePictureUrl: user.profile_picture_url,
    isActive: user.is_active,
    isVerified: user.is_verified,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };

  if (user.role === 'avocat') {
    response.barNumber = user.bar_number || null;
    response.specialties = user.specialties || [];
    response.experienceYears = user.experience_years || 0;
    response.officeAddress = user.office_address || null;
    response.officeCity = user.office_city || null;
    response.officePostalCode = user.office_postal_code || null;
    response.latitude = user.latitude || null;
    response.longitude = user.longitude || null;
    response.hourlyRate = user.hourly_rate || null;
    response.description = user.description || null;
    response.languages = user.languages || [];
    response.availabilityStatus = user.availability_status || 'available';
    response.verifiedByAdmin = user.verified_by_admin || false;
    response.verifiedAt = user.verified_at || null;
    response.rating = user.rating || 0;
    response.totalReviews = user.total_reviews || 0;
    response.totalCases = user.total_cases || 0;
    response.activeCases = user.active_cases || 0;
  }

  if (user.role === 'client') {
    response.address = user.address || null;
    response.city = user.city || null;
    response.postalCode = user.postal_code || null;
    response.emergencyContactName = user.emergency_contact_name || null;
    response.emergencyContactPhone = user.emergency_contact_phone || null;
    response.notes = user.notes || null;
    response.totalCases = user.total_cases || 0;
    response.activeCases = user.active_cases || 0;
  }

  return response;
};