import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as lawyerRequestController from '../controllers/lawyer-request.controller';

const router = Router();

/**
 * Routes pour les demandes avocat-client
 */

router.post('/', authenticate, lawyerRequestController.createLawyerRequest);

router.get('/:id', authenticate, lawyerRequestController.getLawyerRequestById);

router.get('/client/:clientId', authenticate, lawyerRequestController.getClientRequests);

router.get('/client/:clientId/stats', authenticate, lawyerRequestController.getClientRequestStats);

router.get('/lawyer/:lawyerId', authenticate, lawyerRequestController.getLawyerRequests);

router.get('/lawyer/:lawyerId/stats', authenticate, lawyerRequestController.getLawyerRequestStats);

router.post('/:id/accept', authenticate, lawyerRequestController.acceptRequest);

router.post('/:id/reject', authenticate, lawyerRequestController.rejectRequest);

router.post('/:id/cancel', authenticate, lawyerRequestController.cancelRequest);

router.delete('/:id', authenticate, lawyerRequestController.deleteLawyerRequest);

export default router;