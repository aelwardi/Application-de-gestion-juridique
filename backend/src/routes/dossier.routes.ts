import { Router } from 'express';
import { dossierController } from '../controllers/dossier.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', dossierController.createCase);
router.get('/', dossierController.getAllCases);
router.get('/stats', dossierController.getCaseStats);
router.get('/upcoming-hearings', dossierController.getUpcomingHearings);
router.get('/lawyer/:lawyerId', dossierController.getCasesByLawyer);
router.get('/client/:clientId', dossierController.getCasesByClient);
router.get('/:id', dossierController.getCaseById);
router.put('/:id', dossierController.updateCase);
router.delete('/:id', dossierController.deleteCase);
router.patch('/:id/status', dossierController.updateCase);

router.post('/:id/assign-lawyer', dossierController.assignLawyer);
router.post('/:id/close', dossierController.closeCase);
router.post('/:id/archive', dossierController.archiveCase);

export default router;