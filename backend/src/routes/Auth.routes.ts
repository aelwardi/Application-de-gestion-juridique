import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';

const router = Router();

router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/verify', AuthController.verifyToken);

export default router;