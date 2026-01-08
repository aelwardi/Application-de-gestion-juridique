import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as suggestionService from '../services/appointment-suggestion.service';
import * as conflictService from '../services/conflict.service';
import { pool } from '../config/database.config';

const router = Router();

router.use(authenticate);

/**
 * Créer une proposition de créneau
 * POST /api/appointment-suggestions
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { appointment_id, suggested_to_user_id, suggested_start_time, suggested_end_time, notes } = req.body;

    if (new Date(suggested_end_time) <= new Date(suggested_start_time)) {
      res.status(400).json({
        success: false,
        message: 'La fin doit être après le début'
      });
      return;
    }

    const suggestion = await suggestionService.createSuggestion({
      appointment_id,
      suggested_by_user_id: user.userId,
      suggested_to_user_id,
      suggested_start_time,
      suggested_end_time,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Proposition créée avec succès',
      data: suggestion
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la proposition',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Récupérer mes suggestions (envoyées)
 * GET /api/appointment-suggestions/sent
 */
router.get('/sent', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const suggestions = await suggestionService.getUserSuggestions(user.userId, 'suggested_by');

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching sent suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des propositions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Récupérer mes suggestions (reçues)
 * GET /api/appointment-suggestions/received
 */
router.get('/received', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const suggestions = await suggestionService.getUserSuggestions(user.userId, 'suggested_to');

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching received suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des propositions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Accepter une suggestion
 * POST /api/appointment-suggestions/:id/accept
 */
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const result = await suggestionService.acceptSuggestion(id, user.userId);

    res.status(200).json({
      success: true,
      message: 'Suggestion acceptée avec succès',
      data: result
    });
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'acceptation de la suggestion',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Refuser une suggestion
 * POST /api/appointment-suggestions/:id/reject
 */
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { reason } = req.body;

    const suggestion = await suggestionService.rejectSuggestion(id, user.userId, reason);

    res.status(200).json({
      success: true,
      message: 'Suggestion refusée',
      data: suggestion
    });
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du refus de la suggestion',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Contre-proposer
 * POST /api/appointment-suggestions/:id/counter
 */
router.post('/:id/counter', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { suggested_start_time, suggested_end_time, notes } = req.body;

    const counterSuggestion = await suggestionService.counterSuggestion(
      id,
      user.userId,
      suggested_start_time,
      suggested_end_time,
      notes
    );

    res.status(201).json({
      success: true,
      message: 'Contre-proposition envoyée',
      data: counterSuggestion
    });
  } catch (error) {
    console.error('Error countering suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la contre-proposition',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Récupérer les créneaux disponibles d'un avocat pour une date donnée
 * GET /api/appointment-suggestions/available-slots/:lawyerId
 */
router.get('/available-slots/:lawyerId', async (req: Request, res: Response) => {
  try {
    const { lawyerId } = req.params;
    const { date, duration } = req.query;

    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Le paramètre date est requis'
      });
      return;
    }

    const slots = await conflictService.findAvailableSlots(
      lawyerId,
      date as string,
      duration ? parseInt(duration as string) : 60
    );

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Récupérer les suggestions liées à un rendez-vous spécifique
 * GET /api/appointment-suggestions/appointment/:appointmentId
 */
router.get('/appointment/:appointmentId', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    const query = `
      SELECT s.*,
        s.suggested_by as suggested_by_user_id,
        s.suggested_to as suggested_to_user_id,
        s.suggested_start_date as suggested_start_time,
        s.suggested_end_date as suggested_end_time,
        s.message as notes,
        u1.first_name as suggested_by_first_name,
        u1.last_name as suggested_by_last_name,
        u2.first_name as suggested_to_first_name,
        u2.last_name as suggested_to_last_name
      FROM appointment_suggestions s
      LEFT JOIN users u1 ON s.suggested_by = u1.id
      LEFT JOIN users u2 ON s.suggested_to = u2.id
      WHERE s.appointment_id = $1
      ORDER BY s.created_at DESC
    `;

    const result = await pool.query(query, [appointmentId]);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching appointment suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des suggestions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;