import * as twoFactorUtil from '../../../src/utils/two-factor.util';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('bcrypt');
jest.mock('crypto');

describe('TwoFactorUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTwoFactorSecret', () => {
    it('should generate 2FA secret with QR code and backup codes', async () => {
      const mockSecret = {
        base32: 'MOCK_BASE32_SECRET',
        otpauth_url: 'otpauth://totp/App%20(test@example.com)?secret=MOCK_BASE32_SECRET',
      };

      (speakeasy.generateSecret as jest.Mock).mockReturnValue(mockSecret);
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mockQRCode');
      (crypto.randomBytes as jest.Mock).mockImplementation(() => ({
        toString: jest.fn().mockReturnValue('abcd1234'),
      }));

      const result = await twoFactorUtil.generateTwoFactorSecret('test@example.com');

      expect(speakeasy.generateSecret).toHaveBeenCalledWith({
        name: 'Application Juridique (test@example.com)',
        issuer: 'Application Juridique',
        length: 32,
      });
      expect(QRCode.toDataURL).toHaveBeenCalledWith(mockSecret.otpauth_url);
      expect(result).toHaveProperty('secret', 'MOCK_BASE32_SECRET');
      expect(result).toHaveProperty('qrCodeUrl', 'data:image/png;base64,mockQRCode');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(8);
    });

    it('should generate 2FA secret with custom app name', async () => {
      const mockSecret = {
        base32: 'MOCK_SECRET',
        otpauth_url: 'otpauth://totp/CustomApp',
      };

      (speakeasy.generateSecret as jest.Mock).mockReturnValue(mockSecret);
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('qr-code');
      (crypto.randomBytes as jest.Mock).mockImplementation(() => ({
        toString: jest.fn().mockReturnValue('12345678'),
      }));

      const result = await twoFactorUtil.generateTwoFactorSecret('test@example.com', 'CustomApp');

      expect(speakeasy.generateSecret).toHaveBeenCalledWith({
        name: 'CustomApp (test@example.com)',
        issuer: 'CustomApp',
        length: 32,
      });
    });

    it('should handle missing otpauth_url', async () => {
      const mockSecret = {
        base32: 'MOCK_SECRET',
        otpauth_url: undefined,
      };

      (speakeasy.generateSecret as jest.Mock).mockReturnValue(mockSecret);
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('qr-code');
      (crypto.randomBytes as jest.Mock).mockImplementation(() => ({
        toString: jest.fn().mockReturnValue('12345678'),
      }));

      const result = await twoFactorUtil.generateTwoFactorSecret('test@example.com');

      expect(QRCode.toDataURL).toHaveBeenCalledWith('');
      expect(result).toHaveProperty('secret');
    });
  });

  describe('verifyTwoFactorCode', () => {
    it('should verify valid 2FA code', () => {
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const result = twoFactorUtil.verifyTwoFactorCode('MOCK_SECRET', '123456');

      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'MOCK_SECRET',
        encoding: 'base32',
        token: '123456',
        window: 2,
      });
      expect(result).toBe(true);
    });

    it('should reject invalid 2FA code', () => {
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      const result = twoFactorUtil.verifyTwoFactorCode('MOCK_SECRET', '000000');

      expect(result).toBe(false);
    });

    it('should use time window of 2', () => {
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      twoFactorUtil.verifyTwoFactorCode('SECRET', '123456');

      expect(speakeasy.totp.verify).toHaveBeenCalledWith(
        expect.objectContaining({ window: 2 })
      );
    });
  });

  describe('hashBackupCodes', () => {
    it('should hash all backup codes', async () => {
      const codes = ['1234-5678', '8765-4321', '1111-2222'];
      const hashedCodes = ['hash1', 'hash2', 'hash3'];

      (bcrypt.hash as jest.Mock).mockImplementation((code, rounds) =>
        Promise.resolve(`hashed_${code}`)
      );

      const result = await twoFactorUtil.hashBackupCodes(codes);

      expect(bcrypt.hash).toHaveBeenCalledTimes(3);
      expect(bcrypt.hash).toHaveBeenCalledWith('1234-5678', 10);
      expect(bcrypt.hash).toHaveBeenCalledWith('8765-4321', 10);
      expect(bcrypt.hash).toHaveBeenCalledWith('1111-2222', 10);
      expect(result).toHaveLength(3);
    });

    it('should handle empty array', async () => {
      const result = await twoFactorUtil.hashBackupCodes([]);

      expect(result).toEqual([]);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('verifyBackupCode', () => {
    it('should find and verify valid backup code', async () => {
      const hashedCodes = ['hash1', 'hash2', 'hash3'];

      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result = await twoFactorUtil.verifyBackupCode('plain-code', hashedCodes);

      expect(bcrypt.compare).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ valid: true, codeIndex: 1 });
    });

    it('should return invalid if no code matches', async () => {
      const hashedCodes = ['hash1', 'hash2', 'hash3'];

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await twoFactorUtil.verifyBackupCode('wrong-code', hashedCodes);

      expect(bcrypt.compare).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ valid: false, codeIndex: -1 });
    });

    it('should handle empty hashed codes array', async () => {
      const result = await twoFactorUtil.verifyBackupCode('code', []);

      expect(result).toEqual({ valid: false, codeIndex: -1 });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return first matching code index', async () => {
      const hashedCodes = ['hash1', 'hash2', 'hash3', 'hash4'];

      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result = await twoFactorUtil.verifyBackupCode('code', hashedCodes);

      expect(result).toEqual({ valid: true, codeIndex: 3 });
    });
  });

  describe('generateTempToken', () => {
    it('should generate random token', () => {
      const mockBuffer = Buffer.from('mock-random-bytes');
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockBuffer);

      const result = twoFactorUtil.generateTempToken();

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(typeof result).toBe('string');
    });

    it('should generate different tokens on multiple calls', () => {
      let counter = 0;
      (crypto.randomBytes as jest.Mock).mockImplementation(() => {
        counter++;
        return Buffer.from(`random-bytes-${counter}`);
      });

      const token1 = twoFactorUtil.generateTempToken();
      const token2 = twoFactorUtil.generateTempToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('formatBackupCode', () => {
    it('should format 8-character code with dash', () => {
      const result = twoFactorUtil.formatBackupCode('12345678');

      expect(result).toBe('1234-5678');
    });

    it('should format code into 4-character groups', () => {
      const result = twoFactorUtil.formatBackupCode('ABCDEFGH');

      expect(result).toBe('ABCD-EFGH');
    });

    it('should handle codes with odd length', () => {
      const result = twoFactorUtil.formatBackupCode('123456789');

      expect(result).toBe('1234-5678-9');
    });

    it('should handle short codes', () => {
      const result = twoFactorUtil.formatBackupCode('123');

      expect(result).toBe('123');
    });

    it('should handle empty string', () => {
      const result = twoFactorUtil.formatBackupCode('');

      expect(result).toBe('');
    });

    it('should handle 12-character code', () => {
      const result = twoFactorUtil.formatBackupCode('123456789012');

      expect(result).toBe('1234-5678-9012');
    });
  });
});