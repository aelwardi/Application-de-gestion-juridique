import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { autoCompleteAppointments, getAppointmentsToComplete } from '../jobs/auto-complete-appointments.job';

const router = Router();

// Protéger toutes les routes avec l'authentification
router.use(authenticate);

/**
 * Forcer la complétion automatique des rendez-vous passés
 * POST /api/jobs/auto-complete-appointments
 * Accessible uniquement aux admins
 */
router.post('/auto-complete-appointments', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Accès non autorisé - Réservé aux administrateurs'
      });
      return;
    }

    console.log('🔄 Exécution manuelle du job de complétion automatique...');
    const count = await autoCompleteAppointments();

    res.status(200).json({
      success: true,
      message: `${count} rendez-vous marqué(s) comme terminé(s)`,
      data: { count }
    });
  } catch (error) {
    console.error('Error in auto-complete job:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'exécution du job',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Récupérer la liste des rendez-vous qui seront marqués comme terminés
 * GET /api/jobs/appointments-to-complete
 */
router.get('/appointments-to-complete', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Accès non autorisé - Réservé aux administrateurs'
      });
      return;
    }

    const appointments = await getAppointmentsToComplete();

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching appointments to complete:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;