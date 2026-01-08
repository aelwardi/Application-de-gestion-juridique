import { pool } from '../../config/database.config';
import type { QueryResult } from 'pg';

export interface TwoFactorTempToken {
  id: string;
  user_id: string;
  temp_token: string;
  expires_at: Date;
  verified: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export const enableTwoFactor = async (
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<void> => {
  const query = `
    UPDATE users
    SET two_factor_enabled = true,
        two_factor_secret = $1,
        two_factor_backup_codes = $2,
        two_factor_verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `;
  await pool.query(query, [secret, backupCodes, userId]);
};

export const disableTwoFactor = async (userId: string): Promise<void> => {
  const query = `
    UPDATE users
    SET two_factor_enabled = false,
        two_factor_secret = NULL,
        two_factor_backup_codes = NULL,
        two_factor_verified_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;
  await pool.query(query, [userId]);
};

export const getTwoFactorStatus = async (
  userId: string
): Promise<{
  enabled: boolean;
  secret: string | null;
  backupCodes: string[];
  verifiedAt: Date | null;
}> => {
  const query = `
    SELECT two_factor_enabled, two_factor_secret, two_factor_backup_codes, two_factor_verified_at
    FROM users
    WHERE id = $1
  `;
  const result: QueryResult = await pool.query(query, [userId]);

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const row = result.rows[0];
  return {
    enabled: row.two_factor_enabled || false,
    secret: row.two_factor_secret,
    backupCodes: row.two_factor_backup_codes || [],
    verifiedAt: row.two_factor_verified_at,
  };
};

export const removeBackupCode = async (
  userId: string,
  codeIndex: number
): Promise<void> => {
  const query = `
    UPDATE users
    SET two_factor_backup_codes = array_remove(
      two_factor_backup_codes, 
      two_factor_backup_codes[$1]
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await pool.query(query, [codeIndex + 1, userId]);
};

export const regenerateBackupCodes = async (
  userId: string,
  newBackupCodes: string[]
): Promise<void> => {
  const query = `
    UPDATE users
    SET two_factor_backup_codes = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;
  await pool.query(query, [newBackupCodes, userId]);
};

export const createTempToken = async (
  userId: string,
  token: string,
  expiresInMinutes: number = 10,
  ipAddress: string | null = null,
  userAgent: string | null = null
): Promise<TwoFactorTempToken> => {
  const query = `
    INSERT INTO two_factor_temp_tokens (user_id, temp_token, expires_at, ip_address, user_agent)
    VALUES ($1, $2, NOW() + INTERVAL '${expiresInMinutes} minutes', $3, $4)
    RETURNING *
  `;
  const result: QueryResult = await pool.query(query, [userId, token, ipAddress, userAgent]);
  return result.rows[0];
};

export const verifyTempToken = async (token: string): Promise<TwoFactorTempToken | null> => {
  const query = `
    SELECT * FROM two_factor_temp_tokens
    WHERE temp_token = $1
      AND expires_at > NOW()
      AND verified = false
  `;
  const result: QueryResult = await pool.query(query, [token]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const markTempTokenVerified = async (token: string): Promise<void> => {
  const query = `
    UPDATE two_factor_temp_tokens
    SET verified = true
    WHERE temp_token = $1
  `;
  await pool.query(query, [token]);
};

export const deleteExpiredTempTokens = async (): Promise<void> => {
  const query = `
    DELETE FROM two_factor_temp_tokens
    WHERE expires_at < NOW()
  `;
  await pool.query(query);
};

export const deleteUserTempTokens = async (userId: string): Promise<void> => {
  const query = `
    DELETE FROM two_factor_temp_tokens
    WHERE user_id = $1
  `;
  await pool.query(query, [userId]);
};