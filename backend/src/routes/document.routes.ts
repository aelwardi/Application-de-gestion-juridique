import express, { Request, Response } from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware';
import { sendDocumentUploadedEmail } from '../utils/email.util';
import * as adminQueries from '../database/queries/admin.queries';

import { pool } from '../config/database.config';
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


const uploadDir = 'uploads/documents/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * POST /api/documents
 * Upload un document et envoie des notifications
 */
/**
 * POST /api/documents
 * Upload un document et envoie des notifications
 */
router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
    }

    const {
      title,
      document_type,
      case_id,
      is_confidential,
      uploaded_by,
      description
    } = req.body;

    const uploaderQuery = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [uploaded_by]
    );
    const uploaderRole = uploaderQuery.rows[0]?.role;

    let finalIsConfidential = false;
    if (uploaderRole === 'avocat') {
      finalIsConfidential = is_confidential === 'true';
    }

    const query = `
      INSERT INTO documents (
        case_id, 
        uploaded_by, 
        document_type, 
        title, 
        description, 
        file_name, 
        file_size, 
        file_type, 
        file_url, 
        is_confidential
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      case_id === 'null' ? null : case_id, 
      uploaded_by, 
      document_type, 
      title, 
      description || null, 
      req.file.originalname, 
      req.file.size, 
      req.file.mimetype, 
      req.file.filename,
      finalIsConfidential
    ];

    const result = await pool.query(query, values);
    const document = result.rows[0];


    try {
      await adminQueries.createActivityLog(
        uploaded_by,
        'DOCUMENT_UPLOADED',
        'document',
        document.id,
        req.ip || req.socket.remoteAddress || null,
        req.get('user-agent') || null,
        {
          title: title,
          document_type: document_type,
          case_id: case_id === 'null' ? null : case_id,
          file_name: req.file.originalname,
          is_confidential: finalIsConfidential
        }
      );
    } catch (logError) {
      console.error('Failed to log DOCUMENT_UPLOADED activity:', logError);
    }

    if (case_id && case_id !== 'null') {
      try {
        const caseQuery = await pool.query(
          'SELECT client_id, lawyer_id, title as case_title FROM cases WHERE id = $1',
          [case_id]
        );

        if (caseQuery.rows.length > 0) {
          const caseData = caseQuery.rows[0];

          const uploaderNameQuery = await pool.query(
            'SELECT first_name, last_name FROM users WHERE id = $1',
            [uploaded_by]
          );
          const uploaderName = `${uploaderNameQuery.rows[0]?.first_name} ${uploaderNameQuery.rows[0]?.last_name}`;

          if (uploaderRole === 'avocat' && !finalIsConfidential) {
            await pool.query(
              `INSERT INTO notifications (user_id, notification_type, title, message, data)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                caseData.client_id,
                'document_uploaded',
                'Nouveau document disponible',
                `Votre avocat a ajouté le document "${title}" au dossier "${caseData.case_title}"`,
                JSON.stringify({
                  document_id: document.id,
                  case_id: case_id,
                  document_title: title
                })
              ]
            );

            const clientEmailQuery = await pool.query(
              'SELECT first_name, email FROM users WHERE id = $1',
              [caseData.client_id]
            );

            if (clientEmailQuery.rows.length > 0) {
              const client = clientEmailQuery.rows[0];
              sendDocumentUploadedEmail(
                client.email,
                client.first_name,
                uploaderName,
                title,
                caseData.case_title,
                case_id,
                false
              ).catch(error => {
                console.error('Erreur envoi email document au client:', error);
              });
            }
          } else if (uploaderRole === 'client') {
            await pool.query(
              `INSERT INTO notifications (user_id, notification_type, title, message, data)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                caseData.lawyer_id,
                'document_uploaded',
                'Nouveau document client',
                `${uploaderName} a ajouté le document "${title}" au dossier "${caseData.case_title}"`,
                JSON.stringify({
                  document_id: document.id,
                  case_id: case_id,
                  document_title: title,
                  uploader_name: uploaderName
                })
              ]
            );

            const lawyerEmailQuery = await pool.query(
              'SELECT first_name, email FROM users WHERE id = $1',
              [caseData.lawyer_id]
            );

            if (lawyerEmailQuery.rows.length > 0) {
              const lawyer = lawyerEmailQuery.rows[0];
              sendDocumentUploadedEmail(
                lawyer.email,
                lawyer.first_name,
                uploaderName,
                title,
                caseData.case_title,
                case_id,
                false
              ).catch(error => {
                console.error('Erreur envoi email document à l\'avocat:', error);
              });
            }
          }
        }
      } catch (notifError) {
        console.error('Erreur création notification:', notifError);
      }
    }

    res.status(201).json({
      success: true,
      data: document
    });

  } catch (error: any) {
    console.error('Erreur Upload Backend:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/documents/:id
 * Récupère un document par son ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const result = await pool.query(
      `SELECT d.* FROM documents d
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erreur récupération document:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/documents/:id/download
 * Télécharge un document
 */
router.get('/:id/download', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const result = await pool.query(
      `SELECT d.* FROM documents d
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    const document = result.rows[0];
    const filePath = path.join(process.cwd(), document.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }

    res.download(filePath, document.filename);
  } catch (error: any) {
    console.error('Erreur téléchargement document:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/documents
 * Récupère les documents avec filtres (user_id, case_id, etc.)
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { user_id, case_id, limit = '20', offset = '0' } = req.query;

    let query = `
      SELECT 
        d.*,
        c.title as case_title,
        c.case_number,
        u.first_name as uploader_first_name,
        u.last_name as uploader_last_name
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND (d.uploaded_by = $${paramIndex} OR c.client_id = $${paramIndex} OR c.lawyer_id = $${paramIndex})`;
      params.push(user_id);
      paramIndex++;
    }

    if (case_id) {
      query += ` AND d.case_id = $${paramIndex}`;
      params.push(case_id);
      paramIndex++;
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.rowCount
      }
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/documents/lawyer/:lawyerId
 * Récupère les documents récents d'un avocat (tous dossiers confondus)
 */
router.get('/lawyer/:lawyerId', authenticate, async (req: Request, res: Response) => {
  try {
    const { lawyerId } = req.params;
    const limit = 5;

    const query = `
      SELECT * FROM documents 
      WHERE uploaded_by = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    const result = await pool.query(query, [lawyerId, limit]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/documents/client/:clientId
 * Récupère les documents récents d'un client
 * Le client voit :
 */
router.get('/client/:clientId', authenticate, async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const query = `
      SELECT 
        d.*,
        c.title as case_title,
        c.case_number,
        u.first_name as uploader_first_name,
        u.last_name as uploader_last_name
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE c.client_id = $1 
      AND (d.uploaded_by = $1 OR d.is_confidential = false)
      ORDER BY d.created_at DESC 
      LIMIT $2
    `;

    const result = await pool.query(query, [clientId, limit]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});


/**
 * GET /api/documents/case/:caseId
 * Filtre les documents selon le rôle
 */
router.get('/case/:caseId', authenticate, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    const userQuery = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    const userRole = userQuery.rows[0]?.role;

    let query: string;
    let params: any[];

    if (userRole === 'avocat') {
      query = `
        SELECT 
          d.*,
          CONCAT(u.first_name, ' ', u.last_name) as uploader_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.case_id = $1 
        ORDER BY d.created_at DESC
      `;
      params = [caseId];
    } else {
      query = `
        SELECT 
          d.*,
          CONCAT(u.first_name, ' ', u.last_name) as uploader_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.case_id = $1 
        AND (d.uploaded_by = $2 OR d.is_confidential = false)
        ORDER BY d.created_at DESC
      `;
      params = [caseId, userId];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});


/**
 * DELETE /api/documents/:id
 */
/**
 * DELETE /api/documents/:id
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const fileRes = await pool.query('SELECT file_url FROM documents WHERE id = $1', [id]);
    
    if (fileRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Document non trouvé en base" });
    }

    const fileName = fileRes.rows[0].file_url;
    const filePath = path.resolve(process.cwd(), 'uploads/documents', fileName);

    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Fichier physique non supprimé:", err);
    }
    
    res.json({ success: true, message: "Supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur suppression:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/documents/:id
 * Update document metadata
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, document_type } = req.body;
    const userId = (req as any).user?.userId;

    const checkResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    const document = checkResult.rows[0];

    if (document.uploaded_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const updateQuery = `
      UPDATE documents
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          document_type = COALESCE($3, document_type),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [title, description, document_type, id]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erreur mise à jour document:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/documents/:id/share
 * Share document with another user
 */
router.post('/:id/share', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId: sharedWithUserId, permission } = req.body;
    const userId = (req as any).user?.userId;

    if (!sharedWithUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID requis'
      });
    }

    const checkResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    const shareQuery = `
      INSERT INTO document_shares (document_id, shared_with, shared_by, permission)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(shareQuery, [
      id,
      sharedWithUserId,
      userId,
      permission || 'view'
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erreur partage document:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/documents/shared
 * Get documents shared with current user
 */
router.get('/shared', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const query = `
      SELECT d.*, ds.permission, ds.shared_at,
             u.first_name as shared_by_first_name,
             u.last_name as shared_by_last_name
      FROM documents d
      JOIN document_shares ds ON d.id = ds.document_id
      JOIN users u ON ds.shared_by = u.id
      WHERE ds.shared_with = $1
      ORDER BY ds.shared_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Erreur récupération documents partagés:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;