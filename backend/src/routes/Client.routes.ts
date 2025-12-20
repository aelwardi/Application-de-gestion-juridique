import { Router } from 'express';
import { ClientController } from '../controllers/Client.controller';

const router = Router();

router.post('/', ClientController.create);
router.get('/', ClientController.findAll);
router.get('/email/:email', ClientController.findByEmail);
router.get('/:id', ClientController.findById);
router.put('/:id', ClientController.update);
router.delete('/:id', ClientController.delete);

export default router;