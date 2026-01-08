import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();
const feedbackController = new FeedbackController();

router.post('/', authenticate, feedbackController.create.bind(feedbackController));
router.get('/my-feedback', authenticate, feedbackController.getMyFeedback.bind(feedbackController));

router.get('/', authenticate, requireAdmin, feedbackController.getAll.bind(feedbackController));
router.get('/stats', authenticate, requireAdmin, feedbackController.getStats.bind(feedbackController));
router.get('/:id', authenticate, requireAdmin, feedbackController.getById.bind(feedbackController));
router.patch('/:id/status', authenticate, requireAdmin, feedbackController.updateStatus.bind(feedbackController));
router.post('/:id/reply', authenticate, requireAdmin, feedbackController.reply.bind(feedbackController));

export default router;

