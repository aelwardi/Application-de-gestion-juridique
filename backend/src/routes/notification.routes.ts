import { Router } from 'express';
import { pool } from '../config/database.config';

const router = Router();

// Récupérer les notifications d'un utilisateur
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 20
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des notifs" });
    }
});

// Marquer comme lu
router.patch('/:id/read', async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erreur" });
    }
});

export default router;