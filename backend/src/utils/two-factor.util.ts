import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export const generateTwoFactorSecret = async (
  email: string,
  appName: string = 'Application Juridique'
): Promise<TwoFactorSetup> => {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${email})`,
    issuer: appName,
    length: 32,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
};

export const verifyTwoFactorCode = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
};

export const hashBackupCodes = async (codes: string[]): Promise<string[]> => {
  const bcrypt = await import('bcrypt');
  const hashedCodes = await Promise.all(
    codes.map(code => bcrypt.hash(code, 10))
  );
  return hashedCodes;
};

export const verifyBackupCode = async (
  plainCode: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; codeIndex: number }> => {
  const bcrypt = await import('bcrypt');

  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(plainCode, hashedCodes[i]);
    if (isValid) {
      return { valid: true, codeIndex: i };
    }
  }

  return { valid: false, codeIndex: -1 };
};

export const generateTempToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const formatBackupCode = (code: string): string => {
  return code.match(/.{1,4}/g)?.join('-') || code;
};