import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes statistiques et spéciales (avant les routes avec :id)
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/today', appointmentController.getTodayAppointments);

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
