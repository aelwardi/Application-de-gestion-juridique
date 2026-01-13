import { Request, Response } from 'express';
import * as twoFactorController from '../../../src/controllers/two-factor.controller';
import * as twoFactorService from '../../../src/services/two-factor.service';

jest.mock('../../../src/services/two-factor.service');

describe('TwoFactorController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {
      body: {},
      params: {},
      user: {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'client',
      },
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('setup', () => {
    it('should setup 2FA and return QR code and secret', async () => {
      const mockSetupResponse = {
        qrCodeUrl: 'data:image/png;base64,mockQRCode',
        secret: 'MOCK_SECRET_123',
        backupCodes: ['1234-5678', '8765-4321'],
      };

      (twoFactorService.setupTwoFactor as jest.Mock).mockResolvedValue(mockSetupResponse);

      await twoFactorController.setup(mockRequest as Request, mockResponse as Response);

      expect(twoFactorService.setupTwoFactor).toHaveBeenCalledWith('user-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: '2FA setup initiated',
        data: mockSetupResponse,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await twoFactorController.setup(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should handle service errors', async () => {
      (twoFactorService.setupTwoFactor as jest.Mock).mockRejectedValue(new Error('Service error'));

      await twoFactorController.setup(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to setup 2FA',
      });
    });
  });

  describe('enable', () => {
    it('should enable 2FA successfully', async () => {
      mockRequest.body = {
        secret: 'MOCK_SECRET',
        code: '123456',
        backupCodes: Array(8).fill('1234-5678'),
      };

      (twoFactorService.enableTwoFactor as jest.Mock).mockResolvedValue(undefined);

      await twoFactorController.enable(mockRequest as Request, mockResponse as Response);

      expect(twoFactorService.enableTwoFactor).toHaveBeenCalledWith(
        'user-123',
        'MOCK_SECRET',
        '123456',
        Array(8).fill('1234-5678')
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: '2FA enabled successfully',
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await twoFactorController.enable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.body = {
        secret: '',
        code: '123',
      };

      await twoFactorController.enable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
        })
      );
    });

    it('should return 400 for invalid verification code', async () => {
      mockRequest.body = {
        secret: 'MOCK_SECRET',
        code: '123456',
        backupCodes: Array(8).fill('1234-5678'),
      };

      (twoFactorService.enableTwoFactor as jest.Mock).mockRejectedValue(
        new Error('Invalid verification code')
      );

      await twoFactorController.enable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid verification code',
      });
    });

    it('should handle other service errors', async () => {
      mockRequest.body = {
        secret: 'MOCK_SECRET',
        code: '123456',
        backupCodes: Array(8).fill('1234-5678'),
      };

      (twoFactorService.enableTwoFactor as jest.Mock).mockRejectedValue(new Error('Database error'));

      await twoFactorController.enable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to enable 2FA',
      });
    });
  });

  describe('disable', () => {
    it('should disable 2FA successfully', async () => {
      mockRequest.body = {
        password: 'correct_password',
      };

      (twoFactorService.disableTwoFactor as jest.Mock).mockResolvedValue(undefined);

      await twoFactorController.disable(mockRequest as Request, mockResponse as Response);

      expect(twoFactorService.disableTwoFactor).toHaveBeenCalledWith('user-123', 'correct_password');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: '2FA disabled successfully',
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await twoFactorController.disable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.body = {
        password: '',
      };

      await twoFactorController.disable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
        })
      );
    });

    it('should return 400 for invalid password', async () => {
      mockRequest.body = {
        password: 'wrong_password',
      };

      (twoFactorService.disableTwoFactor as jest.Mock).mockRejectedValue(new Error('Invalid password'));

      await twoFactorController.disable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid password',
      });
    });

    it('should return 400 if 2FA is not enabled', async () => {
      mockRequest.body = {
        password: 'correct_password',
      };

      (twoFactorService.disableTwoFactor as jest.Mock).mockRejectedValue(
        new Error('2FA is not enabled')
      );

      await twoFactorController.disable(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: '2FA is not enabled',
      });
    });
  });

  describe('verify', () => {
    it('should verify 2FA code successfully', async () => {
      mockRequest.body = {
        tempToken: 'temp-token-123',
        code: '123456',
      };

      const mockVerifyResponse = {
        valid: true,
        userId: 'user-123',
      };

      (twoFactorService.verifyLoginCode as jest.Mock).mockResolvedValue(mockVerifyResponse);

      await twoFactorController.verify(mockRequest as Request, mockResponse as Response);

      expect(twoFactorService.verifyLoginCode).toHaveBeenCalledWith('temp-token-123', '123456');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: '2FA verification successful',
        data: mockVerifyResponse,
      });
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.body = {
        tempToken: '',
        code: '',
      };

      await twoFactorController.verify(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
        })
      );
    });

    it('should return 401 for invalid code', async () => {
      mockRequest.body = {
        tempToken: 'temp-token-123',
        code: '123456',
      };

      (twoFactorService.verifyLoginCode as jest.Mock).mockRejectedValue(
        new Error('Invalid verification code')
      );

      await twoFactorController.verify(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid verification code',
      });
    });

    it('should return 401 for expired token', async () => {
      mockRequest.body = {
        tempToken: 'temp-token-123',
        code: '123456',
      };

      (twoFactorService.verifyLoginCode as jest.Mock).mockRejectedValue(
        new Error('Temporary token expired')
      );

      await twoFactorController.verify(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Temporary token expired',
      });
    });
  });

  describe('getStatus', () => {
    it('should return 2FA status', async () => {
      const mockStatus = {
        enabled: true,
        verifiedAt: new Date('2024-01-01'),
        backupCodesCount: 5,
      };

      (twoFactorService.getStatus as jest.Mock).mockResolvedValue(mockStatus);

      await twoFactorController.getStatus(mockRequest as Request, mockResponse as Response);

      expect(twoFactorService.getStatus).toHaveBeenCalledWith('user-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockStatus,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await twoFactorController.getStatus(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes successfully', async () => {
      const mockNewCodes = ['1111-2222', '3333-4444'];

      (twoFactorService.regenerateBackupCodes as jest.Mock).mockResolvedValue(mockNewCodes);

      await twoFactorController.regenerateBackupCodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(twoFactorService.regenerateBackupCodes).toHaveBeenCalledWith('user-123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Backup codes regenerated successfully',
        data: { backupCodes: mockNewCodes },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await twoFactorController.regenerateBackupCodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return 400 if 2FA is not enabled', async () => {
      (twoFactorService.regenerateBackupCodes as jest.Mock).mockRejectedValue(
        new Error('2FA is not enabled')
      );

      await twoFactorController.regenerateBackupCodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: '2FA is not enabled',
      });
    });
  });
});

