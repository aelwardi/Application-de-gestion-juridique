import { Router } from 'express';
import * as twoFactorController from '../controllers/two-factor.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * All 2FA routes require authentication except verify
 */

router.post('/setup', authenticate, twoFactorController.setup);

router.post('/enable', authenticate, twoFactorController.enable);

router.post('/disable', authenticate, twoFactorController.disable);

router.get('/status', authenticate, twoFactorController.getStatus);

router.post('/verify', twoFactorController.verify);

router.post('/regenerate-backup-codes', authenticate, twoFactorController.regenerateBackupCodes);

export default router;