import { Router } from 'express';
import * as lawyersController from '../controllers/lawyers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Routes publiques/protégées pour les avocats (accessibles aux clients)
 */

router.get('/specialties/list', authenticate, async (req, res) => {
  try {
    const specialties = [
      { name: 'Droit Civil', description: 'Contrats, successions, famille' },
      { name: 'Droit Pénal', description: 'Défense pénale, infractions' },
      { name: 'Droit Commercial', description: 'Entreprises, commerce' },
      { name: 'Droit du Travail', description: 'Relations employeur-employé' },
      { name: 'Droit Immobilier', description: 'Transactions, baux' },
      { name: 'Droit Fiscal', description: 'Impôts, fiscalité' },
      { name: 'Droit de la Famille', description: 'Divorce, garde d\'enfants' },
      { name: 'Droit des Affaires', description: 'Sociétés, contrats commerciaux' },
      { name: 'Droit International', description: 'Relations internationales' },
      { name: 'Droit Administratif', description: 'Administration publique' },
    ];

    res.json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties',
    });
  }
});

router.get('/', authenticate, lawyersController.getLawyers);

router.get('/:id', authenticate, lawyersController.getLawyerDetails);

export default router;