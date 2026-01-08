import { Router, Request, Response } from 'express';
import { appointmentController, uploadMiddleware } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import * as conflictService from '../services/conflict.service';
import * as routeOptimizerService from '../services/route-optimizer.service';
import * as recurrenceService from '../services/recurrence.service';

const router = Router();

router.use(authenticate);

router.get('/stats', appointmentController.getAppointmentStats);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/today', appointmentController.getTodayAppointments);

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

router.get('/optimize-route', async (req: Request, res: Response) => {
  try {
    const { lawyer_id, date } = req.query;
    const result = await routeOptimizerService.optimizeRoute(lawyer_id as string, date as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'optimisation de l\'itinéraire' });
  }
});

router.post('/recurring', async (req: Request, res: Response) => {
  try {
    const result = await recurrenceService.createRecurringAppointments(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création de rendez-vous récurrents' });
  }
});

router.put('/recurring/:seriesId', async (req: Request, res: Response) => {
  try {
    const { seriesId } = req.params;
    const result = await recurrenceService.updateRecurringSeries(seriesId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la série' });
  }
});

router.delete('/recurring/:seriesId', async (req: Request, res: Response) => {
  try {
    const { seriesId } = req.params;
    const result = await recurrenceService.deleteRecurringSeries(seriesId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la série' });
  }
});

router.get('/recurring/:seriesId', async (req: Request, res: Response) => {
  try {
    const { seriesId } = req.params;
    const appointments = await recurrenceService.getSeriesAppointments(seriesId);
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la série' });
  }
});

router.get('/lawyer/:lawyerId', appointmentController.getAppointmentsByLawyer);
router.get('/client/:clientId', appointmentController.getAppointmentsByClient);
router.get('/case/:caseId', appointmentController.getAppointmentsByCase);

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

router.post('/:id/cancel', appointmentController.cancelAppointment);
router.post('/:id/confirm', appointmentController.confirmAppointment);
router.post('/:id/complete', appointmentController.completeAppointment);

router.post('/:id/documents', uploadMiddleware, appointmentController.uploadAppointmentDocument);
router.get('/:id/documents', appointmentController.getAppointmentDocuments);
router.delete('/:id/documents/:docId', appointmentController.deleteAppointmentDocument);

router.get('/:id/notes', appointmentController.getAppointmentNotes);
router.put('/:id/notes', appointmentController.updateAppointmentNotes);

export default router;