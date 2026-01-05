import { Router } from 'express';
import { pool } from '../config/database.config';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Récupérer les notifications de l'utilisateur connecté
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user?.userId;

        const query = `
            SELECT 
                id,
                notification_type as type,
                title,
                message,
                data,
                is_read,
                created_at
            FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 50
        `;

        const result = await pool.query(query, [userId]);

        // Formater les notifications pour le frontend
        const formattedNotifications = result.rows.map((notif: any) => {
            const now = new Date();
            const createdAt = new Date(notif.created_at);
            const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

            let timeText = '';
            if (diffInMinutes < 1) timeText = "À l'instant";
            else if (diffInMinutes < 60) timeText = `Il y a ${diffInMinutes} min`;
            else if (diffInMinutes < 1440) timeText = `Il y a ${Math.floor(diffInMinutes / 60)} h`;
            else timeText = createdAt.toLocaleDateString('fr-FR');

            // Déterminer la catégorie selon le type
            let category = '';
            switch (notif.type) {
                case 'message_received':
                    category = 'Communication 💬';
                    break;
                case 'document_uploaded':
                    category = 'Nouveau Document 📄';
                    break;
                case 'appointment_reminder':
                    category = 'Rendez-vous 📅';
                    break;
                case 'case_update':
                    category = 'Mise à jour Dossier ⚖️';
                    break;
                default:
                    category = 'Notification 🔔';
            }

            return {
                id: notif.id,
                type: notif.type,
                category,
                title: notif.title,
                message: notif.message,
                is_read: notif.is_read,
                time: timeText,
                created_at: notif.created_at,
                data: notif.data
            };
        });

        res.json({
            success: true,
            data: formattedNotifications,
            unread_count: formattedNotifications.filter((n: any) => !n.is_read).length
        });
    } catch (error) {
        console.error('Erreur récupération notifications:', error);
        res.status(500).json({ success: false, error: "Erreur lors de la récupération des notifications" });
    }
});

// Marquer comme lu
router.patch('/:id/read', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user?.userId;

        // Vérifier que la notification appartient bien à l'utilisateur
        await pool.query(
            'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
            [req.params.id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur marquage lu:', error);
        res.status(500).json({ success: false, error: "Erreur" });
    }
});

// Marquer toutes comme lues
router.patch('/mark-all-read', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user?.userId;

        await pool.query(
            'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false',
            [userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur marquage tous lus:', error);
        res.status(500).json({ success: false, error: "Erreur" });
    }
});

export default router;