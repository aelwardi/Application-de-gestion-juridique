import { Request, Response } from 'express';
import * as twoFactorService from '../services/two-factor.service';
import { ZodError, z } from 'zod';

const enableTwoFactorSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
  backupCodes: z.array(z.string()).min(8, 'Backup codes are required'),
});

const disableTwoFactorSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

const verifyCodeSchema = z.object({
  tempToken: z.string().min(1, 'Temporary token is required'),
  code: z.string().min(1, 'Code is required'),
});

/**
 * Setup 2FA - Generate QR code and secret
 * POST /api/auth/2fa/setup
 */
export const setup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const result = await twoFactorService.setupTwoFactor(userId);

    res.status(200).json({
      success: true,
      message: '2FA setup initiated',
      data: result,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA',
    });
  }
};

/**
 * Enable 2FA after verifying the code
 * POST /api/auth/2fa/enable
 */
export const enable = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const validatedData = enableTwoFactorSchema.parse(req.body);

    await twoFactorService.enableTwoFactor(
      userId,
      validatedData.secret,
      validatedData.code,
      validatedData.backupCodes
    );

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof Error) {
      if (error.message.includes('Invalid verification code')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA',
    });
  }
};

/**
 * Disable 2FA
 * POST /api/auth/2fa/disable
 */
export const disable = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const validatedData = disableTwoFactorSchema.parse(req.body);

    await twoFactorService.disableTwoFactor(userId, validatedData.password);

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof Error) {
      if (error.message.includes('Invalid password')) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error.message.includes('not enabled')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
    });
  }
};

/**
 * Get 2FA status
 * GET /api/auth/2fa/status
 */
export const getStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const status = await twoFactorService.getStatus(userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get 2FA status',
    });
  }
};

/**
 * Verify 2FA code during login
 * POST /api/auth/2fa/verify
 */
export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = verifyCodeSchema.parse(req.body);

    const result = await twoFactorService.verifyLoginCode(
      validatedData.tempToken,
      validatedData.code
    );

    if (!result.valid || !result.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired code',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '2FA verification successful',
      data: {
        userId: result.userId,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('2FA verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA code',
    });
  }
};

/**
 * Regenerate backup codes
 * POST /api/auth/2fa/regenerate-backup-codes
 */
export const regenerateBackupCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const backupCodes = await twoFactorService.regenerateBackupCodes(userId);

    res.status(200).json({
      success: true,
      message: 'Backup codes regenerated successfully',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not enabled')) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('2FA regenerate backup codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate backup codes',
    });
  }
};