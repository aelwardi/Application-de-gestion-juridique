import { Router, Request, Response } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import * as conflictService from '../services/conflict.service';
import * as routeOptimizerService from '../services/route-optimizer.service';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes statistiques et spéciales (avant les routes avec :id)
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/today', appointmentController.getTodayAppointments);

// Routes de conflits et disponibilités
router.post('/check-conflicts', async (req: Request, res: Response) => {
  try {
    const { lawyer_id, start_time, end_time, exclude_id } = req.body;
    const conflicts = await conflictService.checkConflicts(lawyer_id, start_time, end_time, exclude_id);
    res.json({ success: true, conflicts, hasConflict: conflicts.length > 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification des conflits' });
  }
});

router.get('/available-slots', async (req: Request, res: Response) => {
  try {
    const { lawyer_id, date, duration } = req.query;
    const slots = await conflictService.findAvailableSlots(
      lawyer_id as string,
      date as string,
      duration ? parseInt(duration as string) : 60
    );
    res.json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la recherche de créneaux' });
  }
});

// Route d'optimisation d'itinéraire
router.get('/optimize-route', async (req: Request, res: Response) => {
  try {
    const { lawyer_id, date } = req.query;
    const result = await routeOptimizerService.optimizeRoute(lawyer_id as string, date as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'optimisation de l\'itinéraire' });
  }
});

// Routes avec paramètres spécifiques
router.get('/lawyer/:lawyerId', appointmentController.getAppointmentsByLawyer);
router.get('/client/:clientId', appointmentController.getAppointmentsByClient);
router.get('/case/:caseId', appointmentController.getAppointmentsByCase);

// Routes CRUD pour les rendez-vous
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

// Routes d'actions spécifiques
router.post('/:id/cancel', appointmentController.cancelAppointment);
router.post('/:id/confirm', appointmentController.confirmAppointment);
router.post('/:id/complete', appointmentController.completeAppointment);

export default router;