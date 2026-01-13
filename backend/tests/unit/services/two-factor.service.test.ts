import * as twoFactorService from '../../../src/services/two-factor.service';
import * as twoFactorQueries from '../../../src/database/queries/two-factor.queries';
import * as twoFactorUtil from '../../../src/utils/two-factor.util';
import * as authQueries from '../../../src/database/queries/auth.queries';
import * as emailUtil from '../../../src/utils/email.util';
import bcrypt from 'bcrypt';

jest.mock('../../../src/database/queries/two-factor.queries');
jest.mock('../../../src/utils/two-factor.util');
jest.mock('../../../src/database/queries/auth.queries');
jest.mock('../../../src/utils/email.util');
jest.mock('bcrypt');

describe('TwoFactorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setupTwoFactor', () => {
    it('should generate 2FA setup successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
      };

      const mockSetup = {
        secret: 'MOCK_SECRET',
        qrCodeUrl: 'data:image/png;base64,mockQRCode',
        backupCodes: ['12345678', '87654321'],
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (twoFactorUtil.generateTwoFactorSecret as jest.Mock).mockResolvedValue(mockSetup);
      (twoFactorUtil.formatBackupCode as jest.Mock).mockImplementation(code => `${code.slice(0, 4)}-${code.slice(4)}`);

      const result = await twoFactorService.setupTwoFactor('user-123');

      expect(authQueries.findUserById).toHaveBeenCalledWith('user-123');
      expect(twoFactorUtil.generateTwoFactorSecret).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({
        qrCodeUrl: mockSetup.qrCodeUrl,
        secret: mockSetup.secret,
        backupCodes: ['1234-5678', '8765-4321'],
      });
    });

    it('should throw error if user not found', async () => {
      (authQueries.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(twoFactorService.setupTwoFactor('user-123')).rejects.toThrow('User not found');
    });
  });

  describe('enableTwoFactor', () => {
    it('should enable 2FA successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
      };

      const backupCodes = ['1234-5678', '8765-4321'];
      const hashedBackupCodes = ['hashed1', 'hashed2'];

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (twoFactorUtil.verifyTwoFactorCode as jest.Mock).mockReturnValue(true);
      (twoFactorUtil.hashBackupCodes as jest.Mock).mockResolvedValue(hashedBackupCodes);
      (twoFactorQueries.enableTwoFactor as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendTwoFactorEnabledEmail as jest.Mock).mockResolvedValue(undefined);

      await twoFactorService.enableTwoFactor('user-123', 'MOCK_SECRET', '123456', backupCodes);

      expect(authQueries.findUserById).toHaveBeenCalledWith('user-123');
      expect(twoFactorUtil.verifyTwoFactorCode).toHaveBeenCalledWith('MOCK_SECRET', '123456');
      expect(twoFactorUtil.hashBackupCodes).toHaveBeenCalledWith(backupCodes);
      expect(twoFactorQueries.enableTwoFactor).toHaveBeenCalledWith('user-123', 'MOCK_SECRET', hashedBackupCodes);
      expect(emailUtil.sendTwoFactorEnabledEmail).toHaveBeenCalledWith('test@example.com', 'John');
    });

    it('should throw error if user not found', async () => {
      (authQueries.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        twoFactorService.enableTwoFactor('user-123', 'SECRET', '123456', [])
      ).rejects.toThrow('User not found');
    });

    it('should throw error if verification code is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (twoFactorUtil.verifyTwoFactorCode as jest.Mock).mockReturnValue(false);

      await expect(
        twoFactorService.enableTwoFactor('user-123', 'SECRET', '123456', [])
      ).rejects.toThrow('Invalid verification code');
    });

    it('should handle email sending failure gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (twoFactorUtil.verifyTwoFactorCode as jest.Mock).mockReturnValue(true);
      (twoFactorUtil.hashBackupCodes as jest.Mock).mockResolvedValue(['hashed']);
      (twoFactorQueries.enableTwoFactor as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendTwoFactorEnabledEmail as jest.Mock).mockRejectedValue(new Error('Email failed'));

      await expect(
        twoFactorService.enableTwoFactor('user-123', 'SECRET', '123456', ['code'])
      ).resolves.not.toThrow();
    });

    it('should enable 2FA even if email sending fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (twoFactorUtil.verifyTwoFactorCode as jest.Mock).mockReturnValue(true);
      (twoFactorUtil.hashBackupCodes as jest.Mock).mockResolvedValue([]);
      (twoFactorQueries.enableTwoFactor as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendTwoFactorEnabledEmail as jest.Mock).mockRejectedValue(new Error('Email error'));

      await expect(
        twoFactorService.enableTwoFactor('user-123', 'SECRET', '123456', [])
      ).resolves.not.toThrow();
    });
  });

  describe('disableTwoFactor', () => {
    it('should disable 2FA successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        password_hash: 'hashed_password',
      };

      const mockStatus = {
        enabled: true,
        verifiedAt: new Date(),
        backupCodesCount: 5,
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue(mockStatus);
      (twoFactorQueries.disableTwoFactor as jest.Mock).mockResolvedValue(undefined);
      (emailUtil.sendTwoFactorDisabledEmail as jest.Mock).mockResolvedValue(undefined);

      await twoFactorService.disableTwoFactor('user-123', 'correct_password');

      expect(authQueries.findUserById).toHaveBeenCalledWith('user-123');
      expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', 'hashed_password');
      expect(twoFactorQueries.getTwoFactorStatus).toHaveBeenCalledWith('user-123');
      expect(twoFactorQueries.disableTwoFactor).toHaveBeenCalledWith('user-123');
      expect(emailUtil.sendTwoFactorDisabledEmail).toHaveBeenCalledWith('test@example.com', 'John');
    });

    it('should throw error if user not found', async () => {
      (authQueries.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        twoFactorService.disableTwoFactor('user-123', 'password')
      ).rejects.toThrow('User not found');
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        twoFactorService.disableTwoFactor('user-123', 'wrong_password')
      ).rejects.toThrow('Invalid password');
    });

    it('should throw error if 2FA is not enabled', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
      };

      const mockStatus = {
        enabled: false,
        verifiedAt: null,
        backupCodesCount: 0,
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue(mockStatus);

      await expect(
        twoFactorService.disableTwoFactor('user-123', 'correct_password')
      ).rejects.toThrow('2FA is not enabled');
    });
  });

  describe('getTwoFactorStatus', () => {
    it('should get 2FA status', async () => {
      const mockStatus = {
        enabled: true,
        verifiedAt: new Date(),
        backupCodesCount: 5,
      };

      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue(mockStatus);

      const result = await twoFactorService.getTwoFactorStatus('user-123');

      expect(twoFactorQueries.getTwoFactorStatus).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockStatus = {
        enabled: true,
        verifiedAt: new Date(),
        backupCodes: ['old1', 'old2'],
        secret: 'SECRET',
      };

      const hashedCodes = ['hashed1', 'hashed2'];

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue(mockStatus);
      (twoFactorUtil.hashBackupCodes as jest.Mock).mockResolvedValue(hashedCodes);
      (twoFactorQueries.regenerateBackupCodes as jest.Mock).mockResolvedValue(undefined);
      (twoFactorUtil.formatBackupCode as jest.Mock).mockImplementation(code => `${code.slice(0, 4)}-${code.slice(4)}`);

      const result = await twoFactorService.regenerateBackupCodes('user-123');

      expect(result).toHaveLength(8);
      expect(twoFactorQueries.regenerateBackupCodes).toHaveBeenCalledWith('user-123', hashedCodes);
    });

    it('should throw error if user not found', async () => {
      (authQueries.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        twoFactorService.regenerateBackupCodes('user-123')
      ).rejects.toThrow('User not found');
    });

    it('should throw error if 2FA is not enabled', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockStatus = {
        enabled: false,
        verifiedAt: null,
        backupCodes: [],
        secret: null,
      };

      (authQueries.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue(mockStatus);

      await expect(
        twoFactorService.regenerateBackupCodes('user-123')
      ).rejects.toThrow('2FA is not enabled');
    });
  });

  describe('verifyLoginCode', () => {
    it('should verify 2FA code and return valid result', async () => {
      const mockTempToken = {
        id: 'temp-123',
        user_id: 'user-123',
        is_verified: false,
        expires_at: new Date(Date.now() + 600000),
      };

      const mockStatus = {
        enabled: true,
        secret: 'SECRET',
        backupCodes: [],
        verifiedAt: new Date(),
      };

      (twoFactorQueries.verifyTempToken as jest.Mock).mockResolvedValue(mockTempToken);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue(mockStatus);
      (twoFactorUtil.verifyTwoFactorCode as jest.Mock).mockReturnValue(true);
      (twoFactorQueries.markTempTokenVerified as jest.Mock).mockResolvedValue(undefined);

      const result = await twoFactorService.verifyLoginCode('temp-token', '123456');

      expect(twoFactorQueries.verifyTempToken).toHaveBeenCalledWith('temp-token');
      expect(twoFactorUtil.verifyTwoFactorCode).toHaveBeenCalledWith('SECRET', '123456');
      expect(twoFactorQueries.markTempTokenVerified).toHaveBeenCalledWith('temp-token');
      expect(result).toEqual({ valid: true, userId: 'user-123' });
    });

    it('should return invalid if temp token is null', async () => {
      (twoFactorQueries.verifyTempToken as jest.Mock).mockResolvedValue(null);

      const result = await twoFactorService.verifyLoginCode('invalid-token', '123456');

      expect(result).toEqual({ valid: false, userId: null });
    });

    it('should return invalid if verification code is wrong', async () => {
      const mockTempToken = {
        id: 'temp-123',
        user_id: 'user-123',
        is_verified: false,
        expires_at: new Date(Date.now() + 600000),
      };

      const mockStatus = {
        enabled: true,
        secret: 'SECRET',
        backupCodes: [],
        verifiedAt: new Date(),
      };

      (twoFactorQueries.verifyTempToken as jest.Mock).mockResolvedValue(mockTempToken);
      (twoFactorQueries.getTwoFactorStatus as jest.Mock).mockResolvedValue(mockStatus);
      (twoFactorUtil.verifyTwoFactorCode as jest.Mock).mockReturnValue(false);
      (twoFactorUtil.verifyBackupCode as jest.Mock).mockResolvedValue({ valid: false, codeIndex: -1 });

      const result = await twoFactorService.verifyLoginCode('temp-token', '123456');

      expect(result).toEqual({ valid: false, userId: null });
    });
  });
});