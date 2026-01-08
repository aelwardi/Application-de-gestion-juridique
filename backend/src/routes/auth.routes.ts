import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Public routes
 */
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/2fa/complete', authController.completeTwoFactorLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

/**
 * Protected routes (require authentication)
 */
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);
router.patch('/me/password', authenticate, authController.changePassword);

export default router;