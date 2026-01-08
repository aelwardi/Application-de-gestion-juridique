import { Router } from 'express';
import { acceptOfferQuery, declineOfferQuery } from '../database/queries/case.queries';
import { pool } from '../config/database.config';

const router = Router();

/**
 * RÉCUPÉRATION DES OFFRES AVEC INFOS CLIENT
 */
router.get('/pending/:lawyerId', async (req, res) => {
    const { lawyerId } = req.params;

    try {
        const query = `
            SELECT 
                r.*, 
                COALESCE(u.first_name, 'Client') as client_first_name,
                COALESCE(u.last_name, 'Inconnu') as client_last_name,
                COALESCE(u.email, 'Email non trouvé') as client_email,
                COALESCE(u.phone, 'Non renseigné') as client_phone
            FROM client_requests r
            LEFT JOIN users u ON r.client_id = u.id
            WHERE r.lawyer_id = $1 
            AND r.status = 'pending'
            ORDER BY r.created_at DESC
        `;

        const result = await pool.query(query, [lawyerId]);
        res.json(result.rows);
    } catch (error: any) {
        console.error('--- SQL ERROR ---', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * ACCEPTER L'OFFRE (Crée un dossier et met à jour le statut)
 */
router.post('/:id/accept', async (req, res) => {
    try {
        const result = await acceptOfferQuery(req.params.id);

        if (result.success && result.caseId) {
            try {
                const caseQuery = await pool.query(
                    'SELECT id, client_id, title FROM cases WHERE id = $1',
                    [result.caseId]
                );

                if (caseQuery.rows.length > 0) {
                    const caseData = caseQuery.rows[0];
                    await pool.query(
                        `INSERT INTO notifications (user_id, notification_type, title, message, data)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            caseData.client_id,
                            'case_update',
                            'Offre acceptée',
                            `Votre demande "${caseData.title}" a été acceptée par l'avocat. Votre dossier est maintenant actif.`,
                            JSON.stringify({
                                case_id: caseData.id,
                                offer_id: req.params.id,
                                case_title: caseData.title
                            })
                        ]
                    );
                }
            } catch (notifError) {
                console.error('[BACKEND] Erreur création notification:', notifError);
            }
        }

        res.json(result);
    } catch (error: any) {
        console.error('[BACKEND] Erreur Accept Offer:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DÉCLINER L'OFFRE (Met à jour le statut en 'declined')
 */
router.post('/:id/decline', async (req, res) => {
    try {
        const offerQuery = await pool.query(
            'SELECT client_id, title FROM cases WHERE id = $1',
            [req.params.id]
        );

        const success = await declineOfferQuery(req.params.id);
        
        if (success && offerQuery.rows.length > 0) {
            try {
                const offerData = offerQuery.rows[0];
                await pool.query(
                    `INSERT INTO notifications (user_id, notification_type, title, message, data)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        offerData.client_id,
                        'case_update',
                        'Offre refusée',
                        `Votre demande "${offerData.title}" n'a pas été retenue par l'avocat. Vous pouvez contacter d'autres avocats.`,
                        JSON.stringify({
                            offer_id: req.params.id,
                            case_title: offerData.title
                        })
                    ]
                );
            } catch (notifError) {
                console.error('[BACKEND] Erreur création notification:', notifError);
            }

            res.json({ success: true, message: "Offre déclinée" });
        } else {
            res.status(404).json({ error: "Offre non trouvée" });
        }
    } catch (error: any) {
        console.error('[BACKEND] Erreur Decline Offer:', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;