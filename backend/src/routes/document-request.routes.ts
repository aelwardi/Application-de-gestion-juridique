import { Router, Request, Response } from 'express';
import { pool } from '../config/database.config';
import { authenticate } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sendDocumentRequestEmail } from '../utils/email.util';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'document-requests');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

/**
 * POST /api/document-requests
 * Créer une demande de document (avocat uniquement)
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { case_id, client_id, title, description, document_types, expires_in_days } = req.body;

    if (!case_id || !client_id || !title) {
      return res.status(400).json({
        success: false,
        message: 'Les champs case_id, client_id et title sont requis'
      });
    }

    const userQuery = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userQuery.rows.length === 0 || userQuery.rows[0].role !== 'avocat') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les avocats peuvent créer des demandes de documents'
      });
    }

    const accessToken = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expires_in_days || 30));

    const query = `
      INSERT INTO document_requests (
        id, case_id, lawyer_id, client_id, title, description, 
        document_types, access_token, expires_at, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `;

    const values = [
      uuidv4(),
      case_id,
      userId,
      client_id,
      title,
      description || null,
      document_types || [],
      accessToken,
      expiresAt
    ];

    const result = await pool.query(query, values);
    const documentRequest = result.rows[0];

    try {
      const userInfoQuery = `
        SELECT 
          c.first_name as client_first_name,
          c.email as client_email,
          l.first_name as lawyer_first_name,
          l.last_name as lawyer_last_name,
          ca.title as case_title
        FROM users c
        CROSS JOIN users l
        CROSS JOIN cases ca
        WHERE c.id = $1 AND l.id = $2 AND ca.id = $3
      `;

      const userInfoResult = await pool.query(userInfoQuery, [client_id, userId, case_id]);

      if (userInfoResult.rows.length > 0) {
        const info = userInfoResult.rows[0];
        const uploadLink = `http://localhost:3001/upload-documents/${accessToken}`;

        sendDocumentRequestEmail(
          info.client_email,
          info.client_first_name,
          `${info.lawyer_first_name} ${info.lawyer_last_name}`,
          title,
          description || '',
          info.case_title,
          uploadLink,
          expiresAt
        ).catch(error => {
          console.error('Erreur envoi email demande documents:', error);
        });

        await pool.query(
          `INSERT INTO notifications (user_id, notification_type, title, message, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            client_id,
            'document_request',
            'Demande de documents',
            `${info.lawyer_first_name} ${info.lawyer_last_name} vous demande d'envoyer des documents pour le dossier "${info.case_title}"`,
            JSON.stringify({
              document_request_id: documentRequest.id,
              case_id: case_id,
              access_token: accessToken
            })
          ]
        );
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
    }

    res.status(201).json({
      success: true,
      data: documentRequest,
      upload_link: `http://localhost:3001/upload-documents/${accessToken}`
    });
  } catch (error: any) {
    console.error('Erreur création demande documents:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la demande'
    });
  }
});

/**
 * GET /api/document-requests/case/:caseId
 * Récupérer les demandes de documents pour un dossier
 */
router.get('/case/:caseId', authenticate, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;

    const query = `
      SELECT 
        dr.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.email as client_email
      FROM document_requests dr
      LEFT JOIN users c ON dr.client_id = c.id
      WHERE dr.case_id = $1
      ORDER BY dr.created_at DESC
    `;

    const result = await pool.query(query, [caseId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Erreur récupération demandes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/document-requests/token/:token
 * Récupérer une demande par son token (accès public)
 */
router.get('/token/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const query = `
      SELECT 
        dr.*,
        l.first_name as lawyer_first_name,
        l.last_name as lawyer_last_name,
        ca.title as case_title,
        ca.case_number
      FROM document_requests dr
      LEFT JOIN users l ON dr.lawyer_id = l.id
      LEFT JOIN cases ca ON dr.case_id = ca.id
      WHERE dr.access_token = $1
    `;

    const result = await pool.query(query, [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    const request = result.rows[0];

    if (request.expires_at && new Date(request.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Cette demande a expiré',
        expired: true
      });
    }

    if (request.status === 'completed' || request.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cette demande est déjà ${request.status === 'completed' ? 'complétée' : 'annulée'}`,
        status: request.status
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error: any) {
    console.error('Erreur récupération demande par token:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/document-requests/upload/:token
 * Uploader un document via le lien public
 */
router.post('/upload/:token', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { title, document_type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const requestQuery = await pool.query(
      'SELECT * FROM document_requests WHERE access_token = $1',
      [token]
    );

    if (requestQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    const documentRequest = requestQuery.rows[0];

    if (documentRequest.expires_at && new Date(documentRequest.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Cette demande a expiré'
      });
    }

    if (documentRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande n\'est plus active'
      });
    }

    const insertDocQuery = `
      INSERT INTO documents (
        case_id, uploaded_by, document_type, title, 
        file_name, file_size, file_type, file_url, is_confidential
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
      RETURNING *
    `;

    const docValues = [
      documentRequest.case_id,
      documentRequest.client_id,
      document_type || 'other',
      title || req.file.originalname,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      req.file.filename
    ];

    const docResult = await pool.query(insertDocQuery, docValues);
    const document = docResult.rows[0];

    await pool.query(
      `UPDATE document_requests 
       SET uploaded_documents_count = uploaded_documents_count + 1,
           last_upload_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [documentRequest.id]
    );

    try {
      const lawyerQuery = await pool.query(
        'SELECT first_name, email FROM users WHERE id = $1',
        [documentRequest.lawyer_id]
      );

      if (lawyerQuery.rows.length > 0) {
        await pool.query(
          `INSERT INTO notifications (user_id, notification_type, title, message, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            documentRequest.lawyer_id,
            'document_uploaded',
            'Document reçu',
            `Un client a uploadé un document en réponse à votre demande: "${documentRequest.title}"`,
            JSON.stringify({
              document_id: document.id,
              document_request_id: documentRequest.id,
              case_id: documentRequest.case_id
            })
          ]
        );
      }
    } catch (notifError) {
      console.error('Erreur création notification:', notifError);
    }

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploadé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur upload document:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PATCH /api/document-requests/:id/status
 * Mettre à jour le statut d'une demande
 */
router.patch('/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const query = `
      UPDATE document_requests
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/document-requests/:id
 * Supprimer une demande de document
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM document_requests WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Demande supprimée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur suppression demande:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;