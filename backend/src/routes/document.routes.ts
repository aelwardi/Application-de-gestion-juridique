import express, { Request, Response } from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
 */
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
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
      req.file.filename, // On stocke juste le nom du fichier généré
      is_confidential === 'true'
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) { // Correction de l'erreur "unknown"
    console.error('Erreur Upload Backend:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


/**
 * GET /api/documents/lawyer/:lawyerId
 * Récupère les documents récents d'un avocat (tous dossiers confondus)
 */
router.get('/lawyer/:lawyerId', async (req: Request, res: Response) => {
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
 */
router.get('/case/:caseId', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const result = await pool.query(
      'SELECT * FROM documents WHERE case_id = $1 ORDER BY created_at DESC',
      [caseId]
    );
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
router.delete('/:id', async (req: Request, res: Response) => {
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