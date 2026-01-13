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
          SELECT json_build_object(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'email', u.email,
            'role', u.role,
            'profile_picture_url', u.profile_picture_url
          )
          FROM users u
          WHERE u.id = CASE 
            WHEN c.participant1_id = $1 THEN c.participant2_id
            ELSE c.participant1_id
          END
        ) as other_participant,
        (
          SELECT json_build_object(
            'message_text', m.content,
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
      WHERE c.participant1_id = $1 OR c.participant2_id = $1
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

    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
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
        m.content as message_text,
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
      ORDER BY m.created_at ASC
    `;

    const result = await pool.query(query, [conversationId]);

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
    const { recipient_id, case_id } = req.body;

    if (!recipient_id) {
      return res.status(400).json({
        success: false,
        message: 'recipient_id est requis'
      });
    }

    const existingConv = await pool.query(
      `SELECT * FROM conversations 
       WHERE LEAST(participant1_id, participant2_id) = LEAST($1::uuid, $2::uuid)
       AND GREATEST(participant1_id, participant2_id) = GREATEST($1::uuid, $2::uuid)
       AND ${case_id ? 'case_id = $3' : 'case_id IS NULL'}
       LIMIT 1`,
      case_id ? [userId, recipient_id, case_id] : [userId, recipient_id]
    );

    if (existingConv.rows.length > 0) {
      return res.json({
        success: true,
        data: existingConv.rows[0]
      });
    }

    try {
      const query = `
        INSERT INTO conversations (
          participant1_id,
          participant2_id,
          case_id,
          last_message_at
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await pool.query(query, [
        userId,
        recipient_id,
        case_id || null
      ]);

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (insertError: any) {
      if (insertError.code === '23505') {
        const retryConv = await pool.query(
          `SELECT * FROM conversations 
           WHERE LEAST(participant1_id, participant2_id) = LEAST($1::uuid, $2::uuid)
           AND GREATEST(participant1_id, participant2_id) = GREATEST($1::uuid, $2::uuid)
           AND ${case_id ? 'case_id = $3' : 'case_id IS NULL'}
           LIMIT 1`,
          case_id ? [userId, recipient_id, case_id] : [userId, recipient_id]
        );

        if (retryConv.rows.length > 0) {
          return res.json({
            success: true,
            data: retryConv.rows[0]
          });
        }
      }

      throw insertError;
    }
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
    const { message_text, attachments } = req.body;

    if (!message_text && !attachments) {
      return res.status(400).json({
        success: false,
        message: 'Le message ne peut pas être vide'
      });
    }

    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas accès à cette conversation'
      });
    }

    const conversation = convCheck.rows[0];
    const receiverId = conversation.participant1_id === userId
      ? conversation.participant2_id
      : conversation.participant1_id;

    const messageQuery = `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        receiver_id,
        content,
        attachment_url
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *, content as message_text
    `;

    const messageResult = await pool.query(messageQuery, [
      conversationId,
      userId,
      receiverId,
      message_text,
      attachments && attachments.length > 0 ? attachments[0] : null
    ]);

    await pool.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, notification_type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        receiverId,
        'message_received',
        'Nouveau message',
        message_text.substring(0, 100),
        JSON.stringify({
          conversation_id: conversationId,
          sender_id: userId
        })
      ]
    );

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
      WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
      AND m.sender_id != $1
      AND m.is_read = false
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

/**
 * POST /api/messages
 * Envoyer un message (alias simplifié)
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { conversationId, content } = req.body;

    if (!conversationId || !content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'ID de conversation et contenu requis'
      });
    }

    // Check if conversation exists and user has access
    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée ou accès refusé'
      });
    }

    const insertQuery = `
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [conversationId, userId, content.trim()]);

    await pool.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [conversationId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
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
 * PATCH /api/messages/conversations/:id/read-all
 * Marquer tous les messages d'une conversation comme lus
 */
router.patch('/conversations/:id/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = (req as any).user?.userId;

    const result = await pool.query(
      `UPDATE messages 
       SET is_read = true, read_at = NOW() 
       WHERE conversation_id = $1 
       AND sender_id != $2 
       AND is_read = false`,
      [conversationId, userId]
    );

    res.json({
      success: true,
      message: `${result.rowCount} messages marked as read`
    });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PATCH /api/messages/:id/read
 * Marquer un message comme lu
 */
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const result = await pool.query(
      `UPDATE messages 
       SET is_read = true, read_at = NOW() 
       WHERE id = $1 
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/messages/:id
 * Supprimer un message
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 AND sender_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé ou accès refusé'
      });
    }

    res.json({
      success: true,
      message: 'Message supprimé'
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;