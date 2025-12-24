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
  lawyerId?: string | null; // ID de la table lawyers (pour les avocats)
  clientId?: string | null; // ID de la table clients (pour les clients)
}

export interface LawyerData {
  barNumber: string;
  specialties?: string[];
  officeAddress?: string;
  officeCity?: string;
  yearsOfExperience?: number;
  bio?: string;
}

export interface ClientData {
  address?: string;
  city?: string;
  postalCode?: string;
}

/**
 * Create a new user
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
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('createUser - Received lawyerData:', JSON.stringify(lawyerData, null, 2));
    console.log('createUser - Received clientData:', JSON.stringify(clientData, null, 2));
    
    // Create user
    const userQuery = `
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const userValues = [email, passwordHash, role, firstName, lastName, phone || null];
    const userResult: QueryResult<User> = await client.query(userQuery, userValues);
    const user = userResult.rows[0];

    // If role is 'avocat', create corresponding lawyer entry
    if (role === 'avocat') {
      const lawyerQuery = `
        INSERT INTO lawyers (user_id, bar_number, specialties, office_address, office_city, experience_years, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      // Use provided data or generate temporary values
      const barNumber = lawyerData?.barNumber || `TEMP-${user.id.substring(0, 8)}`;
      const specialties = lawyerData?.specialties || [];
      const officeAddress = lawyerData?.officeAddress || null;
      const officeCity = lawyerData?.officeCity || null;
      const experienceYears = lawyerData?.yearsOfExperience || null;
      const description = lawyerData?.bio || null;
      
      console.log('createUser - Inserting lawyer with values:', {
        barNumber,
        specialties,
        officeAddress,
        officeCity,
        experienceYears,
        description
      });
      
      const lawyerValues = [user.id, barNumber, specialties, officeAddress, officeCity, experienceYears, description];
      await client.query(lawyerQuery, lawyerValues);
    }
    
    // If role is 'client', create corresponding client entry
    if (role === 'client') {
      const clientQuery = `
        INSERT INTO clients (user_id, address, city, postal_code, total_cases, active_cases)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      const address = clientData?.address || null;
      const city = clientData?.city || null;
      const postalCode = clientData?.postalCode || null;
      
      const clientValues = [user.id, address, city, postalCode, 0, 0];
      await client.query(clientQuery, clientValues);
    }

    await client.query('COMMIT');
    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
  return {
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
};

