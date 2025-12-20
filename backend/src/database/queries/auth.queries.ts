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
  phone?: string
): Promise<User> => {
  const query = `
    INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [email, passwordHash, role, firstName, lastName, phone || null];
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

