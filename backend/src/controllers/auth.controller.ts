import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as adminQueries from '../database/queries/admin.queries';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';
import { ZodError } from 'zod';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
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
      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.login(validatedData);

    // Logger l'activité de connexion
    try {
      await adminQueries.createActivityLog(
        result.user.id,
        'USER_LOGIN',
        'user',
        result.user.id,
        req.ip || req.socket.remoteAddress || null,
        req.get('user-agent') || null,
        { email: result.user.email, role: result.user.role }
      );
    } catch (logError) {
      console.error('Failed to log USER_LOGIN activity:', logError);
    }

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
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

    if (error instanceof Error) {
      if (error.message.includes('Invalid email or password') ||
          error.message.includes('deactivated')) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to login',
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Logger l'activité de déconnexion si l'utilisateur est authentifié
    if (req.user?.userId) {
      try {
        await adminQueries.createActivityLog(
          req.user.userId,
          'USER_LOGOUT',
          'user',
          req.user.userId,
          req.ip || req.socket.remoteAddress || null,
          req.get('user-agent') || null,
          { email: req.user.email, role: req.user.role }
        );
      } catch (logError) {
        console.error('Failed to log USER_LOGOUT activity:', logError);
      }
    }

    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = await authService.getProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/me
 */
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const user = await authService.updateProfile(req.user.userId, validatedData);

    // Logger l'activité de mise à jour de profil
    try {
      await adminQueries.createActivityLog(
        req.user.userId,
        'PROFILE_UPDATED',
        'user',
        req.user.userId,
        req.ip || req.socket.remoteAddress || null,
        req.get('user-agent') || null,
        { updated_fields: Object.keys(validatedData) }
      );
    } catch (logError) {
      console.error('Failed to log PROFILE_UPDATED activity:', logError);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
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

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

/**
 * Change password
 * PATCH /api/auth/me/password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const validatedData = changePasswordSchema.parse(req.body);

    await authService.changePassword(req.user.userId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
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
      if (error.message.includes('incorrect')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
      return;
    }

    await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};