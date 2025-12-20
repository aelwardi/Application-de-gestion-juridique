import { Router } from 'express';
import { AvocatController } from '../controllers/Avocat.controller';

const router = Router();

router.post('/', AvocatController.create);
router.get('/', AvocatController.findAll);
router.get('/email/:email', AvocatController.findByEmail); // Nouvelle route
router.get('/:id', AvocatController.findById);
router.put('/:id', AvocatController.update);
router.delete('/:id', AvocatController.delete);

export default router;