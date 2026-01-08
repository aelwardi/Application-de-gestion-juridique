import {
  enableTwoFactor as enableTwoFactorQuery,
  disableTwoFactor as disableTwoFactorQuery,
  getTwoFactorStatus,
  removeBackupCode,
  regenerateBackupCodes as regenerateBackupCodesQuery,
  createTempToken,
  verifyTempToken,
  markTempTokenVerified,
  deleteUserTempTokens,
} from '../database/queries/two-factor.queries';
import {
  generateTwoFactorSecret,
  verifyTwoFactorCode,
  hashBackupCodes,
  verifyBackupCode,
  generateTempToken,
  formatBackupCode,
} from '../utils/two-factor.util';
import { findUserById } from '../database/queries/auth.queries';
import { sendTwoFactorEnabledEmail, sendTwoFactorDisabledEmail } from '../utils/email.util';

export interface TwoFactorSetupResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  verifiedAt: Date | null;
  backupCodesCount: number;
}

/**
 * Setup 2FA - Generate secret and QR code
 */
export const setupTwoFactor = async (userId: string): Promise<TwoFactorSetupResponse> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const twoFactorSetup = await generateTwoFactorSecret(user.email);

  return {
    qrCodeUrl: twoFactorSetup.qrCodeUrl,
    secret: twoFactorSetup.secret,
    backupCodes: twoFactorSetup.backupCodes.map(formatBackupCode),
  };
};

/**
 * Enable 2FA after verifying the initial code
 */
export const enableTwoFactor = async (
  userId: string,
  secret: string,
  code: string,
  backupCodes: string[]
): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isValid = verifyTwoFactorCode(secret, code);
  if (!isValid) {
    throw new Error('Invalid verification code');
  }

  const hashedBackupCodes = await hashBackupCodes(backupCodes);

  await enableTwoFactorQuery(userId, secret, hashedBackupCodes);

  sendTwoFactorEnabledEmail(user.email, user.first_name).catch(err => {
    console.error('Failed to send 2FA enabled email:', err);
  });
};

/**
 * Disable 2FA
 */
export const disableTwoFactor = async (userId: string, password: string): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const bcrypt = await import('bcrypt');
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const status = await getTwoFactorStatus(userId);
  if (!status.enabled) {
    throw new Error('2FA is not enabled');
  }

  await disableTwoFactorQuery(userId);

  sendTwoFactorDisabledEmail(user.email, user.first_name).catch(err => {
    console.error('Failed to send 2FA disabled email:', err);
  });
};

/**
 * Get 2FA status
 */
export const getStatus = async (userId: string): Promise<TwoFactorStatusResponse> => {
  const status = await getTwoFactorStatus(userId);

  return {
    enabled: status.enabled,
    verifiedAt: status.verifiedAt,
    backupCodesCount: status.backupCodes.length,
  };
};

/**
 * Verify 2FA code during login
 */
export const verifyLoginCode = async (
  tempToken: string,
  code: string
): Promise<{ valid: boolean; userId: string | null }> => {
  const tokenData = await verifyTempToken(tempToken);

  if (!tokenData) {
    return { valid: false, userId: null };
  }

  const status = await getTwoFactorStatus(tokenData.user_id);

  if (!status.enabled || !status.secret) {
    return { valid: false, userId: null };
  }

  const isValidTotp = verifyTwoFactorCode(status.secret, code);

  if (isValidTotp) {
    await markTempTokenVerified(tempToken);
    return { valid: true, userId: tokenData.user_id };
  }

  const backupResult = await verifyBackupCode(code.replace('-', ''), status.backupCodes);

  if (backupResult.valid) {
    await markTempTokenVerified(tempToken);
    await removeBackupCode(tokenData.user_id, backupResult.codeIndex);
    return { valid: true, userId: tokenData.user_id };
  }

  return { valid: false, userId: null };
};

/**
 * Create temporary token for 2FA login flow
 */
export const createLoginTempToken = async (
  userId: string,
  ipAddress: string | null = null,
  userAgent: string | null = null
): Promise<string> => {
  const token = generateTempToken();
  await createTempToken(userId, token, 10, ipAddress, userAgent);
  return token;
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (userId: string): Promise<string[]> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const status = await getTwoFactorStatus(userId);
  if (!status.enabled) {
    throw new Error('2FA is not enabled');
  }

  const crypto = await import('crypto');
  const newBackupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  const hashedBackupCodes = await hashBackupCodes(newBackupCodes);
  await regenerateBackupCodesQuery(userId, hashedBackupCodes);

  return newBackupCodes.map(formatBackupCode);
};

/**
 * Clean up user's temp tokens
 */
export const cleanupUserTokens = async (userId: string): Promise<void> => {
  await deleteUserTempTokens(userId);
};