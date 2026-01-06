import { pool } from '../../config/database.config';
import { QueryResult } from 'pg';
import crypto from 'crypto';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Generate a unique reset token
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a password reset token
 */
export const createPasswordResetToken = async (
  userId: string,
  expiresInHours: number = 1
): Promise<PasswordResetToken> => {
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const query = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result: QueryResult<PasswordResetToken> = await pool.query(query, [
    userId,
    token,
    expiresAt,
  ]);

  return result.rows[0];
};

/**
 * Find a password reset token
 */
export const findPasswordResetToken = async (
  token: string
): Promise<PasswordResetToken | null> => {
  const query = `
    SELECT * FROM password_reset_tokens
    WHERE token = $1 AND used = FALSE AND expires_at > NOW()
  `;

  const result: QueryResult<PasswordResetToken> = await pool.query(query, [token]);
  return result.rows[0] || null;
};

/**
 * Mark a password reset token as used
 */
export const markTokenAsUsed = async (token: string): Promise<void> => {
  const query = `
    UPDATE password_reset_tokens
    SET used = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE token = $1
  `;

  await pool.query(query, [token]);
};

/**
 * Delete expired tokens (cleanup)
 */
export const deleteExpiredTokens = async (): Promise<number> => {
  const query = `
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW() OR used = TRUE
  `;

  const result = await pool.query(query);
  return result.rowCount || 0;
};

/**
 * Delete all tokens for a user
 */
export const deleteUserTokens = async (userId: string): Promise<void> => {
  const query = `
    DELETE FROM password_reset_tokens
    WHERE user_id = $1
  `;

  await pool.query(query, [userId]);
};