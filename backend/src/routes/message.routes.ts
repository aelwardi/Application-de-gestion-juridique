import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { pool } from '../config/database.config';

const router = express.Router();

/**
 * GET /api/conversations
 * Récupère toutes les conversations de l'utilisateur connecté
 */
router.get('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const query = `
      SELECT 
        c.*,
        (
          SELECT json_build_object(
            'id', cases.id,
            'title', cases.title,
            'case_number', cases.case_number
          )
          FROM cases
          WHERE cases.id = c.case_id
        ) as case_info,
        (
          SELECT json_agg(
            json_build_object(
              'id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'email', u.email,
              'role', u.role,
              'profile_picture_url', u.profile_picture_url
            )
          )
          FROM users u
          WHERE u.id = ANY(c.participants) AND u.id != $1
        ) as other_participants,
        (
          SELECT json_build_object(
            'message_text', m.message_text,
            'created_at', m.created_at,
            'sender_id', m.sender_id,
            'is_read', m.is_read
          )
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*)::int
          FROM messages m
          WHERE m.conversation_id = c.id 
          AND m.is_read = false 
          AND m.sender_id != $1
        ) as unread_count
      FROM conversations c
      WHERE $1 = ANY(c.participants)
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/conversations/:id/messages
 * Récupère tous les messages d'une conversation
 */
router.get('/conversations/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = (req as any).user?.userId;

    // Vérifier que l'utilisateur fait partie de la conversation
    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND $2 = ANY(participants)',
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas accès à cette conversation'
      });
    }

    const query = `
      SELECT 
        m.*,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'role', u.role,
          'profile_picture_url', u.profile_picture_url
        ) as sender
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      AND m.is_deleted = false
      ORDER BY m.created_at ASC
    `;

    const result = await pool.query(query, [conversationId]);

    // Marquer les messages comme lus
    await pool.query(
      `UPDATE messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP 
       WHERE conversation_id = $1 
       AND sender_id != $2 
       AND is_read = false`,
      [conversationId, userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/conversations
 * Créer une nouvelle conversation ou récupérer une existante
 */
router.post('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { recipient_id, case_id, title } = req.body;

    if (!recipient_id) {
      return res.status(400).json({
        success: false,
        message: 'recipient_id est requis'
      });
    }

    // Vérifier si une conversation existe déjà entre ces deux utilisateurs
    const existingConv = await pool.query(
      `SELECT * FROM conversations 
       WHERE conversation_type = 'direct' 
       AND participants @> ARRAY[$1::uuid, $2::uuid]
       AND participants <@ ARRAY[$1::uuid, $2::uuid]
       ${case_id ? 'AND case_id = $3' : ''}
       LIMIT 1`,
      case_id ? [userId, recipient_id, case_id] : [userId, recipient_id]
    );

    if (existingConv.rows.length > 0) {
      return res.json({
        success: true,
        data: existingConv.rows[0]
      });
    }

    // Créer une nouvelle conversation
    const query = `
      INSERT INTO conversations (
        case_id,
        conversation_type,
        title,
        participants
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      case_id || null,
      'direct',
      title || null,
      [userId, recipient_id]
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/conversations/:id/messages
 * Envoyer un message dans une conversation
 */
router.post('/conversations/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = (req as any).user?.userId;
    const { message_text, message_type = 'text', attachments } = req.body;

    if (!message_text && !attachments) {
      return res.status(400).json({
        success: false,
        message: 'Le message ne peut pas être vide'
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND $2 = ANY(participants)',
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas accès à cette conversation'
      });
    }

    // Insérer le message
    const messageQuery = `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        message_text,
        message_type,
        attachments
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const messageResult = await pool.query(messageQuery, [
      conversationId,
      userId,
      message_text,
      message_type,
      attachments ? JSON.stringify(attachments) : null
    ]);

    // Mettre à jour last_message_at de la conversation
    await pool.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    // Créer des notifications pour les autres participants
    const conversation = convCheck.rows[0];
    const otherParticipants = conversation.participants.filter((id: string) => id !== userId);

    for (const participantId of otherParticipants) {
      await pool.query(
        `INSERT INTO notifications (user_id, notification_type, title, message, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          participantId,
          'message_received',
          'Nouveau message',
          message_text.substring(0, 100),
          JSON.stringify({
            conversation_id: conversationId,
            sender_id: userId
          })
        ]
      );
    }

    res.status(201).json({
      success: true,
      data: messageResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/messages/unread-count
 * Nombre de messages non lus
 */
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const query = `
      SELECT COUNT(*)::int as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE $1 = ANY(c.participants)
      AND m.sender_id != $1
      AND m.is_read = false
      AND m.is_deleted = false
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      count: result.rows[0].count
    });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

