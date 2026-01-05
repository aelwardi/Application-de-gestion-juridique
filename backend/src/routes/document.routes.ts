import express, { Request, Response } from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware';

// @ts-ignore (si tu n'as pas de types pour ton fichier db)
import { pool } from '../config/database.config';
// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Assure-toi que ce dossier existe : /backend/uploads/documents/
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
    console.log('✅ Dossier uploads/documents créé avec succès');
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * POST /api/documents
 * Upload un document et envoie des notifications :
 * - Si avocat upload ET non confidentiel → notifie le client
 * - Si client upload → notifie l'avocat (toujours is_confidential = false)
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

    // Récupérer le rôle de l'uploader
    const uploaderQuery = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [uploaded_by]
    );
    const uploaderRole = uploaderQuery.rows[0]?.role;

    // Si c'est un client, forcer is_confidential à false
    let finalIsConfidential = false;
    if (uploaderRole === 'avocat') {
      finalIsConfidential = is_confidential === 'true';
    }
    // Pour le client, c'est toujours false (déjà défini)

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

    // === NOTIFICATIONS ===
    if (case_id && case_id !== 'null') {
      try {
        // Récupérer les infos du dossier (client_id, lawyer_id)
        const caseQuery = await pool.query(
          'SELECT client_id, lawyer_id, title as case_title FROM cases WHERE id = $1',
          [case_id]
        );

        if (caseQuery.rows.length > 0) {
          const caseData = caseQuery.rows[0];

          // Récupérer le nom de l'uploader
          const uploaderNameQuery = await pool.query(
            'SELECT first_name, last_name FROM users WHERE id = $1',
            [uploaded_by]
          );
          const uploaderName = `${uploaderNameQuery.rows[0]?.first_name} ${uploaderNameQuery.rows[0]?.last_name}`;

          if (uploaderRole === 'avocat' && !finalIsConfidential) {
            // Avocat upload un document NON confidentiel → notifier le client
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
          } else if (uploaderRole === 'client') {
            // Client upload → notifier l'avocat
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
          }
        }
      } catch (notifError) {
        console.error('Erreur création notification:', notifError);
        // On ne fait pas échouer l'upload si la notification échoue
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
 * GET /api/documents/lawyer/:lawyerId
 * Récupère les documents récents d'un avocat (tous dossiers confondus)
 */
router.get('/lawyer/:lawyerId', authenticate, async (req: Request, res: Response) => {
  try {
    const { lawyerId } = req.params;
    const limit = 5; // On limite aux 20 plus récents

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
 * GET /api/documents/case/:caseId
 * Filtre les documents selon le rôle :
 * - Avocat : voit TOUS les documents (tous les documents du dossier)
 * - Client : voit :
 *   1) Ses propres documents (uploaded_by = userId)
 *   2) Les documents de l'avocat NON confidentiels (is_confidential = false)
 */
router.get('/case/:caseId', authenticate, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const userId = (req as any).user?.userId; // ID de l'utilisateur connecté depuis le middleware auth

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    // Récupérer le rôle de l'utilisateur
    const userQuery = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    const userRole = userQuery.rows[0]?.role;

    let query: string;
    let params: any[];

    if (userRole === 'avocat') {
      // L'avocat voit TOUS les documents du dossier
      query = 'SELECT * FROM documents WHERE case_id = $1 ORDER BY created_at DESC';
      params = [caseId];
    } else {
      // Le client voit :
      // 1) Ses propres documents (uploaded_by = userId)
      // 2) Les documents non confidentiels (is_confidential = false)
      query = `
        SELECT * FROM documents 
        WHERE case_id = $1 
        AND (uploaded_by = $2 OR is_confidential = false)
        ORDER BY created_at DESC
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
    
    // 1. On cherche d'abord le document
    const fileRes = await pool.query('SELECT file_url FROM documents WHERE id = $1', [id]);
    
    if (fileRes.rowCount === 0) {
      // Si on arrive ici, c'est que l'ID n'est pas le bon dans ta table
      return res.status(404).json({ success: false, message: "Document non trouvé en base" });
    }

    const fileName = fileRes.rows[0].file_url;
    // Chemin absolu pour être sûr de trouver le fichier
    const filePath = path.resolve(process.cwd(), 'uploads/documents', fileName);

    // 2. Suppression base de données
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    // 3. Suppression physique (on ne bloque pas si le fichier n'existe déjà plus)
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
export default router;